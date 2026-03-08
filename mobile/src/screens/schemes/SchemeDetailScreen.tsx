/**
 * Scheme Detail Screen
 * Display complete government scheme information with translation support
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Button, Divider, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, GovernmentScheme } from '../../types';
import { getSchemeById } from '../../services/schemeService';
import { theme, spacing } from '../../theme';

type SchemeDetailScreenRouteProp = RouteProp<RootStackParamList, 'SchemeDetail'>;
type SchemeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SchemeDetail'>;

interface Props {
  route: SchemeDetailScreenRouteProp;
}

const SchemeDetailScreen = ({ route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation<SchemeDetailScreenNavigationProp>();
  const { schemeId } = route.params;

  const [scheme, setScheme] = useState<GovernmentScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadScheme();
  }, [schemeId]);

  const loadScheme = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getSchemeById(schemeId);

      if (response.success && response.data) {
        setScheme(response.data);
      } else {
        setError(response.error || t('errors.unknownError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScheme();
    setRefreshing(false);
  };

  const handleViewApplication = () => {
    // For MVP, just show a message that tracking is recorded
    // In future, this will open the application link and track the view
    alert(t('schemes.applicationTracked') || 'Application view tracked');
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'subsidy':
        return theme.colors.primary;
      case 'loan':
        return theme.colors.secondary;
      case 'insurance':
        return theme.colors.tertiary;
      case 'training':
        return theme.colors.error;
      default:
        return theme.colors.onSurface;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (error || !scheme) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {error || t('errors.unknownError')}
        </Text>
        <Button mode="contained" onPress={loadScheme} style={styles.retryButton}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.content}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Text variant="headlineMedium" style={styles.schemeName}>
                {scheme.name}
              </Text>
              <Chip
                mode="flat"
                style={[styles.categoryChip, { backgroundColor: getCategoryColor(scheme.category) }]}
                textStyle={styles.chipText}>
                {scheme.category.toUpperCase()}
              </Chip>
            </View>
            <Text variant="bodyMedium" style={styles.description}>
              {scheme.description}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.detailCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {t('schemes.eligibility')}
            </Text>
            <Text variant="bodyMedium" style={styles.sectionContent}>
              {scheme.eligibility}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.detailCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {t('schemes.benefits')}
            </Text>
            <Text variant="bodyMedium" style={styles.sectionContent}>
              {scheme.benefits}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.detailCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {t('schemes.applicationProcess')}
            </Text>
            <Text variant="bodyMedium" style={styles.sectionContent}>
              {scheme.applicationProcess}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.detailCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {t('schemes.contact')}
            </Text>
            <Text variant="bodyMedium" style={styles.sectionContent}>
              {scheme.contactInfo}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.metadataCard}>
          <Card.Content>
            <View style={styles.metadataRow}>
              <Text variant="bodySmall" style={styles.metadataLabel}>
                Created:
              </Text>
              <Text variant="bodySmall" style={styles.metadataValue}>
                {formatDate(scheme.createdAt)}
              </Text>
            </View>
            <Divider style={styles.metadataDivider} />
            <View style={styles.metadataRow}>
              <Text variant="bodySmall" style={styles.metadataLabel}>
                Last Updated:
              </Text>
              <Text variant="bodySmall" style={styles.metadataValue}>
                {formatDate(scheme.updatedAt)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleViewApplication}
          style={styles.applicationButton}
          icon="open-in-new">
          View Application
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          Back to Schemes
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: theme.colors.onSurface,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    marginTop: spacing.md,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  schemeName: {
    flex: 1,
    marginRight: spacing.md,
    color: theme.colors.primary,
  },
  categoryChip: {
    paddingHorizontal: spacing.sm,
  },
  chipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  description: {
    lineHeight: 22,
    color: theme.colors.onSurface,
  },
  detailCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  sectionContent: {
    lineHeight: 24,
    color: theme.colors.onSurface,
  },
  metadataCard: {
    marginBottom: spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadataLabel: {
    color: theme.colors.onSurfaceVariant,
  },
  metadataValue: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  metadataDivider: {
    marginVertical: spacing.sm,
  },
  applicationButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  backButton: {
    marginTop: spacing.sm,
  },
});

export default SchemeDetailScreen;
