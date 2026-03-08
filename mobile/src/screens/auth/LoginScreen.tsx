/**
 * Login Screen
 * Mobile number input and OTP request
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { sendOTP } from '../../services/authService';
import { theme, spacing } from '../../theme';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen = ({ navigation }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateMobileNumber = (number: string): boolean => {
    // Remove all non-digit characters
    const digits = number.replace(/\D/g, '');
    return digits.length === 10;
  };

  const handleSendOTP = async () => {
    setError('');

    // Validate mobile number
    if (!validateMobileNumber(mobileNumber)) {
      setError(t('errors.invalidMobile'));
      return;
    }

    setLoading(true);

    try {
      const response = await sendOTP(mobileNumber);

      if (response.success) {
        // Navigate to OTP verification screen
        navigation.navigate('OTPVerification', { mobileNumber });
      } else {
        setError(response.error || t('errors.unknownError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMobileNumberChange = (text: string) => {
    // Only allow digits
    const digits = text.replace(/\D/g, '');
    setMobileNumber(digits);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="displaySmall" style={styles.title}>
            Agrinext
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            {t('auth.login')}
          </Text>

          <View style={styles.form}>
            <TextInput
              label={t('auth.enterMobile')}
              value={mobileNumber}
              onChangeText={handleMobileNumberChange}
              keyboardType="phone-pad"
              maxLength={10}
              mode="outlined"
              error={!!error}
              disabled={loading}
              style={styles.input}
            />
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleSendOTP}
              loading={loading}
              disabled={loading || !mobileNumber}
              style={styles.button}>
              {t('auth.sendOTP')}
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
    fontWeight: 'bold',
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
    marginBottom: spacing.xs,
  },
  button: {
    marginTop: spacing.md,
  },
});

export default LoginScreen;
