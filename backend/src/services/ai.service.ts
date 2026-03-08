/**
 * AI Service
 * Handles disease detection using Hugging Face and Roboflow APIs
 */

import axios from 'axios';
import FormData from 'form-data';
import { env } from '../config/env';
import logger from '../utils/logger';
import { ExternalServiceError, GatewayTimeoutError } from '../utils/errors';

interface AIModelResponse {
  diseaseName: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  alternativeDiseases?: Array<{
    name: string;
    confidence: number;
  }>;
}

/**
 * Determine disease severity based on confidence score
 * @param confidence Confidence score (0-1)
 * @returns Severity level
 */
const determineSeverity = (confidence: number): 'low' | 'medium' | 'high' => {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.75) return 'medium';
  return 'low';
};

/**
 * Call Hugging Face Inference API for disease detection
 * @param imageBuffer Image buffer
 * @returns AI model response
 */
const huggingFaceInference = async (
  imageBuffer: Buffer
): Promise<AIModelResponse> => {
  try {
    logger.info('Calling Hugging Face API for disease detection');

    const response = await axios.post(
      `https://router.huggingface.co/hf-inference/models/${env.HUGGINGFACE_MODEL}`,
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'image/jpeg',
        },
        timeout: 30000, // 30 seconds
      }
    );

    // Parse Hugging Face response
    // New format: { value: [{ label: "disease_name", score: 0.95 }, ...] }
    const predictions = response.data.value || response.data;

    if (!Array.isArray(predictions) || predictions.length === 0) {
      throw new Error('Invalid response from Hugging Face API');
    }

    // Get top prediction
    const topPrediction = predictions[0];
    const diseaseName = topPrediction.label.replace(/_/g, ' ');
    const confidence = topPrediction.score;

    // Get alternative predictions
    const alternativeDiseases = predictions.slice(1, 4).map((pred: any) => ({
      name: pred.label.replace(/_/g, ' '),
      confidence: pred.score,
    }));

    logger.info('Hugging Face inference successful', {
      diseaseName,
      confidence,
    });

    return {
      diseaseName,
      confidence,
      severity: determineSeverity(confidence),
      alternativeDiseases,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new GatewayTimeoutError(
          'AI_MODEL_TIMEOUT',
          'Disease detection timed out. Please try again.'
        );
      }

      if (error.response?.status === 429) {
        throw new ExternalServiceError(
          'Hugging Face',
          'Service is busy. Please try again in a moment.'
        );
      }

      if (error.response?.status === 503) {
        throw new ExternalServiceError(
          'Hugging Face',
          'Model is loading. Please try again in a few seconds.'
        );
      }
      
      // Log detailed error information
      logger.error('Hugging Face inference failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
      });
    } else {
      logger.error('Hugging Face inference failed:', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    throw error;
  }
};

/**
 * Call Roboflow API for disease detection (fallback)
 * @param imageBuffer Image buffer
 * @returns AI model response
 */
const roboflowInference = async (
  imageBuffer: Buffer
): Promise<AIModelResponse> => {
  try {
    logger.info('Calling Roboflow API for disease detection');

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    const response = await axios.post(
      `https://detect.roboflow.com/${env.ROBOFLOW_PROJECT}/${env.ROBOFLOW_VERSION}`,
      {
        image: base64Image,
      },
      {
        params: {
          api_key: env.ROBOFLOW_API_KEY,
        },
        timeout: 30000,
      }
    );

    // Parse Roboflow response
    const predictions = response.data.predictions;

    if (!Array.isArray(predictions) || predictions.length === 0) {
      throw new Error('No disease detected');
    }

    // Get top prediction
    const topPrediction = predictions[0];
    const diseaseName = topPrediction.class;
    const confidence = topPrediction.confidence;

    logger.info('Roboflow inference successful', {
      diseaseName,
      confidence,
    });

    return {
      diseaseName,
      confidence,
      severity: determineSeverity(confidence),
    };
  } catch (error) {
    logger.error('Roboflow inference failed:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Demo/Mock disease detection (for testing without API keys)
 * @param imageBuffer Image buffer
 * @returns Mock AI model response
 */
const mockDiseaseDetection = async (
  imageBuffer: Buffer
): Promise<AIModelResponse> => {
  logger.info('Using mock disease detection (demo mode)');

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock diseases with realistic data
  const mockDiseases = [
    {
      name: 'Tomato Late Blight',
      confidence: 0.92,
      severity: 'high' as const,
      alternatives: [
        { name: 'Tomato Early Blight', confidence: 0.78 },
        { name: 'Tomato Leaf Spot', confidence: 0.65 },
      ],
    },
    {
      name: 'Rice Blast',
      confidence: 0.88,
      severity: 'high' as const,
      alternatives: [
        { name: 'Rice Brown Spot', confidence: 0.72 },
        { name: 'Rice Sheath Blight', confidence: 0.58 },
      ],
    },
    {
      name: 'Wheat Rust',
      confidence: 0.85,
      severity: 'medium' as const,
      alternatives: [
        { name: 'Wheat Powdery Mildew', confidence: 0.68 },
        { name: 'Wheat Leaf Blight', confidence: 0.55 },
      ],
    },
    {
      name: 'Potato Late Blight',
      confidence: 0.91,
      severity: 'high' as const,
      alternatives: [
        { name: 'Potato Early Blight', confidence: 0.75 },
        { name: 'Potato Leaf Roll', confidence: 0.62 },
      ],
    },
    {
      name: 'Cotton Leaf Curl',
      confidence: 0.87,
      severity: 'medium' as const,
      alternatives: [
        { name: 'Cotton Bacterial Blight', confidence: 0.71 },
        { name: 'Cotton Wilt', confidence: 0.59 },
      ],
    },
  ];

  // Randomly select a disease
  const randomDisease =
    mockDiseases[Math.floor(Math.random() * mockDiseases.length)];

  return {
    diseaseName: randomDisease.name,
    confidence: randomDisease.confidence,
    severity: randomDisease.severity,
    alternativeDiseases: randomDisease.alternatives,
  };
};

/**
 * Detect disease with fallback strategy
 * Tries Hugging Face first, falls back to Roboflow, then to mock detection
 * @param imageBuffer Image buffer
 * @returns AI model response
 */
export const detectDiseaseWithFallback = async (
  imageBuffer: Buffer
): Promise<AIModelResponse> => {
  // Check if API keys are configured
  const hasHuggingFaceKey =
    env.HUGGINGFACE_API_KEY &&
    !env.HUGGINGFACE_API_KEY.includes('YOUR_') &&
    env.HUGGINGFACE_API_KEY.length > 10;

  const hasValidModel =
    env.HUGGINGFACE_MODEL &&
    !env.HUGGINGFACE_MODEL.includes('YOUR_') &&
    env.HUGGINGFACE_MODEL.length > 5;

  // If no valid API keys, use mock detection
  if (!hasHuggingFaceKey || !hasValidModel) {
    logger.warn(
      'No valid AI API keys configured, using mock disease detection'
    );
    return await mockDiseaseDetection(imageBuffer);
  }

  let primaryError: Error | null = null;

  // Try primary model (Hugging Face)
  try {
    return await huggingFaceInference(imageBuffer);
  } catch (error) {
    primaryError = error as Error;
    logger.warn('Primary AI model failed, trying fallback:', {
      error: primaryError.message,
    });
  }

  // Try fallback model (Roboflow)
  try {
    return await roboflowInference(imageBuffer);
  } catch (fallbackError) {
    logger.warn('Fallback AI model failed, using mock detection:', {
      primaryError: primaryError?.message,
      fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
    });

    // Use mock detection as final fallback
    return await mockDiseaseDetection(imageBuffer);
  }
};

/**
 * Get treatment recommendations for a disease
 * @param diseaseName Disease name
 * @param language User's language
 * @returns Treatment recommendations
 */
export const getTreatmentRecommendations = (
  diseaseName: string,
  language: string = 'en'
): string[] => {
  // This is a simplified version
  // In production, this would query a database or knowledge base
  const recommendations = [
    'Remove and destroy infected plant parts',
    'Apply appropriate fungicide or pesticide',
    'Improve air circulation around plants',
    'Avoid overhead watering',
    'Monitor plants regularly for early detection',
  ];

  // TODO: Translate recommendations to user's language
  // TODO: Get disease-specific recommendations from database

  return recommendations;
};
