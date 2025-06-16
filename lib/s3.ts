/**
 * AWS S3 integration for secure image storage and retrieval
 * 
 * This module handles uploading generated avatar images to AWS S3 and creating
 * secure presigned URLs for downloading. All images are stored privately and
 * accessed through time-limited signed URLs for security.
 * 
 * @module s3
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * AWS S3 client instance configured with environment credentials
 * 
 * Uses AWS SDK v3 with explicit credentials from environment variables.
 * Defaults to us-east-1 region if not specified.
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

/**
 * S3 bucket name for storing avatar images
 * Retrieved from environment variables
 */
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

/**
 * Uploads an image buffer to AWS S3 with private access control
 * 
 * @param {Buffer} buffer - Image data as a Buffer
 * @param {string} key - S3 object key (file path within bucket)
 * @param {string} [contentType='image/png'] - MIME type of the image
 * @returns {Promise<string>} S3 URI in format s3://bucket/key
 * 
 * @example
 * const imageBuffer = Buffer.from(imageData);
 * const s3Uri = await uploadImageToS3(imageBuffer, 'avatars/user123/avatar456.png');
 */
export async function uploadImageToS3(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/png'
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'private', // Ensure images are private and require signed URLs
  })

  await s3Client.send(command)
  return `s3://${BUCKET_NAME}/${key}`
}

/**
 * Generates a presigned URL for downloading a private S3 object
 * 
 * Creates a time-limited URL that allows access to private S3 objects
 * without requiring AWS credentials. URLs expire after 1 hour for security.
 * 
 * @param {string} key - S3 object key to generate URL for
 * @returns {Promise<string>} Presigned download URL
 * 
 * @example
 * const downloadUrl = await getSignedDownloadUrl('avatars/user123/avatar456.png');
 * // Use downloadUrl in <img src={downloadUrl} /> or fetch()
 */
export async function getSignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  // URL expires in 1 hour (3600 seconds) for security
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

/**
 * Generates a standardized S3 key for avatar images
 * 
 * Creates a consistent file path structure for organizing avatar images
 * by user ID and avatar ID. Ensures proper organization and prevents conflicts.
 * 
 * @param {string} userId - Database ID of the user
 * @param {string} avatarId - Database ID of the avatar
 * @returns {string} S3 key in format 'avatars/{userId}/{avatarId}.png'
 * 
 * @example
 * const key = generateAvatarKey('user_123', 'avatar_456');
 * // Returns: 'avatars/user_123/avatar_456.png'
 */
export function generateAvatarKey(userId: string, avatarId: string): string {
  return `avatars/${userId}/${avatarId}.png`
}