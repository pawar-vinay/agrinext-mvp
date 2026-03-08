# Agrinext Mobile App

React Native mobile application for Agrinext - Agricultural disease detection and advisory platform.

## Features

- **Authentication**: OTP-based login with JWT tokens
- **Disease Detection**: AI-powered crop disease detection
- **Farming Advisory**: OpenAI-powered farming advice
- **Government Schemes**: Browse and search government schemes
- **Multilingual**: Support for English, Hindi, and Telugu
- **Offline Support**: Cache data for offline viewing

## Tech Stack

- React Native 0.73
- TypeScript
- React Navigation
- React Native Paper (Material Design)
- i18next (Internationalization)
- Axios (HTTP client)
- React Native Keychain (Secure storage)

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── dashboard/    # Dashboard screen
│   │   ├── detection/    # Disease detection screens
│   │   ├── advisory/     # Advisory screens
│   │   ├── schemes/      # Government schemes screens
│   │   └── profile/      # Profile screens
│   ├── navigation/       # Navigation configuration
│   ├── contexts/         # React contexts (Auth, Language)
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── i18n/             # Internationalization
│   ├── config/           # App configuration
│   ├── theme/            # Theme configuration
│   └── App.tsx           # Root component
├── android/              # Android native code
├── ios/                  # iOS native code
└── package.json
```

## Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- React Native development environment
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### Installation

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Install iOS pods (macOS only):
```bash
cd ios
pod install
cd ..
```

### Running the App

#### Android
```bash
npm run android
```

#### iOS (macOS only)
```bash
npm run ios
```

#### Start Metro bundler
```bash
npm start
```

## Configuration

Update API endpoint in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_SERVER_IP:3000',
  API_VERSION: 'v1',
};
```

## Available Scripts

- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm start` - Start Metro bundler
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Features Implementation Status

### ✅ Completed
- Project setup with TypeScript
- Navigation structure (Stack + Bottom Tabs)
- Internationalization (English, Hindi, Telugu)
- Secure token storage
- API client with auto token refresh
- Authentication screens (Login, OTP, Registration)
- AuthContext for global state
- LanguageContext for language management
- Dashboard screen
- Profile screen with logout

### 🚧 In Progress
- Disease detection screens
- Advisory screens
- Government schemes screens
- Profile edit screen
- Offline functionality
- Shared UI components

## API Integration

The app connects to the Agrinext backend API:

- **Base URL**: `http://3.239.184.220:3000/api/v1`
- **Authentication**: JWT Bearer tokens
- **Token Refresh**: Automatic token refresh on 401 errors

## Security

- Tokens stored securely using React Native Keychain
- Automatic token refresh
- Secure HTTPS communication (production)
- Input validation and sanitization

## Internationalization

Supported languages:
- English (en)
- Hindi (hi)
- Telugu (te)

Translation files located in `src/i18n/locales/`

## License

MIT
