/**
 * Translation service
 * Handles content translation using Google Translate API
 */

import { Translate } from '@google-cloud/translate/build/src/v2';
import { env } from '../config/env';
import logger from '../utils/logger';

// Initialize Google Translate client
const translate = new Translate({
  projectId: env.GOOGLE_PROJECT_ID,
});

// Language code mapping
const languageMap: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  te: 'te',
};

/**
 * Translate error message to user's language
 * @param message Error message in English
 * @param language Target language code
 * @returns Translated message
 */
export const translateError = async (
  message: string,
  language: string
): Promise<string> => {
  // If English or translation not needed, return as is
  if (language === 'en' || !languageMap[language]) {
    return message;
  }

  try {
    const [translation] = await translate.translate(message, languageMap[language]);
    return translation;
  } catch (error) {
    logger.warn('Translation failed for error message, returning English:', error);
    return message;
  }
};

/**
 * Translate content to user's language
 * @param content Content in English
 * @param language Target language code
 * @returns Translated content
 */
export const translateContent = async (
  content: string,
  language: string
): Promise<string> => {
  // If English or translation not needed, return as is
  if (language === 'en' || !languageMap[language]) {
    return content;
  }

  // If content is empty, return as is
  if (!content || content.trim().length === 0) {
    return content;
  }

  try {
    const [translation] = await translate.translate(content, languageMap[language]);
    logger.debug('Content translated', {
      originalLength: content.length,
      translatedLength: translation.length,
      targetLanguage: language,
    });
    return translation;
  } catch (error) {
    logger.error('Translation failed, returning original content:', error);
    // Return original content if translation fails
    return content;
  }
};

/**
 * Translate multiple content items in batch
 * @param contents Array of content strings
 * @param language Target language code
 * @returns Array of translated content
 */
export const translateBatch = async (
  contents: string[],
  language: string
): Promise<string[]> => {
  // If English or translation not needed, return as is
  if (language === 'en' || !languageMap[language]) {
    return contents;
  }

  try {
    const [translations] = await translate.translate(contents, languageMap[language]);
    return Array.isArray(translations) ? translations : [translations];
  } catch (error) {
    logger.error('Batch translation failed, returning original content:', error);
    return contents;
  }
};

/**
 * Detect language of text
 * @param text Text to detect language
 * @returns Detected language code
 */
export const detectLanguage = async (text: string): Promise<string> => {
  try {
    const [detection] = await translate.detect(text);
    const detectedLanguage = Array.isArray(detection) ? detection[0].language : detection.language;
    return detectedLanguage;
  } catch (error) {
    logger.error('Language detection failed:', error);
    return 'en'; // Default to English
  }
};
