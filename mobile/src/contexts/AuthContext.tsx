/**
 * Authentication Context
 * Manages global authentication state and user session
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens } from '../types';
import { storeTokens, getTokens, removeTokens } from '../utils/secureStorage';
import * as authService from '../services/authService';
import apiClient from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (tokens: AuthTokens, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@agrinext:user';

export const AuthProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSession();
  }, []);

  /**
   * Load user session from storage
   */
  const loadUserSession = async () => {
    try {
      const tokens = await getTokens();
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);

      if (tokens && userJson) {
        const userData = JSON.parse(userJson);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load user session:', error);
      // Clear invalid session
      await clearSession();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user - Store tokens and user data
   */
  const login = async (tokens: AuthTokens, userData: User) => {
    try {
      await storeTokens(tokens);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to login:', error);
      throw new Error('Failed to save user session');
    }
  };

  /**
   * Logout user - Clear tokens and user data
   */
  const logout = async () => {
    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
      // Continue with local logout even if API fails
    } finally {
      await clearSession();
    }
  };

  /**
   * Update user data
   */
  const updateUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error('Failed to update user data');
    }
  };

  /**
   * Clear session data
   */
  const clearSession = async () => {
    try {
      await removeTokens();
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
