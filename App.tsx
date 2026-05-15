import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Alert, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    checkForOTAUpdate();
  }, []);

  const checkForOTAUpdate = async () => {
    // Skip update check in development mode
    if (__DEV__) return;

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setIsUpdating(true);
        await Updates.fetchUpdateAsync();
        // Reload the app to apply the update
        await Updates.reloadAsync();
      }
    } catch (error) {
      // Silently fail — don't block the app if update check fails
      console.log('OTA update check failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isUpdating) {
    return (
      <View style={styles.updateContainer}>
        <ActivityIndicator size="large" color="#0052CC" />
        <Text style={styles.updateText}>Updating app...</Text>
        <Text style={styles.updateSubText}>Please wait a moment</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <StatusBar style="light" />
      <AppNavigator />
    </Provider>
  );
}

const styles = StyleSheet.create({
  updateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0052CC',
    gap: 16,
  },
  updateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  updateSubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});
