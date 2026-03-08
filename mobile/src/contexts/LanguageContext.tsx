/**
 * Language Context
 * Manages app language state and persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

type Language = 'en' | 'hi' | 'te';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@agrinext:language';

export const LanguageProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [language, setLanguageState] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && ['en', 'hi', 'te'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
        i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    } finally {
      setLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
      i18n.changeLanguage(lang);
    } catch (error) {
      console.error('Failed to save language:', error);
      throw error;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
