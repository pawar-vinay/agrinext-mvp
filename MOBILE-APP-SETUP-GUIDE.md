# Agrinext Mobile App Setup Guide

## Overview
This guide will help you set up and run the Agrinext React Native mobile app for testing with the deployed backend API.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Android Studio** (for Android testing)
   - Download: https://developer.android.com/studio
   - Install Android SDK and emulator

4. **Xcode** (for iOS testing - macOS only)
   - Download from Mac App Store
   - Install iOS Simulator

5. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

## Step 1: Configure API Endpoint

Before running the app, you need to configure it to connect to your deployed backend.

### Option A: For Testing on Emulator/Simulator

Create a `.env` file in the `mobile/` directory:

```bash
cd mobile
```

Create `mobile/.env`:
```env
# API Configuration - Use your EC2 public IP
API_BASE_URL=http://3.239.184.220:3000/api/v1

# API Timeouts (milliseconds)
API_TIMEOUT_DEFAULT=10000
API_TIMEOUT_DETECTION=30000

# App Configuration
APP_NAME=Agrinext
APP_VERSION=1.0.0

# Feature Flags
ENABLE_OFFLINE_MODE=true
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false

# Debug
DEBUG_MODE=true
```

### Option B: For Testing on Physical Device

If testing on a physical Android device connected to the same network:

1. Find your computer's local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Update `.env`:
```env
API_BASE_URL=http://YOUR_LOCAL_IP:3000/api/v1
```

**Note**: Make sure your EC2 security group allows inbound traffic on port 3000 from your IP.

## Step 2: Install Dependencies

```bash
cd mobile
npm install
```

This will install all required packages (React Native, navigation, UI components, etc.)

## Step 3: Android Setup

### 3.1 Install Android Studio

1. Download and install Android Studio
2. Open Android Studio
3. Go to: Tools → SDK Manager
4. Install:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

### 3.2 Set Environment Variables

Add to your system environment variables:

**Windows:**
```
ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

**Mac/Linux:**
Add to `~/.bash_profile` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3.3 Create Android Virtual Device (AVD)

1. Open Android Studio
2. Go to: Tools → Device Manager
3. Click "Create Device"
4. Select a device (e.g., Pixel 5)
5. Select a system image (e.g., Android 13 - API 33)
6. Click "Finish"

### 3.4 Start the Emulator

Option 1: From Android Studio
- Open Device Manager
- Click the play button next to your AVD

Option 2: From command line
```bash
emulator -avd YOUR_AVD_NAME
```

## Step 4: iOS Setup (macOS only)

### 4.1 Install Xcode

1. Install Xcode from Mac App Store
2. Install Xcode Command Line Tools:
```bash
xcode-select --install
```

### 4.2 Install CocoaPods

```bash
sudo gem install cocoapods
```

### 4.3 Install iOS Dependencies

```bash
cd mobile/ios
pod install
cd ..
```

## Step 5: Run the App

### Start Metro Bundler (in one terminal)

```bash
cd mobile
npm start
```

Keep this terminal running.

### Run on Android (in another terminal)

```bash
cd mobile
npm run android
```

This will:
1. Build the Android app
2. Install it on the emulator/device
3. Launch the app

### Run on iOS (macOS only)

```bash
cd mobile
npm run ios
```

## Step 6: Test the App

Once the app launches:

1. **Login Screen**
   - Enter a mobile number (e.g., +919876543210)
   - Click "Send OTP"
   - Check backend logs for OTP (or use Twilio if configured)
   - Enter OTP and login

2. **Dashboard**
   - View available features
   - Test navigation

3. **Disease Detection**
   - Upload/capture crop image
   - Get AI-powered disease detection

4. **Advisory**
   - Ask farming questions
   - Get AI-powered advice

5. **Government Schemes**
   - Browse available schemes
   - Search and filter

## Troubleshooting

### Android Issues

**Issue: "SDK location not found"**
```bash
# Create local.properties in mobile/android/
echo "sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

**Issue: "Unable to load script"**
```bash
# Clear cache and restart
npm start -- --reset-cache
```

**Issue: "Could not connect to development server"**
- Make sure Metro bundler is running
- Check firewall settings
- Try: `adb reverse tcp:8081 tcp:8081`

### iOS Issues

**Issue: "Pod install failed"**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Issue: "Build failed"**
- Clean build folder in Xcode: Product → Clean Build Folder
- Delete `ios/build` folder
- Try again

### Network Issues

**Issue: "Network request failed"**
- Check API_BASE_URL in `.env`
- Verify backend is running: `curl http://3.239.184.220:3000/health`
- Check EC2 security group allows port 3000
- For physical device, use computer's local IP

**Issue: "Connection refused"**
- Android emulator: Use `10.0.2.2` instead of `localhost`
- iOS simulator: Use `localhost` or computer's IP

## Development Tips

### Hot Reload
- Press `r` in Metro terminal to reload
- Press `d` to open developer menu
- Shake device to open developer menu

### Debug Menu
- Android: `Ctrl+M` (Windows) or `Cmd+M` (Mac)
- iOS: `Cmd+D`

### View Logs
```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

### Clear Cache
```bash
# Clear Metro cache
npm start -- --reset-cache

# Clear npm cache
npm cache clean --force

# Rebuild
cd android && ./gradlew clean
cd ..
npm run android
```

## Building for Production

### Android APK

```bash
cd mobile/android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### iOS IPA (macOS only)

1. Open `mobile/ios/Agrinext.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Distribute App

## Next Steps

1. Test all features with the deployed backend
2. Fix any bugs or issues
3. Add more features as needed
4. Build production APK/IPA
5. Deploy to app stores (Google Play, App Store)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review React Native documentation: https://reactnative.dev/
3. Check backend API health: http://3.239.184.220:3000/health

## API Endpoints

The app connects to these backend endpoints:

- **Authentication**: `/api/v1/auth/*`
- **Disease Detection**: `/api/v1/diseases/*`
- **Advisory**: `/api/v1/advisories/*`
- **Government Schemes**: `/api/v1/schemes/*`
- **User Profile**: `/api/v1/users/*`

All endpoints require JWT authentication (except login/register).
