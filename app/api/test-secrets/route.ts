/**
 * Test endpoint for AWS Secrets Manager integration
 * 
 * This endpoint tests the dynamic database credentials retrieval
 * and helps debug any Secrets Manager configuration issues.
 */

import { NextResponse } from 'next/server';
import { getDynamicPrismaClient } from '../../../lib/db-dynamic';
import { getDatabaseCredentials } from '../../../lib/secrets';

export async function GET() {
  try {
    // Test Secrets Manager credential retrieval
    if (process.env.USE_SECRETS_MANAGER === 'true' && process.env.DATABASE_SECRET_NAME) {
      console.log('Testing Secrets Manager integration...');
      
      // Test credential retrieval
      const credentials = await getDatabaseCredentials(process.env.DATABASE_SECRET_NAME);
      
      // Test database connection
      const prisma = await getDynamicPrismaClient();
      const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
      
      return NextResponse.json({
        success: true,
        message: 'Secrets Manager integration working',
        database: {
          connected: true,
          host: credentials.host,
          dbname: credentials.dbname,
          currentTime: result
        },
        secretsManager: {
          enabled: true,
          secretName: process.env.DATABASE_SECRET_NAME,
          region: process.env.AWS_REGION
        }
      });
    } else {
      // Test fallback database connection
      console.log('Testing fallback database connection...');
      
      const prisma = await getDynamicPrismaClient();
      const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
      
      return NextResponse.json({
        success: true,
        message: 'Fallback database connection working',
        database: {
          connected: true,
          currentTime: result
        },
        secretsManager: {
          enabled: false,
          reason: 'USE_SECRETS_MANAGER not set to true or DATABASE_SECRET_NAME missing'
        }
      });
    }
    
  } catch (error) {
    console.error('Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      secretsManager: {
        enabled: process.env.USE_SECRETS_MANAGER === 'true',
        secretName: process.env.DATABASE_SECRET_NAME,
        region: process.env.AWS_REGION
      }
    }, { status: 500 });
  }
}