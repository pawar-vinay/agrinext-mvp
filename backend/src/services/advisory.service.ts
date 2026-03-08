/**
 * Advisory Service
 * Handles farming advisory queries and history
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { generateAdviceWithQueue } from './openai.service';
import { translateContent } from './translation.service';
import logger from '../utils/logger';
import { AdvisoryResponse, PaginatedResponse } from '../types';
import { BadRequestError } from '../utils/errors';

interface AdvisoryRecord {
  id: string;
  user_id: string;
  query_text: string;
  response_text: string;
  language: string;
  rating: number | null;
  created_at: Date;
}

interface UserProfile {
  location: string;
  primary_crop: string;
  language: string;
}

/**
 * Get user profile for context
 * @param userId User ID
 * @returns User profile
 */
const getUserProfile = async (userId: string): Promise<UserProfile> => {
  // Check if demo mode
  const isDemoMode = userId.startsWith('demo-user-');
  
  if (isDemoMode) {
    // Return mock profile for demo users
    return {
      location: 'Maharashtra',
      primary_crop: 'Rice',
      language: 'en',
    };
  }

  try {
    const result = await query(
      'SELECT location, primary_crop, language FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return {
      location: result.rows[0].location,
      primary_crop: result.rows[0].primary_crop,
      language: result.rows[0].language,
    };
  } catch (error) {
    logger.warn('Failed to get user profile, using defaults:', error);
    // Fallback to defaults if database fails
    return {
      location: 'India',
      primary_crop: 'Mixed Crops',
      language: 'en',
    };
  }
};

/**
 * Generate farming advice
 * @param queryText User's question
 * @param userId User ID
 * @param language User's language
 * @returns Advisory response
 */
export const generateAdvisory = async (
  queryText: string,
  userId: string,
  language: string = 'en'
): Promise<AdvisoryResponse> => {
  try {
    logger.info('Generating advisory', { userId, queryLength: queryText.length });

    // Validate query length
    if (queryText.length > 500) {
      throw new BadRequestError(
        'QUERY_TOO_LONG',
        'Query must be less than 500 characters'
      );
    }

    if (queryText.trim().length === 0) {
      throw new BadRequestError(
        'EMPTY_QUERY',
        'Query cannot be empty'
      );
    }

    // Get user profile for context
    const userProfile = await getUserProfile(userId);

    // Generate advice using OpenAI
    const advice = await generateAdviceWithQueue(queryText, {
      location: userProfile.location,
      primaryCrop: userProfile.primary_crop,
      language,
    });

    // If language is not English and OpenAI didn't respond in target language,
    // translate the response
    let translatedAdvice = advice;
    if (language !== 'en' && !advice.match(/[\u0900-\u097F]/) && !advice.match(/[\u0C00-\u0C7F]/)) {
      // No Hindi or Telugu characters detected, translate
      translatedAdvice = await translateContent(advice, language);
    }

    // Store advisory in database (skip for demo users)
    const advisoryId = uuidv4();
    const isDemoMode = userId.startsWith('demo-user-');
    
    if (!isDemoMode) {
      try {
        await query(
          `INSERT INTO advisories (id, user_id, query_text, response_text, language)
           VALUES ($1, $2, $3, $4, $5)`,
          [advisoryId, userId, queryText, translatedAdvice, language]
        );
        logger.info('Advisory generated and stored', {
          advisoryId,
          userId,
        });
      } catch (dbError) {
        // Log database error but don't fail the request
        logger.warn('Failed to store advisory in database, continuing anyway', {
          advisoryId,
          userId,
          error: dbError,
        });
      }
    } else {
      logger.info('Advisory generated (demo mode - not stored)', {
        advisoryId,
        userId,
      });
    }

    return {
      id: advisoryId,
      query: queryText,
      response: translatedAdvice,
      language,
      createdAt: new Date(),
    };
  } catch (error) {
    logger.error('Failed to generate advisory:', error);
    throw error;
  }
};

/**
 * Get advisory history for user
 * @param userId User ID
 * @param page Page number
 * @param limit Items per page
 * @returns Paginated advisory results
 */
export const getAdvisoryHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<AdvisoryResponse>> => {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM advisories WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get advisories
    const result = await query<AdvisoryRecord>(
      `SELECT * FROM advisories 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const advisories = result.rows.map((record) => ({
      id: record.id,
      query: record.query_text,
      response: record.response_text,
      language: record.language,
      createdAt: record.created_at,
      rating: record.rating,
    }));

    return {
      data: advisories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to get advisory history:', error);
    throw error;
  }
};

/**
 * Rate an advisory
 * @param advisoryId Advisory ID
 * @param userId User ID (for authorization)
 * @param rating Rating value (1-5)
 */
export const rateAdvisory = async (
  advisoryId: string,
  userId: string,
  rating: number
): Promise<void> => {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestError(
        'INVALID_RATING',
        'Rating must be between 1 and 5'
      );
    }

    // Check if advisory exists and belongs to user
    const result = await query(
      'SELECT id FROM advisories WHERE id = $1 AND user_id = $2',
      [advisoryId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Advisory not found or access denied');
    }

    // Update rating
    await query(
      'UPDATE advisories SET rating = $1 WHERE id = $2',
      [rating, advisoryId]
    );

    logger.info('Advisory rated', { advisoryId, rating });
  } catch (error) {
    logger.error('Failed to rate advisory:', error);
    throw error;
  }
};
