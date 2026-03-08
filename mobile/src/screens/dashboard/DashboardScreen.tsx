/**
 * Dashboard Screen
 * Main dashboard with quick access to all features
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import { Card } from '../../components';
import { theme, spacing } from '../../theme';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  requiresOnline?: boolean;
  isOnline: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  onPress,
  requiresOnline = false,
  isOnline,
}) => {
  const { t } = useTranslation();
  const isDisabled = requiresOnline && !isOnline;

  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.7}>
      <Card style={[styles.featureCard, isDisabled && styles.featureCardDisabled]}>
        <View style={styles.featureContent}>
          <Text style={styles.featureIcon}>{icon}</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
            {isDisabled && (
              <Text style={styles.offlineText}>{t('offline.featureDisabled')}</Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const DashboardScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isOnline } = useConnectivity();
  const navigation = useNavigation<any>();

  const features = [
    {
      title: t('detection.title'),
      description: t('detection.title'),
      icon: '🌿',
      onPress: () => navigation.navigate('Detection'),
      requiresOnline: true,
    },
    {
      title: t('advisory.title'),
      description: t('advisory.title'),
      icon: '💡',
      onPress: () => navigation.navigate('Advisory'),
      requiresOnline: true,
    },
    {
      title: t('schemes.title'),
      description: t('schemes.title'),
      icon: '📋',
      onPress: () => navigation.navigate('Schemes'),
      requiresOnline: false,
    },
    {
      title: t('profile.title'),
      description: t('profile.title'),
      icon: '👤',
      onPress: () => navigation.navigate('Profile'),
      requiresOnline: false,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {t('common.hello')}, {user?.name || 'User'}!
          </Text>
          <Text style={styles.subtitle}>
            {t('dashboard.subtitle')}
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              onPress={feature.onPress}
              requiresOnline={feature.requiresOnline}
              isOnline={isOnline}
            />
          ))}
        </View>

        {!isOnline && (
          <Card style={styles.offlineCard}>
            <Text style={styles.offlineCardText}>
              {t('offline.cachedData')}
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  featuresGrid: {
    marginBottom: spacing.lg,
  },
  featureCard: {
    marginBottom: spacing.md,
  },
  featureCardDisabled: {
    opacity: 0.5,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  offlineText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  offlineCard: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  offlineCardText: {
    fontSize: 14,
    color: '#856404',
  },
});

export default DashboardScreen;
