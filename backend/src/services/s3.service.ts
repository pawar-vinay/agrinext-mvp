/**
 * S3 Service
 * Handles image upload to AWS S3 and presigned URL generation
 */

import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { env } from '../config/env';
import logger from '../utils/logger';
import { InternalServerError } from '../utils/errors';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
});

const s3 = new AWS.S3();

interface ImageMetadata {
  size: number;
  format: string;
  width: number;
  height: number;
}

interface UploadResult {
  imageUrl: string;
  imageKey: string;
  metadata: ImageMetadata;
}

/**
 * Validate image format
 * @param buffer Image buffer
 * @returns True if format is valid
 */
const validateImageFormat = async (buffer: Buffer): Promise<boolean> => {
  try {
    const metadata = await sharp(buffer).metadata();
    const validFormats = ['jpeg', 'jpg', 'png', 'heic', 'heif'];
    return validFormats.includes(metadata.format || '');
  } catch (error) {
    return false;
  }
};

/**
 * Compress image to maximum 2MB
 * @param buffer Image buffer
 * @returns Compressed image buffer and metadata
 */
const compressImage = async (
  buffer: Buffer
): Promise<{ buffer: Buffer; metadata: ImageMetadata }> => {
  const maxSize = 2 * 1024 * 1024; // 2MB

  // Get original metadata
  const originalMetadata = await sharp(buffer).metadata();

  // If already under 2MB, return as is
  if (buffer.length <= maxSize) {
    return {
      buffer,
      metadata: {
        size: buffer.length,
        format: originalMetadata.format || 'jpeg',
        width: originalMetadata.width || 0,
        height: originalMetadata.height || 0,
      },
    };
  }

  // Compress image
  let quality = 90;
  let compressedBuffer = buffer;

  while (compressedBuffer.length > maxSize && quality > 10) {
    compressedBuffer = await sharp(buffer)
      .jpeg({ quality, progressive: true })
      .toBuffer();

    quality -= 10;
  }

  const compressedMetadata = await sharp(compressedBuffer).metadata();

  logger.info('Image compressed', {
    originalSize: buffer.length,
    compressedSize: compressedBuffer.length,
    quality,
  });

  return {
    buffer: compressedBuffer,
    metadata: {
      size: compressedBuffer.length,
      format: compressedMetadata.format || 'jpeg',
      width: compressedMetadata.width || 0,
      height: compressedMetadata.height || 0,
    },
  };
};

/**
 * Generate S3 key with folder structure: {year}/{month}/{user_id}/{filename}
 * @param userId User ID
 * @returns S3 key
 */
const generateS3Key = (userId: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const filename = `${uuidv4()}.jpg`;

  return `${year}/${month}/${userId}/${filename}`;
};

/**
 * Upload image to S3
 * @param buffer Image buffer
 * @param userId User ID
 * @returns Upload result with URL and metadata
 */
export const uploadImage = async (
  buffer: Buffer,
  userId: string
): Promise<UploadResult> => {
  try {
    // Validate image format
    const isValidFormat = await validateImageFormat(buffer);
    if (!isValidFormat) {
      throw new InternalServerError(
        'INVALID_IMAGE_FORMAT',
        'Image format must be JPEG, PNG, or HEIC'
      );
    }

    // Compress image
    const { buffer: compressedBuffer, metadata } = await compressImage(buffer);

    // Generate S3 key
    const key = generateS3Key(userId);

    // Upload to S3
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: compressedBuffer,
      ContentType: `image/${metadata.format}`,
      ServerSideEncryption: 'AES256',
    };

    await s3.upload(uploadParams).promise();

    logger.info('Image uploaded to S3', {
      key,
      size: metadata.size,
      userId,
    });

    return {
      imageUrl: `s3://${env.AWS_S3_BUCKET}/${key}`,
      imageKey: key,
      metadata,
    };
  } catch (error) {
    logger.error('Failed to upload image to S3:', error);
    throw new InternalServerError(
      'S3_UPLOAD_FAILED',
      'Failed to upload image. Please try again.'
    );
  }
};

/**
 * Generate presigned URL for image access
 * @param key S3 key
 * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL
 */
export const generatePresignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    };

    const url = await s3.getSignedUrlPromise('getObject', {
      ...params,
      Expires: expiresIn,
    });

    return url;
  } catch (error) {
    logger.error('Failed to generate presigned URL:', error);
    throw new InternalServerError(
      'PRESIGNED_URL_FAILED',
      'Failed to generate image URL'
    );
  }
};

/**
 * Delete image from S3
 * @param key S3 key
 */
export const deleteImage = async (key: string): Promise<void> => {
  try {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    };

    await s3.deleteObject(params).promise();

    logger.info('Image deleted from S3', { key });
  } catch (error) {
    logger.error('Failed to delete image from S3:', error);
    // Don't throw error - deletion failure shouldn't block other operations
  }
};
