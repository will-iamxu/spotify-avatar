/**
 * AWS Secrets Manager Integration
 * 
 * Handles dynamic retrieval of database credentials from AWS Secrets Manager
 * with automatic rotation support.
 */

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

/**
 * Database credentials structure from Secrets Manager
 */
interface DatabaseSecret {
  username: string;
  password: string;
  engine: string;
  host: string;
  port: number;
  dbname: string;
  dbInstanceIdentifier: string;
}

/**
 * Cache for database credentials to avoid excessive API calls
 */
let cachedSecret: DatabaseSecret | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * AWS Secrets Manager client
 */
const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined, // Use default credentials if not provided
});

/**
 * Retrieves database credentials from AWS Secrets Manager
 * 
 * @param secretName - Name of the secret in AWS Secrets Manager
 * @returns Database credentials object
 */
export async function getDatabaseCredentials(secretName: string): Promise<DatabaseSecret> {
  // Return cached credentials if still valid
  if (cachedSecret && Date.now() < cacheExpiry) {
    return cachedSecret;
  }

  try {
    console.log(`Retrieving secret: ${secretName}`);
    
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });

    const response = await secretsClient.send(command);
    
    if (!response.SecretString) {
      throw new Error('Secret value is empty or binary');
    }

    const secret: DatabaseSecret = JSON.parse(response.SecretString);
    
    // Validate required fields
    if (!secret.username || !secret.password || !secret.host || !secret.port || !secret.dbname) {
      throw new Error('Invalid secret format - missing required database fields');
    }

    // Cache the credentials
    cachedSecret = secret;
    cacheExpiry = Date.now() + CACHE_DURATION;
    
    console.log(`Successfully retrieved credentials for database: ${secret.dbname}`);
    return secret;
    
  } catch (error) {
    console.error('Failed to retrieve database credentials from Secrets Manager:', error);
    throw new Error(`Failed to get database credentials: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Builds a PostgreSQL connection URL from Secrets Manager credentials
 * 
 * @param secretName - Name of the secret in AWS Secrets Manager
 * @returns Complete PostgreSQL connection URL
 */
export async function getDatabaseUrl(secretName: string): Promise<string> {
  const credentials = await getDatabaseCredentials(secretName);
  
  // URL encode the password to handle special characters
  const encodedPassword = encodeURIComponent(credentials.password);
  
  const connectionUrl = `postgresql://${credentials.username}:${encodedPassword}@${credentials.host}:${credentials.port}/${credentials.dbname}?schema=public&sslmode=require`;
  
  return connectionUrl;
}

/**
 * Clears the cached credentials (useful for testing or force refresh)
 */
export function clearCredentialsCache(): void {
  cachedSecret = null;
  cacheExpiry = 0;
}