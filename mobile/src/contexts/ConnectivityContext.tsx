/**
 * Connectivity Context
 * Manages network connectivity state across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initOfflineService, subscribeToConnectivity, checkIsOnline } from '../services/offlineService';

interface ConnectivityContextType {
  isOnline: boolean;
  isInitialized: boolean;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  isOnline: true,
  isInitialized: false,
});

export const useConnectivity = () => useContext(ConnectivityContext);

interface ConnectivityProviderProps {
  children: ReactNode;
}

export const ConnectivityProvider: React.FC<ConnectivityProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize offline service
    initOfflineService()
      .then(() => {
        setIsOnline(checkIsOnline());
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error('Failed to initialize offline service:', error);
        setIsInitialized(true);
      });

    // Subscribe to connectivity changes
    const unsubscribe = subscribeToConnectivity((online) => {
      setIsOnline(online);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOnline, isInitialized }}>
      {children}
    </ConnectivityContext.Provider>
  );
};
