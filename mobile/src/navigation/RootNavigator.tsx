/**
 * Root Navigator
 * Handles authentication flow and main app navigation
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import RegistrationScreen from '../screens/auth/RegistrationScreen';

// Main App
import MainTabNavigator from './MainTabNavigator';

// Detail Screens
import DetectionResultScreen from '../screens/detection/DetectionResultScreen';
import DetectionDetailScreen from '../screens/detection/DetectionDetailScreen';
import AdvisoryChatScreen from '../screens/advisory/AdvisoryChatScreen';
import SchemeDetailScreen from '../screens/schemes/SchemeDetailScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = (): React.JSX.Element => {
  const { user, loading } = useAuth();

  if (loading) {
    return <></>;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {!user ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <Stack.Screen name="Registration" component={RegistrationScreen} />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="DetectionResult" component={DetectionResultScreen} />
          <Stack.Screen name="DetectionDetail" component={DetectionDetailScreen} />
          <Stack.Screen name="AdvisoryChat" component={AdvisoryChatScreen} />
          <Stack.Screen name="SchemeDetail" component={SchemeDetailScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
