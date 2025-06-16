/**
 * AWS Secrets Manager Integration
 * 
 * Handles dynamic retrieval of database credentials from AWS Secrets Manager
 * with automatic rotation support.
 */

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

/**
 * Database credentials structure from Secrets Manager
 * RDS-managed secrets only contain username/password
 */
interface DatabaseSecret {
  username: string;
  password: string;
  engine?: string;
  host?: string;
  port?: number;
  dbname?: string;
  dbInstanceIdentifier?: string;
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
    
    // Validate required fields (RDS secrets only have username/password)
    if (!secret.username || !secret.password) {
      throw new Error('Invalid secret format - missing username or password');
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
 * For RDS-managed secrets, we get username/password and use environment vars for host/port/db
 * 
 * @param secretName - Name of the secret in AWS Secrets Manager
 * @returns Complete PostgreSQL connection URL
 */
export async function getDatabaseUrl(secretName: string): Promise<string> {
  const credentials = await getDatabaseCredentials(secretName);
  
  // URL encode the password to handle special characters
  const encodedPassword = encodeURIComponent(credentials.password);
  
  // For RDS secrets, get host/port/database from environment or use defaults
  const host = credentials.host || process.env.RDS_HOST || 'spotify-avatar-db.cbu6aq6qujw9.us-east-2.rds.amazonaws.com';
  const port = credentials.port || parseInt(process.env.RDS_PORT || '5432');
  const dbname = credentials.dbname || process.env.RDS_DATABASE || 'spotify_avatar';
  
  const connectionUrl = `postgresql://${credentials.username}:${encodedPassword}@${host}:${port}/${dbname}?schema=public&sslmode=require`;
  
  return connectionUrl;
}

/**
 * Clears the cached credentials (useful for testing or force refresh)
 */
export function clearCredentialsCache(): void {
  cachedSecret = null;
  cacheExpiry = 0;
}