/**
 * User Service
 * Handles user profile management
 */

import { query } from '../config/database';
import logger from '../utils/logger';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { UserProfile } from '../types';

interface UserRecord {
  id: string;
  name: string;
  mobile_number: string;
  location: string;
  primary_crop: string;
  language: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get user profile by ID
 * @param userId User ID
 * @returns User profile
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const result = await query<UserRecord>(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('USER_NOT_FOUND', 'User not found');
    }

    const user = result.rows[0];

    return {
      id: user.id,
      name: user.name,
      mobileNumber: user.mobile_number,
      location: user.location,
      primaryCrop: user.primary_crop,
      language: user.language as 'hi' | 'en' | 'te',
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  } catch (error) {
    logger.error('Failed to get user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param userId User ID
 * @param updates Profile updates
 * @returns Updated user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: {
    name?: string;
    location?: string;
    primaryCrop?: string;
    language?: 'hi' | 'en' | 'te';
  }
): Promise<UserProfile> => {
  try {
    // Validate that at least one field is being updated
    if (Object.keys(updates).length === 0) {
      throw new BadRequestError(
        'NO_UPDATES',
        'At least one field must be updated'
      );
    }

    // Validate language if provided
    if (updates.language) {
      const validLanguages = ['hi', 'en', 'te'];
      if (!validLanguages.includes(updates.language)) {
        throw new BadRequestError(
          'INVALID_LANGUAGE',
          'Language must be one of: hi, en, te'
        );
      }
    }

    // Validate fields are not empty
    if (updates.name !== undefined && updates.name.trim().length === 0) {
      throw new BadRequestError('INVALID_NAME', 'Name cannot be empty');
    }

    if (updates.location !== undefined && updates.location.trim().length === 0) {
      throw new BadRequestError('INVALID_LOCATION', 'Location cannot be empty');
    }

    if (updates.primaryCrop !== undefined && updates.primaryCrop.trim().length === 0) {
      throw new BadRequestError('INVALID_CROP', 'Primary crop cannot be empty');
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.location !== undefined) {
      updateFields.push(`location = $${paramIndex++}`);
      values.push(updates.location);
    }

    if (updates.primaryCrop !== undefined) {
      updateFields.push(`primary_crop = $${paramIndex++}`);
      values.push(updates.primaryCrop);
    }

    if (updates.language !== undefined) {
      updateFields.push(`language = $${paramIndex++}`);
      values.push(updates.language);
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);

    // Add user ID as last parameter
    values.push(userId);

    // Execute update
    const result = await query<UserRecord>(
      `UPDATE users 
       SET ${updateFields.join(', ')} 
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('USER_NOT_FOUND', 'User not found');
    }

    const user = result.rows[0];

    logger.info('User profile updated', {
      userId,
      updatedFields: Object.keys(updates),
    });

    // Log to audit_logs (TODO: implement audit service)

    return {
      id: user.id,
      name: user.name,
      mobileNumber: user.mobile_number,
      location: user.location,
      primaryCrop: user.primary_crop,
      language: user.language as 'hi' | 'en' | 'te',
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  } catch (error) {
    logger.error('Failed to update user profile:', error);
    throw error;
  }
};

/**
 * Get user preferences (language)
 * @param userId User ID
 * @returns User preferences
 */
export const getUserPreferences = async (
  userId: string
): Promise<{ language: string }> => {
  try {
    const result = await query(
      'SELECT language FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('USER_NOT_FOUND', 'User not found');
    }

    return {
      language: result.rows[0].language,
    };
  } catch (error) {
    logger.error('Failed to get user preferences:', error);
    throw error;
  }
};
