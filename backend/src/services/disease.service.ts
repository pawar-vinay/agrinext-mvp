/**
 * Disease Detection Service
 * Orchestrates disease detection workflow
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { uploadImage, generatePresignedUrl } from './s3.service';
import { detectDiseaseWithFallback, getTreatmentRecommendations } from './ai.service';
import { translateContent } from './translation.service';
import logger from '../utils/logger';
import { DetectionResult, DetectionDetail, PaginatedResponse } from '../types';

interface DetectionRecord {
  id: string;
  user_id: string;
  image_url: string;
  image_key: string;
  disease_name: string;
  severity: string;
  confidence_score: number;
  recommendations: string;
  image_size: number;
  image_format: string;
  image_width: number;
  image_height: number;
  created_at: Date;
}

/**
 * Detect disease from image
 * @param imageBuffer Image buffer
 * @param userId User ID
 * @param language User's language
 * @returns Detection result
 */
export const detectDisease = async (
  imageBuffer: Buffer,
  userId: string,
  language: string = 'en'
): Promise<DetectionResult> => {
  try {
    logger.info('Starting disease detection workflow', { userId });

    // Check if we're in demo mode (user ID starts with 'demo-user-')
    const isDemoMode = userId.startsWith('demo-user-');

    let imageUrl: string;
    let imageKey: string;
    let metadata: any;
    const detectionId = uuidv4();

    // Step 1: Upload image to S3 (skip in demo mode)
    if (!isDemoMode) {
      try {
        const uploadResult = await uploadImage(imageBuffer, userId);
        imageUrl = uploadResult.imageUrl;
        imageKey = uploadResult.imageKey;
        metadata = uploadResult.metadata;
      } catch (error) {
        logger.warn('S3 upload failed, using demo mode fallback:', error);
        // Fallback to demo mode if S3 fails
        imageUrl = 'demo://local-image';
        imageKey = `demo/${detectionId}.jpg`;
        metadata = { size: imageBuffer.length, format: 'jpeg', width: 800, height: 600 };
      }
    } else {
      // Demo mode: use placeholder values
      imageUrl = 'demo://local-image';
      imageKey = `demo/${detectionId}.jpg`;
      metadata = { size: imageBuffer.length, format: 'jpeg', width: 800, height: 600 };
    }

    // Step 2: Run AI inference
    const aiResult = await detectDiseaseWithFallback(imageBuffer);

    // Step 3: Get treatment recommendations
    const recommendations = getTreatmentRecommendations(
      aiResult.diseaseName,
      language
    );

    // Step 4: Translate disease name and recommendations (skip in demo mode)
    let translatedDiseaseName = aiResult.diseaseName;
    let translatedRecommendations = recommendations;

    if (!isDemoMode) {
      try {
        translatedDiseaseName = await translateContent(
          aiResult.diseaseName,
          language
        );

        translatedRecommendations = await Promise.all(
          recommendations.map((rec) => translateContent(rec, language))
        );
      } catch (error) {
        logger.warn('Translation failed, using original text:', error);
        // Use original text if translation fails
      }
    }

    // Step 5: Store detection result in database (skip in demo mode)
    if (!isDemoMode) {
      try {
        await query(
          `INSERT INTO disease_detections (
            id, user_id, image_url, image_key, disease_name, severity,
            confidence_score, recommendations, image_size, image_format,
            image_width, image_height
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            detectionId,
            userId,
            imageUrl,
            imageKey,
            translatedDiseaseName,
            aiResult.severity,
            aiResult.confidence,
            JSON.stringify(translatedRecommendations),
            metadata.size,
            metadata.format,
            metadata.width,
            metadata.height,
          ]
        );
      } catch (error) {
        logger.warn('Database insert failed (demo mode or DB unavailable):', error);
        // Continue without saving to database
      }
    }

    // Step 6: Generate presigned URL for image access (skip in demo mode)
    let presignedUrl = imageUrl;
    if (!isDemoMode && !imageUrl.startsWith('demo://')) {
      try {
        presignedUrl = await generatePresignedUrl(imageKey);
      } catch (error) {
        logger.warn('Presigned URL generation failed:', error);
        // Use original URL if presigned URL fails
      }
    }

    logger.info('Disease detection completed', {
      detectionId,
      diseaseName: translatedDiseaseName,
      confidence: aiResult.confidence,
      demoMode: isDemoMode,
    });

    return {
      id: detectionId,
      diseaseName: translatedDiseaseName,
      severity: aiResult.severity,
      confidenceScore: aiResult.confidence,
      recommendations: translatedRecommendations,
      imageUrl: presignedUrl,
      detectedAt: new Date(),
    };
  } catch (error) {
    logger.error('Disease detection workflow failed:', error);
    throw error;
  }
};

/**
 * Get detection history for user
 * @param userId User ID
 * @param page Page number
 * @param limit Items per page
 * @returns Paginated detection results
 */
export const getDetectionHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<DetectionResult>> => {
  try {
    // Check if we're in demo mode
    const isDemoMode = userId.startsWith('demo-user-');

    if (isDemoMode) {
      // Return empty history for demo users
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM disease_detections WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get detections
    const result = await query<DetectionRecord>(
      `SELECT * FROM disease_detections 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Generate presigned URLs for all images
    const detections = await Promise.all(
      result.rows.map(async (record) => {
        const presignedUrl = await generatePresignedUrl(record.image_key);
        const recommendations = JSON.parse(record.recommendations);

        return {
          id: record.id,
          diseaseName: record.disease_name,
          severity: record.severity as 'low' | 'medium' | 'high',
          confidenceScore: parseFloat(record.confidence_score.toString()),
          recommendations,
          imageUrl: presignedUrl,
          detectedAt: record.created_at,
        };
      })
    );

    return {
      data: detections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to get detection history:', error);
    // Return empty history if database fails
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
};

/**
 * Get detection by ID
 * @param detectionId Detection ID
 * @param userId User ID (for authorization)
 * @returns Detection detail
 */
export const getDetectionById = async (
  detectionId: string,
  userId: string
): Promise<DetectionDetail> => {
  try {
    const result = await query<DetectionRecord>(
      'SELECT * FROM disease_detections WHERE id = $1 AND user_id = $2',
      [detectionId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Detection not found');
    }

    const record = result.rows[0];

    // Generate presigned URL
    const presignedUrl = await generatePresignedUrl(record.image_key);
    const recommendations = JSON.parse(record.recommendations);

    return {
      id: record.id,
      diseaseName: record.disease_name,
      severity: record.severity as 'low' | 'medium' | 'high',
      confidenceScore: parseFloat(record.confidence_score.toString()),
      recommendations,
      imageUrl: presignedUrl,
      detectedAt: record.created_at,
      imageMetadata: {
        size: record.image_size,
        format: record.image_format,
        dimensions: {
          width: record.image_width,
          height: record.image_height,
        },
      },
    };
  } catch (error) {
    logger.error('Failed to get detection by ID:', error);
    throw error;
  }
};
