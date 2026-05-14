# Myanmar Link Field App — APK Build Guide (Step by Step)

## Total Time: ~15 minutes

---

## STEP 1: Save Code from Emergent (2 minutes)

### Option A: GitHub (Recommended)
1. In the Emergent dashboard, click **"Save to GitHub"** (top right corner)
2. Connect your GitHub account if not connected
3. Click **Push** to save all code to your GitHub repository
4. On your computer, open Terminal and run:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME/mobile
```

### Option B: Download ZIP
1. If you have GitHub connected, go to your repository page
2. Click the green **"Code"** button → **"Download ZIP"**
3. Extract the ZIP file
4. Open Terminal, navigate to the `mobile` folder:
```bash
cd Downloads/YOUR_REPO_NAME-main/mobile
```

---

## STEP 2: Install Required Tools (3 minutes)

### Install Node.js (if not installed)
- Download from: https://nodejs.org/en/download
- Choose **LTS version** (v20 or v22)
- Install with default settings

### Install Yarn
```bash
npm install -g yarn
```

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Verify installations:
```bash
node --version    # Should show v18+ 
yarn --version    # Should show 1.22+
eas --version     # Should show 12+
```

---

## STEP 3: Create Expo Account (1 minute)

### Go to: https://expo.dev/signup

1. Click **"Sign Up"**
2. Enter email: yint.ye@gmail.com
3. Create username: myanmarlink (or any name)
4. Set password
5. Verify email

### Login from Terminal:
```bash
eas login
```
- Enter your Expo username and password

---

## STEP 4: Setup Project (2 minutes)

```bash
# Navigate to mobile folder
cd mobile

# Install all dependencies
yarn install

# Link project to your Expo account
eas init
```

When `eas init` asks:
- **"Would you like to create a new EAS project?"** → Yes
- **Project name** → myanmar-link-field

---

## STEP 5: Build APK (10 minutes)

### Build Preview APK (for testing/distribution):
```bash
eas build --platform android --profile preview
```

### What happens:
```
✔ Using remote Android credentials
✔ Using Expo Application Services
◼ Build started...
◼ Waiting in queue...
◼ Building...
◼ Build completed!

🤖 Android build:
   https://expo.dev/accounts/myanmarlink/projects/myanmar-link-field/builds/xxxxx
   
📱 APK Download:
   https://expo.dev/artifacts/eas/abcdef123456.apk
```

### Click the APK download link → saves to your computer!

---

## STEP 6: Install APK on Phone (1 minute)

### Method A: Send via Telegram/WhatsApp
1. Send the .apk file to yourself or a group chat
2. Open on Android phone → tap to install
3. If prompted "Install from unknown sources" → Allow

### Method B: Send via Email
1. Compose email to field team
2. Attach the .apk file
3. Recipients download and install

### Method C: Host on Server
1. Upload .apk to your web server
2. Share download link: `https://yourserver.com/app/myanmar-link-field.apk`
3. Update the download URL in NOC → OTA Updates

---

## STEP 7: Update the OTA Download URL

After uploading the APK to your server:

1. Login to ERP as Admin/NOC
2. Go to **NOC Center → OTA Updates**
3. Click **"Publish Update"**
4. Set:
   - Version: 1.1.0
   - Download URL: https://yourserver.com/app/myanmar-link-field.apk
   - Release Notes: First release
5. Click **Publish**

Now all field technicians using the app will see "New Update Available" banner.

---

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Install deps | `yarn install` |
| Start dev server | `yarn start` |
| Build test APK | `eas build --platform android --profile preview` |
| Build Play Store | `eas build --platform android --profile production` |
| Push OTA update | `eas update --branch production --message "fix"` |
| Submit to Play Store | `eas submit --platform android` |

---

## Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### Build fails with error
```bash
# Clear cache and retry
eas build --platform android --profile preview --clear-cache
```

### APK won't install on phone
- Go to Settings → Security → Enable "Install from unknown sources"
- Or Settings → Apps → Special access → Install unknown apps

---

## File Structure Reference

```
mobile/
├── App.tsx                  ← App entry point
├── app.json                 ← Expo config (version, permissions)
├── eas.json                 ← Build profiles (dev/preview/production)
├── package.json             ← Dependencies + build scripts
├── babel.config.js          ← Babel config
├── assets/
│   ├── icon.png             ← App icon (1024x1024)
│   ├── adaptive-icon.png    ← Android adaptive icon
│   └── splash.png           ← Splash screen
└── src/
    ├── navigation/
    │   └── AppNavigator.tsx  ← Tab + Stack navigation
    ├── screens/
    │   ├── LoginScreen.tsx   ← Staff login
    │   ├── DashboardScreen.tsx ← KPIs + targets
    │   ├── JobListScreen.tsx  ← Task list
    │   ├── JobDetailScreen.tsx ← GPS proof + report
    │   ├── MapScreen.tsx      ← OpenStreetMap
    │   └── ProfileScreen.tsx  ← Settings
    ├── store/
    │   └── index.ts          ← Redux store
    └── utils/
        ├── api.ts            ← API client
        ├── offlineDB.ts      ← Offline storage
        └── otaUpdate.ts      ← OTA update checker
```

---

## API Connection

The app connects to:
```
https://isp-workforce-hub.preview.emergentagent.com/api
```

To change for production, edit `app.json`:
```json
"extra": {
  "apiUrl": "https://your-production-server.com/api"
}
```

---

## Summary

1. Save code from Emergent → GitHub → Clone
2. Install Node.js + Yarn + EAS CLI
3. Create free Expo account
4. Run `yarn install && eas build --platform android --profile preview`
5. Download APK from Expo dashboard
6. Send to field teams
7. Done! 🎉
