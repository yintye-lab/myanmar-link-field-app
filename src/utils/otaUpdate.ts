// OTA Update Manager for React Native / Expo
// Supports: Expo Updates (EAS) + Custom server OTA + Play Store

import { api } from './api';

export const APP_VERSION = '1.0.0';
export const BUILD_NUMBER = '1';
export const PLATFORM = 'android';

interface UpdateInfo {
  update_available: boolean;
  latest_version: string;
  build_number: string;
  release_notes: string;
  mandatory: boolean;
  download_url: string;
  released_at: string;
  min_version: string;
}

// Check for OTA updates from ISP server
export const checkForUpdate = async (): Promise<UpdateInfo | null> => {
  try {
    const res = await fetch(
      `https://erp.myanmarlink.online/api/ota/check?current_version=${APP_VERSION}&platform=${PLATFORM}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

// Track download
export const trackDownload = async (releaseId: string) => {
  try {
    await fetch(
      `https://erp.myanmarlink.online/api/ota/releases/${releaseId}/download`,
      { method: 'POST' }
    );
  } catch {}
};

// Check Expo Updates (for EAS Update)
export const checkExpoUpdate = async () => {
  // In production, use:
  // import * as Updates from 'expo-updates';
  // const update = await Updates.checkForUpdateAsync();
  // if (update.isAvailable) {
  //   await Updates.fetchUpdateAsync();
  //   await Updates.reloadAsync();
  // }
  console.log('Expo update check would run in production build');
};

// Compare versions (semver-like)
export const isNewerVersion = (current: string, latest: string): boolean => {
  const a = current.split('.').map(Number);
  const b = latest.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((b[i] || 0) > (a[i] || 0)) return true;
    if ((b[i] || 0) < (a[i] || 0)) return false;
  }
  return false;
};

// Format last update check time
export const getLastCheckTime = (): string => {
  const stored = localStorage.getItem('ota_last_check');
  return stored || 'Never';
};

export const setLastCheckTime = () => {
  localStorage.setItem('ota_last_check', new Date().toISOString());
};

// Should check (every 6 hours)
export const shouldCheckUpdate = (): boolean => {
  const last = localStorage.getItem('ota_last_check');
  if (!last) return true;
  const diff = Date.now() - new Date(last).getTime();
  return diff > 6 * 60 * 60 * 1000; // 6 hours
};

// Dismiss update reminder
export const dismissUpdate = (version: string) => {
  localStorage.setItem('ota_dismissed', version);
};

export const isDismissed = (version: string): boolean => {
  return localStorage.getItem('ota_dismissed') === version;
};
