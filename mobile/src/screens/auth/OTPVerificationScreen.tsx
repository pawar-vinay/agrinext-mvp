/**
 * OTP Verification Screen
 * OTP code input and verification
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { verifyOTP, sendOTP } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { theme, spacing } from '../../theme';

type OTPVerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'OTPVerification'
>;
type OTPVerificationScreenRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

interface Props {
  navigation: OTPVerificationScreenNavigationProp;
  route: OTPVerificationScreenRouteProp;
}

const OTPVerificationScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { mobileNumber } = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const handleVerifyOTP = async () => {
    setError('');

    // Validate OTP
    if (otp.length !== 6) {
      setError(t('errors.invalidOTP'));
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOTP(mobileNumber, otp);

      if (response.success && response.data) {
        const { isNewUser, tokens, user } = response.data;

        if (isNewUser) {
          // Navigate to registration screen
          navigation.navigate('Registration', { mobileNumber, tokens });
        } else if (user) {
          // Login existing user
          await login(tokens, user);
          // Navigation will be handled by RootNavigator
        }
      } else {
        setError(response.error || t('errors.invalidOTP'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setResending(true);

    try {
      const response = await sendOTP(mobileNumber);

      if (!response.success) {
        setError(response.error || t('errors.unknownError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setResending(false);
    }
  };

  const handleOTPChange = (text: string) => {
    // Only allow digits
    const digits = text.replace(/\D/g, '');
    setOtp(digits);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            {t('auth.verifyOTP')}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('auth.enterOTP')}
          </Text>
          <Text variant="bodySmall" style={styles.mobileNumber}>
            {mobileNumber}
          </Text>

          <View style={styles.form}>
            <TextInput
              label={t('auth.enterOTP')}
              value={otp}
              onChangeText={handleOTPChange}
              keyboardType="number-pad"
              maxLength={6}
              mode="outlined"
              error={!!error}
              disabled={loading}
              style={styles.input}
              autoFocus
            />
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleVerifyOTP}
              loading={loading}
              disabled={loading || otp.length !== 6}
              style={styles.button}>
              {t('auth.verify')}
            </Button>

            <Button
              mode="text"
              onPress={handleResendOTP}
              loading={resending}
              disabled={resending || loading}
              style={styles.resendButton}>
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
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
  },
  mobileNumber: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    marginBottom: spacing.xl,
    fontWeight: 'bold',
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
  resendButton: {
    marginTop: spacing.sm,
  },
});

export default OTPVerificationScreen;
