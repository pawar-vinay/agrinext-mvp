# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Backend server running at http://3.239.184.220:3000

## Installation & Running

1. Navigate to the web-app directory:
```bash
cd web-app
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to: http://localhost:5173

## Testing the Application

### 1. Login
- Enter a 10-digit mobile number (e.g., 9876543210)
- Click "Send OTP"
- Enter the OTP received via SMS
- Click "Verify OTP"

### 2. Dashboard
- View quick access cards for all features
- See your profile stats (crop, location, language)

### 3. Disease Detection
- Click "Detect Disease" from dashboard or sidebar
- Upload a crop image (JPEG, PNG, max 10MB)
- Click "Detect Disease"
- View results with disease name, confidence, and recommendations

### 4. Advisory
- Click "Ask Question" from dashboard or sidebar
- Type your farming question (max 500 characters)
- Click "Ask Question"
- View AI-generated advice
- Browse previous questions in history

### 5. Government Schemes
- Click "Browse Schemes" from dashboard or sidebar
- Search schemes by keyword
- Filter by category (subsidy, loan, insurance, training)
- View scheme details including eligibility and benefits

### 6. Profile
- Click "Profile" from sidebar
- Click "Edit Profile"
- Update name, location, primary crop, or language
- Click "Save Changes"
- Language changes apply immediately to the UI

## Production Build

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist` folder.

To preview the production build:

```bash
npm run preview
```

## Troubleshooting

### Port already in use
If port 5173 is already in use, Vite will automatically use the next available port.

### API connection errors
- Verify the backend server is running at http://3.239.184.220:3000
- Check your internet connection
- Check browser console for detailed error messages

### Build errors
If you encounter build errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Features Implemented

✅ OTP-based authentication
✅ Dashboard with quick access
✅ Disease detection with image upload
✅ AI-powered farming advisory
✅ Government schemes browser
✅ Profile management
✅ Multilingual support (English, Hindi, Telugu)
✅ Responsive design
✅ Error handling
✅ Loading states

## Next Steps

- Deploy to production server
- Add offline functionality
- Implement caching for better performance
- Add more comprehensive error handling
- Add analytics tracking
