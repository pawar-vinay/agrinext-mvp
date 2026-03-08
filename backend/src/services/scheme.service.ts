/**
 * Government Schemes Service
 * Handles government schemes retrieval and filtering
 */

import { query } from '../config/database';
import { translateContent } from './translation.service';
import logger from '../utils/logger';
import { NotFoundError } from '../utils/errors';
import { Scheme, SchemeDetail } from '../types';

interface SchemeRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  eligibility: string;
  benefits: string;
  application_process: string;
  is_active: boolean;
  created_at: Date;
}

// Simple in-memory cache for schemes
let schemesCache: SchemeRecord[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get all schemes from database with caching
 * @returns All active schemes
 */
const getAllSchemesFromDB = async (): Promise<SchemeRecord[]> => {
  // Check cache
  const now = Date.now();
  if (schemesCache && (now - cacheTimestamp) < CACHE_TTL) {
    logger.debug('Returning schemes from cache');
    return schemesCache;
  }

  // Fetch from database
  const result = await query<SchemeRecord>(
    'SELECT * FROM government_schemes WHERE is_active = true ORDER BY name'
  );

  // Update cache
  schemesCache = result.rows;
  cacheTimestamp = now;

  logger.info('Schemes loaded from database', { count: result.rows.length });

  return result.rows;
};

/**
 * Translate scheme to user's language
 * @param scheme Scheme record
 * @param language Target language
 * @returns Translated scheme
 */
const translateScheme = async (
  scheme: SchemeRecord,
  language: string
): Promise<SchemeRecord> => {
  if (language === 'en') {
    return scheme;
  }

  // Translate all text fields
  const [name, description, eligibility, benefits, applicationProcess] = await Promise.all([
    translateContent(scheme.name, language),
    translateContent(scheme.description, language),
    translateContent(scheme.eligibility, language),
    translateContent(scheme.benefits, language),
    translateContent(scheme.application_process, language),
  ]);

  return {
    ...scheme,
    name,
    description,
    eligibility,
    benefits,
    application_process: applicationProcess,
  };
};

/**
 * Get all government schemes
 * @param language User's language
 * @returns List of schemes
 */
export const getAllSchemes = async (
  language: string = 'en'
): Promise<Scheme[]> => {
  try {
    const schemes = await getAllSchemesFromDB();

    // Translate schemes if needed
    const translatedSchemes = await Promise.all(
      schemes.map(async (scheme) => {
        const translated = await translateScheme(scheme, language);
        return {
          id: translated.id,
          name: translated.name,
          description: translated.description,
          category: translated.category as 'subsidy' | 'loan' | 'insurance' | 'training',
        };
      })
    );

    return translatedSchemes;
  } catch (error) {
    logger.error('Failed to get all schemes:', error);
    throw error;
  }
};

/**
 * Get scheme by ID
 * @param schemeId Scheme ID
 * @param language User's language
 * @returns Scheme details
 */
export const getSchemeById = async (
  schemeId: string,
  language: string = 'en'
): Promise<SchemeDetail> => {
  try {
    const result = await query<SchemeRecord>(
      'SELECT * FROM government_schemes WHERE id = $1 AND is_active = true',
      [schemeId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('SCHEME_NOT_FOUND', 'Scheme not found');
    }

    const scheme = result.rows[0];

    // Translate scheme
    const translated = await translateScheme(scheme, language);

    return {
      id: translated.id,
      name: translated.name,
      description: translated.description,
      category: translated.category as 'subsidy' | 'loan' | 'insurance' | 'training',
      eligibility: translated.eligibility,
      benefits: translated.benefits,
      applicationProcess: translated.application_process,
    };
  } catch (error) {
    logger.error('Failed to get scheme by ID:', error);
    throw error;
  }
};

/**
 * Filter schemes by category and keyword
 * @param category Scheme category
 * @param keyword Search keyword
 * @param language User's language
 * @returns Filtered schemes
 */
export const filterSchemes = async (
  category?: string,
  keyword?: string,
  language: string = 'en'
): Promise<Scheme[]> => {
  try {
    const schemes = await getAllSchemesFromDB();

    // Filter by category
    let filtered = schemes;
    if (category) {
      filtered = filtered.filter(
        (scheme) => scheme.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by keyword (search in name, description, eligibility, benefits)
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter((scheme) => {
        return (
          scheme.name.toLowerCase().includes(lowerKeyword) ||
          scheme.description.toLowerCase().includes(lowerKeyword) ||
          scheme.eligibility.toLowerCase().includes(lowerKeyword) ||
          scheme.benefits.toLowerCase().includes(lowerKeyword)
        );
      });
    }

    // Translate schemes
    const translatedSchemes = await Promise.all(
      filtered.map(async (scheme) => {
        const translated = await translateScheme(scheme, language);
        return {
          id: translated.id,
          name: translated.name,
          description: translated.description,
          category: translated.category as 'subsidy' | 'loan' | 'insurance' | 'training',
        };
      })
    );

    logger.info('Schemes filtered', {
      category,
      keyword,
      resultCount: translatedSchemes.length,
    });

    return translatedSchemes;
  } catch (error) {
    logger.error('Failed to filter schemes:', error);
    throw error;
  }
};

/**
 * Clear schemes cache (useful for testing or when schemes are updated)
 */
export const clearCache = (): void => {
  schemesCache = null;
  cacheTimestamp = 0;
  logger.info('Schemes cache cleared');
};
