/**
 * Prisma database client configuration
 * 
 * This module sets up a singleton Prisma client instance that works properly
 * in both development and production environments, including serverless deployments.
 * 
 * In development, it reuses the same client instance to prevent connection limit issues.
 * In production, it creates a new client instance for each serverless function.
 * 
 * @module db
 */

import { PrismaClient } from '@prisma/client'

/**
 * Global type extension to store Prisma client instance
 * Prevents TypeScript errors when accessing globalThis.prisma
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Singleton Prisma client instance
 * 
 * In development, reuses the existing global instance to prevent
 * "Too many clients" errors during hot reloads.
 * In production, creates a new instance for each deployment.
 * 
 * @constant {PrismaClient} prisma - Database client instance
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Store the client globally in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma