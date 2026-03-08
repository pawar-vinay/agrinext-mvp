/**
 * Offline Indicator Component
 * Displays a banner when device is offline
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface OfflineIndicatorProps {
  isVisible: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isVisible }) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('offline.indicator')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OfflineIndicator;
