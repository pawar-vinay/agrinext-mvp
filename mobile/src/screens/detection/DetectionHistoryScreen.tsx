/**
 * Detection History Screen
 * Display paginated list of past detections
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, DetectionResult } from '../../types';
import { getDetectionHistory } from '../../services/diseaseService';
import { theme, spacing } from '../../theme';

type DetectionHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const DetectionHistoryScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation<DetectionHistoryScreenNavigationProp>();

  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDetections();
  }, []);

  const loadDetections = async (pageNum: number = 1, refresh: boolean = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const response = await getDetectionHistory({ page: pageNum, limit: 10 });

      if (response.success && response.data) {
        const newDetections = response.data.detections;

        if (refresh || pageNum === 1) {
          setDetections(newDetections);
        } else {
          setDetections((prev) => [...prev, ...newDetections]);
        }

        setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
        setPage(pageNum);
      } else {
        setError(response.error || t('errors.unknownError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    loadDetections(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadDetections(page + 1);
    }
  };

  const handleDetectionPress = (detectionId: string) => {
    navigation.navigate('DetectionDetail', { detectionId });
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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderDetection = ({ item }: { item: DetectionResult }) => (
    <TouchableOpacity onPress={() => handleDetectionPress(item.id)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.diseaseName}>
              {item.diseaseName}
            </Text>
            <Chip
              mode="flat"
              style={[styles.chip, { backgroundColor: getSeverityColor(item.severity) }]}
              textStyle={styles.chipText}>
              {item.severity.toUpperCase()}
            </Chip>
          </View>

          <Text variant="bodySmall" style={styles.date}>
            {formatDate(item.createdAt)}
          </Text>

          <View style={styles.confidenceRow}>
            <Text variant="bodyMedium">
              {t('detection.confidence')}: {(item.confidenceScore * 100).toFixed(1)}%
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        {t('detection.noHistory')}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  if (loading && !refreshing && detections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (error && detections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={detections}
        renderItem={renderDetection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
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
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  diseaseName: {
    flex: 1,
    fontWeight: 'bold',
    color: theme.colors.error,
  },
  chip: {
    marginLeft: spacing.sm,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  date: {
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: spacing.sm,
  },
  confidenceRow: {
    marginTop: spacing.xs,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});

export default DetectionHistoryScreen;
