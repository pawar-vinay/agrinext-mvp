/**
 * Registration Screen
 * New user profile registration form
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { registerUser, RegisterUserData } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme, spacing } from '../../theme';

type RegistrationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Registration'>;
type RegistrationScreenRouteProp = RouteProp<RootStackParamList, 'Registration'>;

interface Props {
  navigation: RegistrationScreenNavigationProp;
  route: RegistrationScreenRouteProp;
}

const RegistrationScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { setLanguage } = useLanguage();
  const { mobileNumber, tokens } = route.params;

  const [formData, setFormData] = useState<RegisterUserData>({
    name: '',
    location: '',
    primaryCrop: '',
    language: 'en',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
  ];

  const handleRegister = async () => {
    setError('');

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!formData.primaryCrop.trim()) {
      setError('Primary crop is required');
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser(mobileNumber, formData);

      if (response.success && response.data) {
        const { user, tokens: newTokens } = response.data;

        // Update app language
        await setLanguage(formData.language);

        // Login user
        await login(newTokens, user);
        // Navigation will be handled by RootNavigator
      } else {
        setError(response.error || t('errors.unknownError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof RegisterUserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const selectedLanguage = languages.find((lang) => lang.code === formData.language);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            {t('auth.register')}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Complete your profile
          </Text>

          <View style={styles.form}>
            <TextInput
              label={t('auth.name')}
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              mode="outlined"
              disabled={loading}
              style={styles.input}
            />

            <TextInput
              label={t('auth.location')}
              value={formData.location}
              onChangeText={(text) => updateFormData('location', text)}
              mode="outlined"
              disabled={loading}
              style={styles.input}
            />

            <TextInput
              label={t('auth.primaryCrop')}
              value={formData.primaryCrop}
              onChangeText={(text) => updateFormData('primaryCrop', text)}
              mode="outlined"
              disabled={loading}
              style={styles.input}
            />

            <Menu
              visible={languageMenuVisible}
              onDismiss={() => setLanguageMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setLanguageMenuVisible(true)}
                  disabled={loading}
                  style={styles.languageButton}
                  contentStyle={styles.languageButtonContent}>
                  {t('auth.language')}: {selectedLanguage?.label}
                </Button>
              }>
              {languages.map((lang) => (
                <Menu.Item
                  key={lang.code}
                  onPress={() => {
                    updateFormData('language', lang.code as 'en' | 'hi' | 'te');
                    setLanguageMenuVisible(false);
                  }}
                  title={lang.label}
                />
              ))}
            </Menu>

            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}>
              {t('auth.submit')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    textAlign: 'center',
    color: theme.colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    marginBottom: spacing.xl,
  },
  form: {
    marginTop: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  languageButton: {
    marginBottom: spacing.md,
  },
  languageButtonContent: {
    justifyContent: 'flex-start',
  },
  button: {
    marginTop: spacing.md,
  },
});

export default RegistrationScreen;
