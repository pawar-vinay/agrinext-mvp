/**
 * Secure Storage Utility
 * Wrapper for secure token storage using Keychain (iOS) and Keystore (Android)
 */

import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.agrinext.app';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Store tokens securely
 * @param tokens Access and refresh tokens
 */
export const storeTokens = async (tokens: StoredTokens): Promise<void> => {
  try {
    await Keychain.setGenericPassword(
      'tokens',
      JSON.stringify(tokens),
      {
        service: SERVICE_NAME,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      }
    );
  } catch (error) {
    console.error('Failed to store tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
};

/**
 * Retrieve stored tokens
 * @returns Stored tokens or null if not found
 */
export const getTokens = async (): Promise<StoredTokens | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });

    if (credentials) {
      return JSON.parse(credentials.password);
    }

    return null;
  } catch (error) {
    console.error('Failed to retrieve tokens:', error);
    return null;
  }
};

/**
 * Remove stored tokens
 */
export const removeTokens = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: SERVICE_NAME,
    });
  } catch (error) {
    console.error('Failed to remove tokens:', error);
    throw new Error('Failed to remove authentication tokens');
  }
};

/**
 * Check if tokens exist
 * @returns True if tokens are stored
 */
export const hasTokens = async (): Promise<boolean> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });
    return !!credentials;
  } catch (error) {
    console.error('Failed to check tokens:', error);
    return false;
  }
};
