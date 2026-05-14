# Myanmar Link ISP - Field Team Mobile App

## Overview
React Native / Expo mobile application for ISP field technicians (IMFT, BMFT, NOC teams).

## Tech Stack
- **Framework**: React Native with Expo SDK 51
- **Language**: TypeScript
- **State**: Redux Toolkit
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Maps**: OpenStreetMap via Leaflet WebView
- **Auth**: JWT token (same as ERP backend)

## Project Structure
```
/app/mobile/
├── App.tsx                    # Entry point
├── app.json                   # Expo config
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── src/
    ├── navigation/
    │   └── AppNavigator.tsx   # Tab + Stack navigation
    ├── screens/
    │   ├── LoginScreen.tsx    # Staff ID + Password login
    │   ├── DashboardScreen.tsx # KPIs + Daily Target + Monthly Bonus
    │   ├── JobListScreen.tsx  # Task list with filters
    │   ├── JobDetailScreen.tsx # Full job view + report submission
    │   ├── MapScreen.tsx      # OpenStreetMap satellite view
    │   └── ProfileScreen.tsx  # User profile + settings
    ├── store/
    │   └── index.ts           # Redux store + slices
    └── utils/
        └── api.ts             # API client + all endpoints
```

## Setup & Run
```bash
cd /app/mobile
yarn install
npx expo start
```

## Build APK (Android)
```bash
npx expo build:android
# or with EAS Build:
npx eas build --platform android
```

## Features
1. **Login**: Staff ID/Password auth with JWT, quick-login buttons for IMFT/BMFT/NOC
2. **Dashboard**: Today's jobs, completed, pending, approval counts + Daily target (8-point system) + Monthly bonus tracker
3. **Job List**: Filter by status, pull-to-refresh, today's jobs highlighted
4. **Job Detail**: Customer info, Call/Navigate/Photo actions, Start Job → Submit Report workflow
5. **Report**: Customer verification (phone, house, street), Power test (-18 to -25 dBm), Work notes, NOC approval required
6. **Map**: OpenStreetMap satellite view centered on Yangon
7. **Profile**: User info, app settings, sign out

## API Connection
All API calls go to: `https://isp-workforce-hub.preview.emergentagent.com/api`
Auth via `Authorization: Bearer {token}` header.

## Key Workflow
1. Tech logs in with Staff ID
2. Views daily assigned jobs on Dashboard
3. Opens job → sees customer details
4. Taps "Start Job" (GPS check-in)
5. Performs work at customer site
6. Fills report: phone verification, power test, work notes
7. Taps "Submit for NOC Approval"
8. Status → "Pending Approval" (cannot self-complete)
9. NOC reviews and approves → "Completed"
