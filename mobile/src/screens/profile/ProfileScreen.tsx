/**
 * Profile Screen
 * Display user profile with edit and language selection options
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { RootStackParamList } from '../../types';
import { theme, spacing } from '../../theme';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleLanguageChange = async (lang: 'en' | 'hi' | 'te') => {
    try {
      await setLanguage(lang);
      setLanguageMenuVisible(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getLanguageLabel = (lang: string): string => {
    switch (lang) {
      case 'en':
        return 'English';
      case 'hi':
        return 'हिंदी (Hindi)';
      case 'te':
        return 'తెలుగు (Telugu)';
      default:
        return lang.toUpperCase();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>
              {t('profile.name')}
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.name}
            </Text>

            <Divider style={styles.divider} />

            <Text variant="titleMedium" style={styles.label}>
              {t('profile.mobileNumber')}
            </Text>
            <View style={styles.mobileRow}>
              <Text variant="bodyLarge" style={styles.value}>
                {user?.mobileNumber}
              </Text>
              <Text variant="bodySmall" style={styles.readOnlyBadge}>
                {t('profile.readOnly')}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <Text variant="titleMedium" style={styles.label}>
              {t('profile.location')}
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.location}
            </Text>

            <Divider style={styles.divider} />

            <Text variant="titleMedium" style={styles.label}>
              {t('profile.primaryCrop')}
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.primaryCrop}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>
              {t('profile.appLanguage')}
            </Text>
            <Menu
              visible={languageMenuVisible}
              onDismiss={() => setLanguageMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setLanguageMenuVisible(true)}
                  style={styles.languageButton}
                  contentStyle={styles.languageButtonContent}>
                  {getLanguageLabel(language)}
                </Button>
              }>
              <Menu.Item
                onPress={() => handleLanguageChange('en')}
                title="English"
                leadingIcon={language === 'en' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => handleLanguageChange('hi')}
                title="हिंदी (Hindi)"
                leadingIcon={language === 'hi' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => handleLanguageChange('te')}
                title="తెలుగు (Telugu)"
                leadingIcon={language === 'te' ? 'check' : undefined}
              />
            </Menu>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleEditProfile}
          style={styles.editButton}
          icon="pencil">
          {t('profile.edit')}
        </Button>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor={theme.colors.error}
          textColor={theme.colors.error}
          icon="logout">
          {t('auth.logout')}
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
  card: {
    marginBottom: spacing.lg,
  },
  label: {
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  value: {
    color: theme.colors.onSurface,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOnlyBadge: {
    color: theme.colors.onSurface,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: spacing.md,
  },
  languageButton: {
    marginTop: spacing.xs,
  },
  languageButtonContent: {
    justifyContent: 'flex-start',
  },
  editButton: {
    marginBottom: spacing.md,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
});

export default ProfileScreen;
