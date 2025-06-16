/**
 * Debug endpoint to help find AWS Secrets Manager configuration issues
 */

import { NextResponse } from 'next/server';
import { SecretsManagerClient, ListSecretsCommand } from "@aws-sdk/client-secrets-manager";

export async function GET() {
  try {
    const secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-2',
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined,
    });

    // List all secrets in the region
    const listCommand = new ListSecretsCommand({
      MaxResults: 50
    });
    
    const response = await secretsClient.send(listCommand);
    
    return NextResponse.json({
      success: true,
      region: process.env.AWS_REGION || 'us-east-2',
      searchingFor: process.env.DATABASE_SECRET_NAME,
      availableSecrets: response.SecretList?.map(secret => ({
        name: secret.Name,
        description: secret.Description,
        lastChanged: secret.LastChangedDate,
        createdDate: secret.CreatedDate
      })) || [],
      totalSecrets: response.SecretList?.length || 0,
      suggestion: response.SecretList?.find(s => 
        s.Name?.includes('rds') || 
        s.Name?.includes('database') || 
        s.Name?.includes('postgres') ||
        s.Name?.includes('spotify')
      )?.Name || 'No database-related secrets found'
    });

  } catch (error) {
    console.error('Failed to list secrets:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      region: process.env.AWS_REGION || 'us-east-2',
      searchingFor: process.env.DATABASE_SECRET_NAME,
      awsCredentials: {
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
      }
    }, { status: 500 });
  }
}