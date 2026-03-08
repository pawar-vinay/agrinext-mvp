/**
 * Custom Button Component
 * Reusable button with consistent styling
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const getButtonStyle = () => {
    if (disabled) return [styles.button, styles.buttonDisabled, style];
    
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.buttonSecondary, style];
      case 'outline':
        return [styles.button, styles.buttonOutline, style];
      default:
        return [styles.button, styles.buttonPrimary, style];
    }
  };

  const getTextStyle = () => {
    if (disabled) return [styles.text, styles.textDisabled];
    
    switch (variant) {
      case 'outline':
        return [styles.text, styles.textOutline];
      default:
        return styles.text;
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#4CAF50' : '#FFFFFF'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50',
  },
  buttonSecondary: {
    backgroundColor: '#2196F3',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textOutline: {
    color: '#4CAF50',
  },
  textDisabled: {
    color: '#999999',
  },
});

export default Button;
