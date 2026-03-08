/**
 * Advisory Screen
 * Submit farming questions and view history
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { submitQuery } from '../../services/advisoryService';
import AdvisoryHistoryScreen from './AdvisoryHistoryScreen';
import { theme, spacing } from '../../theme';

type AdvisoryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const AdvisoryScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation<AdvisoryScreenNavigationProp>();

  const [selectedTab, setSelectedTab] = useState('ask');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    // Validate query
    if (!query.trim()) {
      setError('Please enter a question');
      return;
    }

    if (query.length > 500) {
      setError('Question must be less than 500 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await submitQuery(query.trim());

      if (response.success && response.data) {
        // Navigate to chat screen with advisory
        navigation.navigate('AdvisoryChat', { advisoryId: response.data.id });
        // Clear query
        setQuery('');
      } else {
        setError(response.error || t('errors.unknownError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const renderAskTab = () => (
    <KeyboardAvoidingView
      style={styles.tabContent}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="titleLarge" style={styles.title}>
            {t('advisory.title')}
          </Text>

          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('advisory.askQuestion')}
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label={t('advisory.enterQuestion')}
                value={query}
                onChangeText={setQuery}
                mode="outlined"
                multiline
                numberOfLines={6}
                maxLength={500}
                disabled={loading}
                style={styles.input}
                placeholder="e.g., How can I prevent pests in my tomato crop?"
              />

              <Text variant="bodySmall" style={styles.charCount}>
                {query.length}/500
              </Text>

              {error && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {error}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || !query.trim()}
                style={styles.submitButton}>
                {loading ? t('advisory.loading') : t('advisory.submit')}
              </Button>
            </Card.Content>
          </Card>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.loadingText}>
                {t('advisory.loading')}
              </Text>
              <Text variant="bodySmall" style={styles.loadingSubtext}>
                Getting expert advice...
              </Text>
            </View>
          )}

          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.infoTitle}>
                Tips for better advice:
              </Text>
              <Text variant="bodySmall" style={styles.infoText}>
                • Be specific about your crop and location
              </Text>
              <Text variant="bodySmall" style={styles.infoText}>
                • Describe the problem in detail
              </Text>
              <Text variant="bodySmall" style={styles.infoText}>
                • Mention current season and weather
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={selectedTab}
        onValueChange={setSelectedTab}
        buttons={[
          {
            value: 'ask',
            label: 'Ask',
            icon: 'chat-question',
          },
          {
            value: 'history',
            label: 'History',
            icon: 'history',
          },
        ]}
        style={styles.segmentedButtons}
      />

      {selectedTab === 'ask' ? renderAskTab() : <AdvisoryHistoryScreen />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  segmentedButtons: {
    margin: spacing.md,
  },
  tabContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: theme.colors.primary,
  },
  subtitle: {
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: theme.colors.onSurface,
  },
  card: {
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.xs,
  },
  charCount: {
    textAlign: 'right',
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: theme.colors.onSurface,
  },
  loadingSubtext: {
    marginTop: spacing.xs,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  infoCard: {
    marginTop: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  infoTitle: {
    marginBottom: spacing.sm,
    color: theme.colors.primary,
  },
  infoText: {
    marginBottom: spacing.xs,
    color: theme.colors.onSurface,
  },
});

export default AdvisoryScreen;
