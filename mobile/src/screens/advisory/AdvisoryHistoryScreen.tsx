/**
 * Advisory History Screen
 * Display paginated list of past advisories
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Advisory } from '../../types';
import { getAdvisoryHistory } from '../../services/advisoryService';
import { theme, spacing } from '../../theme';

type AdvisoryHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const AdvisoryHistoryScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation<AdvisoryHistoryScreenNavigationProp>();

  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdvisories();
  }, []);

  const loadAdvisories = async (pageNum: number = 1, refresh: boolean = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const response = await getAdvisoryHistory({ page: pageNum, limit: 10 });

      if (response.success && response.data) {
        const newAdvisories = response.data.advisories;

        if (refresh || pageNum === 1) {
          setAdvisories(newAdvisories);
        } else {
          setAdvisories((prev) => [...prev, ...newAdvisories]);
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
    loadAdvisories(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadAdvisories(page + 1);
    }
  };

  const handleAdvisoryPress = (advisoryId: string) => {
    navigation.navigate('AdvisoryChat', { advisoryId });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderAdvisory = ({ item }: { item: Advisory }) => (
    <TouchableOpacity onPress={() => handleAdvisoryPress(item.id)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.query}>
              {truncateText(item.query, 80)}
            </Text>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <IconButton
                  icon="star"
                  iconColor={theme.colors.tertiary}
                  size={16}
                  style={styles.starIcon}
                />
                <Text variant="bodySmall" style={styles.ratingText}>
                  {item.rating}
                </Text>
              </View>
            )}
          </View>

          <Text variant="bodySmall" style={styles.date}>
            {formatDate(item.createdAt)}
          </Text>

          <Text variant="bodyMedium" style={styles.response} numberOfLines={2}>
            {item.response}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        {t('advisory.noHistory')}
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

  if (loading && !refreshing && advisories.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (error && advisories.length === 0) {
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
        data={advisories}
        renderItem={renderAdvisory}
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
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  query: {
    flex: 1,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  starIcon: {
    margin: 0,
    padding: 0,
  },
  ratingText: {
    color: theme.colors.tertiary,
    fontWeight: 'bold',
  },
  date: {
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: spacing.sm,
  },
  response: {
    marginTop: spacing.xs,
    color: theme.colors.onSurface,
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

export default AdvisoryHistoryScreen;
