# Registration Without OTP - Prototype Mode

## Overview

For hackathon prototype submission, the web app now supports user registration without OTP verification. This allows judges and evaluators to quickly test the application without needing to verify phone numbers.

## Features

### Registration Mode (Default)
- Users can register with:
  - Mobile Number (10 digits)
  - Full Name
  - Location (City/District)
  - Primary Crop
- No OTP verification required
- Instant access to all features
- User data stored in browser localStorage

### Login Mode (Available but requires OTP)
- Traditional OTP-based authentication
- Requires Twilio service (currently in trial mode)
- Two-step verification process

## How It Works

### Registration Flow
1. User opens the app at `http://localhost:5173/login`
2. Registration mode is selected by default
3. User fills in:
   - Mobile number
   - Full name
   - Location
   - Primary crop
4. Clicks "Register" button
5. Instantly logged in and redirected to dashboard

### Technical Implementation

**AuthContext Changes:**
- Added `register()` method that creates user without backend API call
- Generates mock token using timestamp
- Stores user data in localStorage
- Sets authentication state immediately

**Login Page Changes:**
- Added mode selector (Register/Login toggle)
- Registration form with 4 fields
- Validation for all required fields
- Mobile number validation (10 digits)

**App.tsx Changes:**
- Removed auto-redirect from login page
- Users now see actual login/register page
- Protected routes still require authentication

## User Data Storage

User data is stored in browser localStorage:
```javascript
{
  id: 1234567890, // Timestamp-based unique ID
  mobile_number: "9876543210",
  name: "Farmer Name",
  location: "Karnataka",
  primary_crop: "Rice",
  language: "en"
}
```

## Testing the Feature

### Register a New User
1. Open `http://localhost:5173/login`
2. Ensure "Register" tab is selected
3. Enter:
   - Mobile: 9876543210
   - Name: Test Farmer
   - Location: Karnataka
   - Primary Crop: Rice
4. Click "Register"
5. You'll be redirected to dashboard

### Switch Between Users
1. Click profile icon → Logout
2. Register with different mobile number
3. Each registration creates a new user session

### Test Login Mode (Optional)
1. Click "Login" tab
2. Enter mobile number
3. Click "Send OTP"
4. Note: This requires Twilio service to be configured

## Benefits for Prototype Submission

1. **Quick Access**: Judges can test immediately without phone verification
2. **Multiple Users**: Easy to test with different user profiles
3. **No Dependencies**: Works without backend OTP service
4. **Realistic Data**: Users enter their own profile information
5. **Full Features**: Access to all app features after registration

## Production Considerations

For production deployment:
1. Enable proper OTP verification
2. Add backend user registration API
3. Implement proper user authentication
4. Add password/PIN for security
5. Store user data in database (RDS)
6. Add email verification as backup
7. Implement session management
8. Add rate limiting for registration

## Files Modified

- `web-app/src/pages/Login.tsx` - Added registration form and mode toggle
- `web-app/src/contexts/AuthContext.tsx` - Added register() method
- `web-app/src/App.tsx` - Removed auto-redirect from login
- `web-app/src/pages/Login.module.css` - Added mode selector styling

## Demo Credentials

For quick testing, you can use any 10-digit mobile number. Example:
- Mobile: 9876543210
- Name: Ashok Kumar
- Location: Karnataka
- Primary Crop: Rice

## Notes

- Registration data is stored locally in browser
- Clearing browser data will log out users
- Each browser/device maintains separate user sessions
- No server-side validation in prototype mode
- Mock tokens are generated client-side
