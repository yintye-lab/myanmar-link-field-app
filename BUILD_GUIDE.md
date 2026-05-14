# Myanmar Link ISP - Field Team Mobile App
# EAS Build & Deployment Guide

## Prerequisites

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
# Create account at https://expo.dev if you don't have one
```

### 3. Configure Project
```bash
cd /app/mobile
eas init
# This links your project to Expo cloud
```

---

## Build Commands

### Development APK (Debug, for testing)
```bash
# Build debug APK — installs directly on device
eas build --platform android --profile development

# Output: .apk file downloadable from Expo dashboard
```

### Preview APK (Release, for internal testing)
```bash
# Build release APK for internal distribution
eas build --platform android --profile preview

# Share the download link with your field teams
```

### Production AAB (Google Play Store)
```bash
# Build Android App Bundle for Play Store submission
eas build --platform android --profile production

# Output: .aab file ready for Google Play Console upload
```

---

## Local APK Build (Without Expo Cloud)

If you want to build locally without Expo cloud:

```bash
# Install dependencies
cd /app/mobile
yarn install

# Generate Android project
npx expo prebuild --platform android

# Build APK locally
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

---

## OTA Updates (No Rebuild Needed)

For JavaScript-only changes, push updates instantly:

```bash
# Push OTA update to preview channel
eas update --branch preview --message "Bug fixes and improvements"

# Push OTA update to production channel
eas update --branch production --message "v1.1.1 - Performance improvements"

# Users get the update automatically on next app launch
```

---

## Google Play Store Submission

### 1. First-time setup
```bash
# Create upload keystore (one time)
eas credentials

# Configure Google Play service account
# Download JSON key from Google Play Console → API Access
# Save as /app/mobile/google-play-key.json
```

### 2. Submit to Play Store
```bash
# Build + submit to internal testing track
eas submit --platform android --profile production

# Or manually upload .aab from Expo dashboard to Play Console
```

### 3. Play Store Listing Requirements
- App name: "Myanmar Link Field"
- Package: com.myanmarlink.field
- Category: Business / Productivity
- Content rating: Everyone
- Screenshots: Phone + Tablet (if applicable)
- Privacy policy URL required

---

## Distribution Options

### Option A: Direct APK Distribution
1. Build with `eas build --profile preview`
2. Download APK from Expo dashboard
3. Host APK on your server (e.g., https://myanmarlink.com/app/latest.apk)
4. Update the OTA release URL in NOC → OTA Updates
5. Field teams download from the update banner in the app

### Option B: Google Play Store
1. Build with `eas build --profile production`
2. Upload .aab to Google Play Console
3. Publish to internal/beta/production track
4. Teams update via Play Store

### Option C: Expo OTA Updates (Fastest)
1. Make code changes
2. Run `eas update --branch production`
3. Users get updates on next app launch (no download needed)
4. Only works for JS changes, not native module changes

---

## Environment Configuration

### API URL
Set in `app.json` → `extra.apiUrl`:
```json
"apiUrl": "https://isp-workforce-hub.preview.emergentagent.com/api"
```

For production, change to your actual server URL.

### Version Management
- `version` in `app.json` → Display version (1.1.0)
- `android.versionCode` → Play Store version code (auto-increments with EAS)
- OTA updates don't need version bumps

---

## Troubleshooting

### Build fails?
```bash
# Clear cache and rebuild
eas build --platform android --profile preview --clear-cache
```

### App crashes on launch?
```bash
# Check build logs
eas build:list
# View logs for specific build
eas build:view <build-id>
```

### OTA update not showing?
```bash
# Check update status
eas update:list
# Verify channel matches build profile
```
