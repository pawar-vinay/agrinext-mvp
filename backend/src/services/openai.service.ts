/**
 * OpenAI Service
 * Handles farming advisory using OpenAI API
 */

import OpenAI from 'openai';
import { env } from '../config/env';
import logger from '../utils/logger';
import { ExternalServiceError, GatewayTimeoutError } from '../utils/errors';

// Initialize OpenAI client (only if API key is valid)
let openai: OpenAI | null = null;
if (env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'demo' && env.OPENAI_API_KEY.startsWith('sk-')) {
  openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
  logger.info('OpenAI client initialized', {
    keyPrefix: env.OPENAI_API_KEY.substring(0, 20) + '...',
    model: env.OPENAI_MODEL,
  });
} else {
  logger.warn('OpenAI client not initialized', {
    hasKey: !!env.OPENAI_API_KEY,
    keyValue: env.OPENAI_API_KEY,
    startsWithSk: env.OPENAI_API_KEY?.startsWith('sk-'),
  });
}

interface UserContext {
  location: string;
  primaryCrop: string;
  language: string;
}

/**
 * Get current season based on month
 * @returns Current season
 */
const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 9) return 'Monsoon/Kharif';
  if (month >= 10 && month <= 11) return 'Post-Monsoon';
  return 'Winter/Rabi';
};

/**
 * Build context-aware prompt for OpenAI
 * @param query User's question
 * @param userContext User context (location, crop, language)
 * @returns Context-aware prompt
 */
export const buildPromptContext = (
  query: string,
  userContext: UserContext
): string => {
  const season = getCurrentSeason();

  const systemPrompt = `You are an expert agricultural advisor helping farmers in India. 
You provide practical, actionable advice based on local conditions and best practices.

User Context:
- Location: ${userContext.location}
- Primary Crop: ${userContext.primaryCrop}
- Current Season: ${season}
- Language: ${userContext.language}

Guidelines:
1. Provide specific, actionable advice relevant to the user's location and crop
2. Consider the current season in your recommendations
3. Use simple, clear language that farmers can understand
4. Include practical steps they can take immediately
5. Mention any relevant government schemes or subsidies if applicable
6. Keep responses concise (under 300 words)
${userContext.language !== 'en' ? `7. Respond in ${userContext.language === 'hi' ? 'Hindi' : 'Telugu'}` : ''}

Farmer's Question: ${query}`;

  return systemPrompt;
};

/**
 * Generate mock farming advice (for demo mode)
 * @param query User's question
 * @param userContext User context
 * @returns Mock advice
 */
const generateMockAdvice = async (
  query: string,
  userContext: UserContext
): Promise<string> => {
  logger.info('Using mock advisory (demo mode)');

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const season = getCurrentSeason();

  // Generate contextual mock advice based on query keywords
  const queryLower = query.toLowerCase();

  if (queryLower.includes('pest') || queryLower.includes('insect')) {
    return `For pest management in ${userContext.primaryCrop} during ${season} season in ${userContext.location}:

1. Monitor your crops regularly for early pest detection
2. Use neem-based organic pesticides as a first line of defense
3. Implement crop rotation to break pest life cycles
4. Maintain proper field hygiene by removing crop residues
5. Consider biological control methods like introducing natural predators

For severe infestations, consult your local agricultural extension office for recommended chemical pesticides suitable for your region.`;
  }

  if (queryLower.includes('fertilizer') || queryLower.includes('nutrient')) {
    return `Fertilizer recommendations for ${userContext.primaryCrop} in ${userContext.location} during ${season}:

1. Conduct soil testing to determine nutrient deficiencies
2. Apply balanced NPK fertilizer based on soil test results
3. Use organic compost to improve soil health
4. Apply micronutrients (zinc, boron) if deficiency symptoms appear
5. Follow split application method for better nutrient uptake

Government schemes like the Soil Health Card scheme can help you get free soil testing. Visit your nearest Krishi Vigyan Kendra for assistance.`;
  }

  if (queryLower.includes('water') || queryLower.includes('irrigation')) {
    return `Irrigation guidance for ${userContext.primaryCrop} in ${userContext.location}:

1. Water early morning or late evening to reduce evaporation
2. Use drip irrigation for water efficiency (up to 50% water savings)
3. Monitor soil moisture before irrigating
4. Avoid over-watering which can lead to root diseases
5. During ${season}, adjust irrigation frequency based on rainfall

Check PM-KUSUM scheme for subsidies on solar-powered irrigation systems.`;
  }

  // Default general advice
  return `General farming advice for ${userContext.primaryCrop} in ${userContext.location} during ${season} season:

1. Monitor weather forecasts regularly and plan activities accordingly
2. Maintain proper spacing between plants for good air circulation
3. Practice crop rotation to maintain soil health
4. Keep detailed records of inputs, costs, and yields
5. Join local farmer groups to share knowledge and resources

Visit your nearest Krishi Vigyan Kendra for location-specific guidance and training programs. You can also access government schemes through the PM-KISAN portal for financial support.`;
};

/**
 * Generate farming advice using OpenAI
 * @param query User's question
 * @param userContext User context
 * @returns AI-generated advice
 */
export const generateAdvice = async (
  query: string,
  userContext: UserContext
): Promise<string> => {
  // Check if OpenAI is configured
  if (!openai) {
    throw new ExternalServiceError(
      'OpenAI',
      'OpenAI API is not configured. Please contact support.'
    );
  }

  logger.info('Generating advice with OpenAI', {
    query: query.substring(0, 50),
    location: userContext.location,
    crop: userContext.primaryCrop,
  });

  // Build context-aware prompt
  const prompt = buildPromptContext(query, userContext);

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), 30000); // Increased to 30s
  });

  // Call OpenAI API with timeout
  const completionPromise = openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an expert agricultural advisor for Indian farmers.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: env.OPENAI_MAX_TOKENS,
    temperature: 0.7,
  });

  const completion = await Promise.race([
    completionPromise,
    timeoutPromise,
  ]);

  const advice = completion.choices[0]?.message?.content;

  if (!advice) {
    throw new Error('No response from OpenAI');
  }

  logger.info('Advice generated successfully', {
    responseLength: advice.length,
  });

  return advice.trim();
};

/**
 * Generate advice with request queuing for rate limits
 * @param query User's question
 * @param userContext User context
 * @returns AI-generated advice
 */
export const generateAdviceWithQueue = async (
  query: string,
  userContext: UserContext
): Promise<string> => {
  // Simple retry logic for rate limits
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateAdvice(query, userContext);
    } catch (error) {
      lastError = error as Error;

      // Check if it's a quota error
      if (error instanceof OpenAI.APIError && error.code === 'insufficient_quota') {
        logger.error('OpenAI quota exceeded - API key needs credits');
        throw new ExternalServiceError(
          'OpenAI',
          'Advisory service requires OpenAI credits. Please contact support.'
        );
      }

      // Only retry on rate limit errors
      if (
        error instanceof ExternalServiceError &&
        error.message.includes('busy')
      ) {
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = 1000 * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          logger.info(`Retrying OpenAI request (attempt ${attempt + 1})`);
          continue;
        }
      }

      // Re-throw the error
      throw error;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Failed to generate advice');
};
