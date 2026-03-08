/**
 * Agrinext Mobile App Root Component
 */

import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';

import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ConnectivityProvider, useConnectivity } from './contexts/ConnectivityContext';
import RootNavigator from './navigation/RootNavigator';
import OfflineIndicator from './components/OfflineIndicator';
import { theme } from './theme';

const AppContent = (): React.JSX.Element => {
  const { isOnline } = useConnectivity();

  return (
    <View style={styles.container}>
      <OfflineIndicator isVisible={!isOnline} />
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
};

const App = (): React.JSX.Element => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <LanguageProvider>
            <ConnectivityProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </ConnectivityProvider>
          </LanguageProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
