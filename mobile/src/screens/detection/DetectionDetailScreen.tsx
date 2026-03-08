/**
 * Detection Detail Screen
 * Display complete detection record with image metadata
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, DetectionResult } from '../../types';
import { getDetectionById } from '../../services/diseaseService';
import { theme, spacing } from '../../theme';

type DetectionDetailScreenRouteProp = RouteProp<RootStackParamList, 'DetectionDetail'>;
type DetectionDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DetectionDetail'>;

interface Props {
  route: DetectionDetailScreenRouteProp;
}

const DetectionDetailScreen = ({ route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation<DetectionDetailScreenNavigationProp>();
  const { detectionId } = route.params;

  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDetection();
  }, [detectionId]);

  const loadDetection = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getDetectionById(detectionId);

      if (response.success && response.data) {
        setDetection(response.data);
      } else {
        setError(response.error || t('errors.unknownError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.tertiary;
      case 'low':
        return theme.colors.primary;
      default:
        return theme.colors.onSurface;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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

  if (error || !detection) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {error || t('errors.unknownError')}
        </Text>
        <Button mode="contained" onPress={loadDetection} style={styles.retryButton}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.imageCard}>
          <Card.Cover source={{ uri: detection.imageUrl }} style={styles.image} />
        </Card>

        <Card style={styles.detailCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Detection Details
            </Text>

            <View style={styles.detailRow}>
              <Text variant="titleMedium">Disease:</Text>
              <Text variant="bodyLarge" style={styles.diseaseName}>
                {detection.diseaseName}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="titleMedium">Severity:</Text>
              <Chip
                mode="flat"
                style={[styles.chip, { backgroundColor: getSeverityColor(detection.severity) }]}
                textStyle={styles.chipText}>
                {detection.severity.toUpperCase()}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="titleMedium">Confidence:</Text>
              <Text variant="bodyLarge">
                {(detection.confidenceScore * 100).toFixed(1)}%
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="titleMedium">Date:</Text>
              <Text variant="bodyMedium">{formatDate(detection.createdAt)}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.metadataCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Image Metadata
            </Text>

            <View style={styles.detailRow}>
              <Text variant="titleMedium">Size:</Text>
              <Text variant="bodyMedium">
                {formatFileSize(detection.imageMetadata.size)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="titleMedium">Format:</Text>
              <Text variant="bodyMedium">
                {detection.imageMetadata.format.toUpperCase()}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="titleMedium">Dimensions:</Text>
              <Text variant="bodyMedium">
                {detection.imageMetadata.dimensions.width} x{' '}
                {detection.imageMetadata.dimensions.height}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.recommendationsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recommendations
            </Text>
            <Text variant="bodyMedium" style={styles.recommendations}>
              {detection.recommendations}
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          Back to History
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
  imageCard: {
    marginBottom: spacing.md,
  },
  image: {
    height: 250,
  },
  detailCard: {
    marginBottom: spacing.md,
  },
  metadataCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    color: theme.colors.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diseaseName: {
    fontWeight: 'bold',
    color: theme.colors.error,
  },
  chip: {
    paddingHorizontal: spacing.sm,
  },
  chipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: spacing.md,
  },
  recommendationsCard: {
    marginBottom: spacing.md,
  },
  recommendations: {
    lineHeight: 24,
  },
  backButton: {
    marginTop: spacing.md,
  },
});

export default DetectionDetailScreen;
