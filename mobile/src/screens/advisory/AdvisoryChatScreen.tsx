/**
 * Advisory Chat Screen
 * Display Q&A conversation with rating
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Advisory } from '../../types';
import { getAdvisoryHistory, rateAdvisory } from '../../services/advisoryService';
import { theme, spacing } from '../../theme';

type AdvisoryChatScreenRouteProp = RouteProp<RootStackParamList, 'AdvisoryChat'>;
type AdvisoryChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdvisoryChat'>;

interface Props {
  route: AdvisoryChatScreenRouteProp;
}

const AdvisoryChatScreen = ({ route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation<AdvisoryChatScreenNavigationProp>();
  const { advisoryId } = route.params;

  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdvisory();
  }, [advisoryId]);

  const loadAdvisory = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch advisory history and find the specific advisory
      const response = await getAdvisoryHistory({ page: 1, limit: 50 });

      if (response.success && response.data) {
        const foundAdvisory = response.data.advisories.find((a) => a.id === advisoryId);
        if (foundAdvisory) {
          setAdvisory(foundAdvisory);
          setRating(foundAdvisory.rating);
        } else {
          setError('Advisory not found');
        }
      } else {
        setError(response.error || t('errors.unknownError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (newRating: number) => {
    if (!advisory) return;

    setSubmittingRating(true);

    try {
      const response = await rateAdvisory(advisory.id, newRating);

      if (response.success && response.data) {
        setRating(newRating);
        setAdvisory(response.data);
      } else {
        setError(response.error || t('errors.unknownError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setSubmittingRating(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  if (error || !advisory) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {error || t('errors.unknownError')}
        </Text>
        <Button mode="contained" onPress={loadAdvisory} style={styles.retryButton}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="bodySmall" style={styles.date}>
          {formatDate(advisory.createdAt)}
        </Text>

        <Card style={styles.queryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.queryLabel}>
              Your Question:
            </Text>
            <Text variant="bodyLarge" style={styles.queryText}>
              {advisory.query}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.responseCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.responseLabel}>
              {t('advisory.response')}:
            </Text>
            <Text variant="bodyMedium" style={styles.responseText}>
              {advisory.response}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.ratingCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.ratingLabel}>
              {t('advisory.rate')}:
            </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                  key={star}
                  icon={rating && rating >= star ? 'star' : 'star-outline'}
                  iconColor={rating && rating >= star ? theme.colors.tertiary : theme.colors.onSurface}
                  size={32}
                  onPress={() => handleRate(star)}
                  disabled={submittingRating}
                />
              ))}
            </View>
            {submittingRating && (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.ratingLoader} />
            )}
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          Back to Advisory
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
  date: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: spacing.md,
  },
  queryCard: {
    marginBottom: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  queryLabel: {
    marginBottom: spacing.sm,
    color: theme.colors.primary,
  },
  queryText: {
    fontWeight: '500',
  },
  responseCard: {
    marginBottom: spacing.md,
    backgroundColor: theme.colors.primaryContainer,
  },
  responseLabel: {
    marginBottom: spacing.sm,
    color: theme.colors.primary,
  },
  responseText: {
    lineHeight: 24,
  },
  ratingCard: {
    marginBottom: spacing.md,
  },
  ratingLabel: {
    marginBottom: spacing.sm,
    color: theme.colors.primary,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingLoader: {
    marginTop: spacing.sm,
  },
  backButton: {
    marginTop: spacing.md,
  },
});

export default AdvisoryChatScreen;
