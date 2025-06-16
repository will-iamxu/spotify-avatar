/**
 * Dynamic Prisma database client with AWS Secrets Manager integration
 * 
 * This module provides a Prisma client that can dynamically retrieve
 * database credentials from AWS Secrets Manager, supporting automatic
 * password rotation.
 * 
 * @module db-dynamic
 */

import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from './secrets';

/**
 * Environment configuration for database connection
 */
interface DatabaseConfig {
  useSecretsManager: boolean;
  secretName?: string;
  fallbackUrl?: string;
}

/**
 * Get database configuration from environment variables
 */
function getDatabaseConfig(): DatabaseConfig {
  const useSecretsManager = process.env.USE_SECRETS_MANAGER === 'true';
  const secretName = process.env.DATABASE_SECRET_NAME;
  const fallbackUrl = process.env.DATABASE_URL;

  return {
    useSecretsManager,
    secretName,
    fallbackUrl,
  };
}

/**
 * Cache for Prisma client instances with their connection URLs
 */
let cachedClient: PrismaClient | null = null;
let cachedUrl: string | null = null;
let clientCacheExpiry: number = 0;
const CLIENT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Create a new Prisma client with the given database URL
 */
function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

/**
 * Get database URL either from Secrets Manager or environment variable
 */
async function getResolvedDatabaseUrl(): Promise<string> {
  const config = getDatabaseConfig();

  if (config.useSecretsManager && config.secretName) {
    console.log('Using AWS Secrets Manager for database credentials');
    return await getDatabaseUrl(config.secretName);
  } else if (config.fallbackUrl) {
    console.log('Using DATABASE_URL from environment variables');
    return config.fallbackUrl;
  } else {
    throw new Error('No database configuration found. Set DATABASE_URL or configure Secrets Manager.');
  }
}

/**
 * Get or create a Prisma client instance with dynamic credentials
 * 
 * This function:
 * 1. Checks if we have a cached client that's still valid
 * 2. If Secrets Manager is enabled, retrieves fresh credentials
 * 3. Creates a new client if the URL has changed or cache expired
 * 4. Returns the appropriate client instance
 */
export async function getDynamicPrismaClient(): Promise<PrismaClient> {
  const currentTime = Date.now();

  try {
    // Get the current database URL
    const currentUrl = await getResolvedDatabaseUrl();

    // Return cached client if it's still valid and URL hasn't changed
    if (
      cachedClient &&
      cachedUrl === currentUrl &&
      currentTime < clientCacheExpiry
    ) {
      return cachedClient;
    }

    // Disconnect old client if URL changed
    if (cachedClient && cachedUrl !== currentUrl) {
      console.log('Database URL changed, disconnecting old client');
      await cachedClient.$disconnect();
      cachedClient = null;
    }

    // Create new client
    console.log('Creating new Prisma client with fresh credentials');
    const newClient = createPrismaClient(currentUrl);

    // Test the connection
    await newClient.$connect();
    console.log('Database connection established successfully');

    // Cache the new client
    cachedClient = newClient;
    cachedUrl = currentUrl;
    clientCacheExpiry = currentTime + CLIENT_CACHE_DURATION;

    return newClient;

  } catch (error) {
    console.error('Failed to create dynamic Prisma client:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Disconnect and clear all cached clients
 * Useful for graceful shutdown or testing
 */
export async function disconnectDynamicClient(): Promise<void> {
  if (cachedClient) {
    await cachedClient.$disconnect();
    cachedClient = null;
    cachedUrl = null;
    clientCacheExpiry = 0;
  }
}

/**
 * Global type extension for Prisma client storage
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * For backwards compatibility, export a synchronous client
 * This should only be used in non-production environments
 * or when you're sure the database URL won't change
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Store globally in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}