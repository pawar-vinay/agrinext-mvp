/**
 * Main Tab Navigator
 * Bottom tab navigation for main app features
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from '../types';
import { theme } from '../theme';
import { useTranslation } from 'react-i18next';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DetectionScreen from '../screens/detection/DetectionScreen';
import AdvisoryScreen from '../screens/advisory/AdvisoryScreen';
import SchemesScreen from '../screens/schemes/SchemesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = (): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surface,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#FFFFFF',
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('navigation.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Detection"
        component={DetectionScreen}
        options={{
          title: t('navigation.detection'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Advisory"
        component={AdvisoryScreen}
        options={{
          title: t('navigation.advisory'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="chat-question" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Schemes"
        component={SchemesScreen}
        options={{
          title: t('navigation.schemes'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
