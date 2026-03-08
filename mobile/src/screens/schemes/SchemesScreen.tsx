/**
 * Schemes Screen
 * Browse and search government schemes
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Searchbar, Chip, ActivityIndicator, Menu, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, GovernmentScheme } from '../../types';
import { getSchemes } from '../../services/schemeService';
import { theme, spacing } from '../../theme';

type SchemesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SchemesScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation<SchemesScreenNavigationProp>();

  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: undefined, label: 'All Categories' },
    { value: 'subsidy', label: 'Subsidy' },
    { value: 'loan', label: 'Loan' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'training', label: 'Training' },
  ];

  useEffect(() => {
    loadSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [schemes, searchQuery, selectedCategory]);

  const loadSchemes = async (refresh: boolean = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const response = await getSchemes();

      if (response.success && response.data) {
        setSchemes(response.data);
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

  const filterSchemes = () => {
    let filtered = [...schemes];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((scheme) => scheme.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (scheme) =>
          scheme.name.toLowerCase().includes(query) ||
          scheme.description.toLowerCase().includes(query)
      );
    }

    setFilteredSchemes(filtered);
  };

  const handleRefresh = () => {
    loadSchemes(true);
  };

  const handleSchemePress = (schemeId: string) => {
    navigation.navigate('SchemeDetail', { schemeId });
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
        return '#9C27B0';
      default:
        return theme.colors.onSurface;
    }
  };

  const renderScheme = ({ item }: { item: GovernmentScheme }) => (
    <Card style={styles.card} onPress={() => handleSchemePress(item.id)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.schemeName}>
            {item.name}
          </Text>
          <Chip
            mode="flat"
            style={[styles.chip, { backgroundColor: getCategoryColor(item.category) }]}
            textStyle={styles.chipText}>
            {item.category.toUpperCase()}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        {t('schemes.noSchemes')}
      </Text>
    </View>
  );

  const selectedCategoryLabel =
    categories.find((c) => c.value === selectedCategory)?.label || 'All Categories';

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (error && schemes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {error}
        </Text>
        <Button mode="contained" onPress={() => loadSchemes()} style={styles.retryButton}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder={t('schemes.search')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <Menu
          visible={categoryMenuVisible}
          onDismiss={() => setCategoryMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setCategoryMenuVisible(true)}
              style={styles.categoryButton}
              icon="filter">
              {selectedCategoryLabel}
            </Button>
          }>
          {categories.map((cat) => (
            <Menu.Item
              key={cat.value || 'all'}
              onPress={() => {
                setSelectedCategory(cat.value);
                setCategoryMenuVisible(false);
              }}
              title={cat.label}
            />
          ))}
        </Menu>
      </View>

      <FlatList
        data={filteredSchemes}
        renderItem={renderScheme}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  filterContainer: {
    padding: spacing.md,
    backgroundColor: theme.colors.background,
  },
  searchbar: {
    marginBottom: spacing.sm,
  },
  categoryButton: {
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  schemeName: {
    flex: 1,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  chip: {
    marginLeft: spacing.sm,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
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
});

export default SchemesScreen;
