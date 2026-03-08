# Demo Mode Enabled

## What Changed

The web app is now in **DEMO MODE** with automatic authentication bypass.

### Changes Made:

1. **Auto-Login**: The app automatically logs in with a default user on page load
2. **No OTP Required**: Authentication is bypassed completely
3. **Login Page Disabled**: `/login` redirects to dashboard automatically

### Default Demo User

```json
{
  "id": 1,
  "name": "Ashok Kumar",
  "mobile_number": "9876543210",
  "location": "Karnataka",
  "primary_crop": "Rice",
  "language": "en"
}
```

## Accessing the App

Simply start the development server and all pages will be accessible:

```bash
cd web-app
npm run dev
```

Then open: `http://localhost:5173`

You'll be automatically logged in as "Ashok Kumar" and can access all pages:

- ✅ Dashboard: `http://localhost:5173/`
- ✅ Disease Detection: `http://localhost:5173/disease-detection`
- ✅ Advisory: `http://localhost:5173/advisory`
- ✅ Government Schemes: `http://localhost:5173/schemes`
- ✅ Profile: `http://localhost:5173/profile`

## How It Works

### AuthContext.tsx
- On mount, automatically creates a demo user
- Sets fake authentication token in localStorage
- Marks user as authenticated

### App.tsx
- Login route redirects to dashboard
- All protected routes are accessible immediately

## Reverting to Normal Authentication

To restore normal OTP authentication:

1. **Revert AuthContext.tsx**:
```typescript
useEffect(() => {
  // Check for stored auth token
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  if (token && storedUser) {
    setUser(JSON.parse(storedUser));
    setIsAuthenticated(true);
  }
}, []);
```

2. **Revert App.tsx**:
```typescript
<Route path="/login" element={<Login />} />
```

## Notes

- This is for **DEMO/TESTING purposes only**
- Do NOT use in production
- Backend API calls will still require valid tokens (may fail)
- To test with real backend, you'll need to verify phone numbers in Twilio

## Testing Backend Integration

Even in demo mode, the app will try to make real API calls. To test:

1. Verify a phone number in Twilio console
2. Use the Login page with real OTP
3. Or keep demo mode for UI testing only

---

**Demo User**: Ashok Kumar  
**Mode**: Auto-Login Enabled  
**Authentication**: Bypassed
