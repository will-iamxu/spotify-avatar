/**
 * Debug endpoint to see the actual format of the AWS secret
 */

import { NextResponse } from 'next/server';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export async function GET() {
  try {
    const secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-2',
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined,
    });

    const command = new GetSecretValueCommand({
      SecretId: process.env.DATABASE_SECRET_NAME,
    });

    const response = await secretsClient.send(command);
    
    if (!response.SecretString) {
      throw new Error('Secret value is empty or binary');
    }

    const secret = JSON.parse(response.SecretString);
    
    return NextResponse.json({
      success: true,
      secretName: process.env.DATABASE_SECRET_NAME,
      secretKeys: Object.keys(secret),
      secretStructure: secret,
      // Hide sensitive values for debugging
      maskedSecret: Object.keys(secret).reduce((acc, key) => {
        acc[key] = key.toLowerCase().includes('password') ? '[HIDDEN]' : secret[key];
        return acc;
      }, {} as any)
    });

  } catch (error) {
    console.error('Failed to retrieve secret for debugging:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      secretName: process.env.DATABASE_SECRET_NAME
    }, { status: 500 });
  }
}