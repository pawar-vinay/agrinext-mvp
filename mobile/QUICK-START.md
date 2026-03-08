# Quick Start Guide - Agrinext Mobile App

## TL;DR - Get Running in 5 Minutes

### Prerequisites Check
```bash
node --version  # Should be v18+
npm --version   # Should be 9+
```

### Quick Setup

1. **Install dependencies**
```bash
cd mobile
npm install
```

2. **Start Metro bundler** (keep this running)
```bash
npm start
```

3. **Run the app** (in a new terminal)

For Android:
```bash
npm run android
```

For iOS (Mac only):
```bash
npm run ios
```

## First Time Setup

If this is your first time:

### Android Users
1. Install Android Studio: https://developer.android.com/studio
2. Create an emulator (Pixel 5, Android 13)
3. Start the emulator before running `npm run android`

### iOS Users (Mac only)
1. Install Xcode from App Store
2. Run: `cd ios && pod install && cd ..`
3. Run: `npm run ios`

## Testing the App

1. **Login**: Use any mobile number (e.g., +919876543210)
2. **OTP**: Check backend logs or use Twilio
3. **Explore**: Test disease detection, advisory, schemes

## Common Issues

**"Unable to load script"**
```bash
npm start -- --reset-cache
```

**"SDK location not found" (Android)**
```bash
echo "sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

**"Connection refused"**
- Check `.env` file has correct API_BASE_URL
- Verify backend is running: http://3.239.184.220:3000/health

## Need Help?

See full guide: `MOBILE-APP-SETUP-GUIDE.md`
