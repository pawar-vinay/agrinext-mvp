/**
 * Profile Edit Screen
 * Allows users to edit their profile information
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { updateProfile, UpdateProfileData } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme, spacing } from '../../theme';

type ProfileEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileEdit'>;

interface Props {
  navigation: ProfileEditScreenNavigationProp;
}

const ProfileEditScreen = ({ navigation }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { setLanguage } = useLanguage();

  const [formData, setFormData] = useState<UpdateProfileData>({
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

  // Pre-populate form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        location: user.location,
        primaryCrop: user.primaryCrop,
        language: user.language,
      });
    }
  }, [user]);

  const handleSave = async () => {
    setError('');

    // Validate required fields
    if (!formData.name.trim()) {
      setError(t('errors.nameRequired'));
      return;
    }
    if (!formData.location.trim()) {
      setError(t('errors.locationRequired'));
      return;
    }
    if (!formData.primaryCrop.trim()) {
      setError(t('errors.primaryCropRequired'));
      return;
    }

    setLoading(true);

    try {
      const response = await updateProfile(formData);

      if (response.success && response.data) {
        // Update app language if changed
        if (formData.language !== user?.language) {
          await setLanguage(formData.language);
        }

        // Update user data in AuthContext
        await updateUser(response.data);

        // Navigate back to profile screen
        navigation.goBack();
      } else {
        setError(response.error || t('errors.updateProfileFailed'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const updateFormData = (field: keyof UpdateProfileData, value: string) => {
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
            {t('profile.edit')}
          </Text>

          <View style={styles.form}>
            {/* Mobile Number - Read-only */}
            <TextInput
              label={t('profile.mobileNumber')}
              value={user?.mobileNumber || ''}
              mode="outlined"
              disabled
              editable={false}
              style={styles.input}
              right={<TextInput.Affix text={t('profile.readOnly')} />}
            />

            <TextInput
              label={t('profile.name')}
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              mode="outlined"
              disabled={loading}
              style={styles.input}
            />

            <TextInput
              label={t('profile.location')}
              value={formData.location}
              onChangeText={(text) => updateFormData('location', text)}
              mode="outlined"
              disabled={loading}
              style={styles.input}
            />

            <TextInput
              label={t('profile.primaryCrop')}
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
                  {t('profile.language')}: {selectedLanguage?.label}
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

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                disabled={loading}
                style={styles.cancelButton}>
                {t('profile.cancel')}
              </Button>

              <Button
                mode="contained"
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}>
                {t('profile.save')}
              </Button>
            </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default ProfileEditScreen;
