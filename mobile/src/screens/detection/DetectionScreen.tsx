/**
 * Detection Screen
 * Camera and gallery image selection for disease detection with history tab
 */

import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { Text, Button, Card, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { RootStackParamList } from '../../types';
import { detectDisease } from '../../services/diseaseService';
import DetectionHistoryScreen from './DetectionHistoryScreen';
import { theme, spacing } from '../../theme';

type DetectionScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const DetectionScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation<DetectionScreenNavigationProp>();

  const [selectedTab, setSelectedTab] = useState('detect');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  /**
   * Compress image before upload
   */
  const compressImage = async (uri: string): Promise<string> => {
    try {
      const response = await ImageResizer.createResizedImage(
        uri,
        1920, // max width
        1920, // max height
        'JPEG',
        80, // quality
        0, // rotation
        undefined,
        false,
        { mode: 'contain', onlyScaleDown: true }
      );
      return response.uri;
    } catch (err) {
      console.error('Image compression failed:', err);
      return uri; // Return original if compression fails
    }
  };

  /**
   * Handle image selection from camera or gallery
   */
  const handleImageSelected = async (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert(t('common.error'), response.errorMessage || t('errors.unknownError'));
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      if (asset.uri) {
        setSelectedImage(asset.uri);
        setError('');
      }
    }
  };

  /**
   * Launch camera
   */
  const handleTakePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        saveToPhotos: false,
      },
      handleImageSelected
    );
  };

  /**
   * Launch gallery
   */
  const handleSelectFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      },
      handleImageSelected
    );
  };

  /**
   * Upload and detect disease
   */
  const handleDetect = async () => {
    if (!selectedImage) {
      return;
    }

    setError('');
    setDetecting(true);

    try {
      // Compress image
      const compressedUri = await compressImage(selectedImage);

      // Upload and detect
      const response = await detectDisease(compressedUri);

      if (response.success && response.data) {
        // Navigate to result screen
        navigation.navigate('DetectionResult', { detectionId: response.data.id });
        // Clear selected image
        setSelectedImage(null);
      } else {
        setError(response.error || t('errors.unknownError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setDetecting(false);
    }
  };

  const renderDetectTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          {t('detection.title')}
        </Text>

        {selectedImage ? (
          <Card style={styles.imageCard}>
            <Card.Cover source={{ uri: selectedImage }} style={styles.image} />
            <Card.Actions>
              <Button onPress={() => setSelectedImage(null)} disabled={detecting}>
                {t('common.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleDetect}
                loading={detecting}
                disabled={detecting}>
                {detecting ? t('detection.detecting') : t('detection.title')}
              </Button>
            </Card.Actions>
          </Card>
        ) : (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleTakePhoto}
              icon="camera"
              style={styles.button}>
              {t('detection.takePhoto')}
            </Button>

            <Button
              mode="outlined"
              onPress={handleSelectFromGallery}
              icon="image"
              style={styles.button}>
              {t('detection.selectFromGallery')}
            </Button>
          </View>
        )}

        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error}
              </Text>
            </Card.Content>
          </Card>
        )}

        {detecting && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              {t('detection.detecting')}
            </Text>
            <Text variant="bodySmall" style={styles.loadingSubtext}>
              This may take up to 30 seconds...
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={selectedTab}
        onValueChange={setSelectedTab}
        buttons={[
          {
            value: 'detect',
            label: 'Detect',
            icon: 'camera',
          },
          {
            value: 'history',
            label: 'History',
            icon: 'history',
          },
        ]}
        style={styles.segmentedButtons}
      />

      {selectedTab === 'detect' ? renderDetectTab() : <DetectionHistoryScreen />}
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
  content: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: theme.colors.primary,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  button: {
    marginBottom: spacing.md,
  },
  imageCard: {
    marginBottom: spacing.md,
  },
  image: {
    height: 300,
  },
  errorCard: {
    marginTop: spacing.md,
    backgroundColor: theme.colors.errorContainer,
  },
  errorText: {
    color: theme.colors.error,
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
});

export default DetectionScreen;
