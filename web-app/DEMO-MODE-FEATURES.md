# Demo Mode Features - Prototype Implementation

## Overview

The Agrinext web app now runs in full demo mode for hackathon prototype submission. All features work without requiring backend API connectivity, allowing judges and evaluators to test the complete application flow.

## Features Running in Demo Mode

### 1. User Registration & Authentication
- **Status**: ✅ Fully Functional
- **Implementation**: Client-side mock authentication
- Users can register with mobile number, name, location, and primary crop
- No OTP verification required
- Mock JWT tokens generated client-side
- User data stored in browser localStorage

### 2. Disease Detection
- **Status**: ✅ Fully Functional
- **Implementation**: Mock AI disease detection
- Users can upload crop images (JPEG, PNG, HEIC up to 10MB)
- Simulates 2-second AI processing delay
- Returns realistic disease detection results:
  - Leaf Blight (92% confidence, Moderate severity)
  - Powdery Mildew (88% confidence, Mild severity)
  - Bacterial Wilt (85% confidence, Severe severity)
  - Healthy Plant (95% confidence, No severity)
- Provides detailed treatment recommendations
- Results include confidence scores and severity levels

### 3. AI Advisory
- **Status**: ✅ Fully Functional
- **Implementation**: Contextual mock responses
- Users can ask farming questions (up to 500 characters)
- Simulates 1.5-second AI processing delay
- Provides intelligent responses based on keywords:
  - Pest management advice
  - Fertilizer recommendations
  - Irrigation guidance
  - Disease prevention tips
  - Soil health improvement
  - Yield optimization strategies
- Maintains conversation history in component state
- Shows previous questions and answers

### 4. Government Schemes
- **Status**: ✅ Fully Functional
- **Implementation**: Mock schemes database
- Displays 10 realistic government schemes:
  - PM-KISAN (Direct income support)
  - Kisan Credit Card (Credit facility)
  - PMFBY (Crop insurance)
  - Soil Health Card Scheme
  - e-NAM (Online trading platform)
  - PKVY (Organic farming)
  - Agriculture Infrastructure Fund
  - RKVY (State-level schemes)
  - Kisan Vikas Patra (Savings scheme)
  - Farmer Training Programs
- Features:
  - Search functionality
  - Category filtering (All, Subsidy, Loan, Insurance, Training)
  - Detailed information on eligibility, benefits, and application process

### 5. User Profile
- **Status**: ✅ Fully Functional
- **Implementation**: localStorage-based profile management
- Users can view and update their profile:
  - Name
  - Mobile number
  - Location
  - Primary crop
  - Language preference
- Changes persist in browser localStorage
- Logout functionality clears session

### 6. Multi-language Support
- **Status**: ✅ Fully Functional
- **Implementation**: i18n with English, Hindi, Telugu
- Language selector on login page
- Translations for common UI elements
- Language preference saved with user profile

## Technical Implementation

### Mock Data Generation
All mock data is generated client-side with realistic values:
- Disease detection uses random selection from predefined diseases
- Advisory responses use keyword matching for contextual answers
- Schemes data is comprehensive and based on real government programs
- User IDs use timestamps for uniqueness

### Data Persistence
- User authentication: localStorage
- User profile: localStorage
- Advisory history: Component state (session-based)
- Disease detection results: Component state (session-based)
- Schemes: Static mock data

### Simulated Delays
To provide realistic user experience:
- Disease detection: 2 seconds
- AI advisory: 1.5 seconds
- Schemes loading: 0.5 seconds

## Testing the Demo

### Complete User Journey

1. **Registration**
   ```
   Open: http://localhost:5173/login
   Fill: Mobile (9876543210), Name, Location, Primary Crop
   Click: Register
   Result: Redirected to dashboard
   ```

2. **Disease Detection**
   ```
   Navigate: Disease Detection page
   Upload: Any crop image
   Click: Detect Disease
   Wait: 2 seconds
   Result: Disease name, confidence, severity, recommendations
   ```

3. **AI Advisory**
   ```
   Navigate: Advisory page
   Type: "How to control pests in rice crop?"
   Click: Ask Question
   Wait: 1.5 seconds
   Result: Detailed pest management advice
   ```

4. **Browse Schemes**
   ```
   Navigate: Schemes page
   Search: "loan" or "insurance"
   Filter: By category
   Result: Filtered list of relevant schemes
   ```

5. **Update Profile**
   ```
   Navigate: Profile page
   Update: Name, location, or primary crop
   Click: Update Profile
   Result: Changes saved to localStorage
   ```

## Benefits for Hackathon Submission

1. **No Backend Dependency**: Works completely offline
2. **Instant Testing**: No setup or configuration required
3. **Realistic Experience**: Simulated delays and comprehensive data
4. **Full Feature Access**: All MVP features functional
5. **Easy Demonstration**: Can be shown on any device with a browser
6. **No API Keys Required**: No AWS, Twilio, or OpenAI credentials needed
7. **Reproducible**: Same experience for all judges/evaluators

## Limitations (Demo Mode)

1. **No Data Persistence**: Data cleared when browser cache is cleared
2. **No Real AI**: Responses are pre-programmed, not from actual AI models
3. **No Image Analysis**: Disease detection doesn't analyze actual image content
4. **No Backend Validation**: All validation is client-side only
5. **Single Device**: User sessions don't sync across devices
6. **No Real-time Updates**: No WebSocket or real-time features

## Production vs Demo Mode

| Feature | Demo Mode | Production Mode |
|---------|-----------|-----------------|
| Authentication | Mock tokens | Real JWT with OTP |
| Disease Detection | Random mock results | AWS Rekognition + Bedrock |
| AI Advisory | Keyword-based responses | Amazon Bedrock RAG |
| Schemes | Static mock data | RDS database |
| User Data | localStorage | RDS PostgreSQL |
| Image Storage | Browser preview only | AWS S3 |
| Multi-language | Client-side i18n | AWS Translate API |

## Switching to Production Mode

To enable production mode (requires backend):

1. Update `web-app/src/pages/DiseaseDetection.tsx`:
   - Uncomment API call to `/diseases/detect`
   - Remove mock disease generation

2. Update `web-app/src/pages/Advisory.tsx`:
   - Uncomment API call to `/advisories/query`
   - Remove mock response generation

3. Update `web-app/src/pages/Schemes.tsx`:
   - Uncomment API call to `/schemes`
   - Remove mock schemes data

4. Update `web-app/src/contexts/AuthContext.tsx`:
   - Use real JWT validation
   - Connect to backend auth endpoints

5. Configure environment variables:
   - Set `VITE_API_BASE_URL` to backend URL
   - Enable backend authentication

## Files Modified for Demo Mode

1. `web-app/src/pages/DiseaseDetection.tsx` - Mock disease detection
2. `web-app/src/pages/Advisory.tsx` - Mock AI advisory
3. `web-app/src/pages/Schemes.tsx` - Mock schemes data
4. `web-app/src/contexts/AuthContext.tsx` - Mock authentication
5. `web-app/src/pages/Login.tsx` - Registration without OTP
6. `web-app/src/App.tsx` - Removed auto-redirect

## Demo Credentials

For quick testing:
- Mobile: Any 10-digit number (e.g., 9876543210)
- Name: Any name (e.g., Ashok Kumar)
- Location: Any location (e.g., Karnataka)
- Primary Crop: Any crop (e.g., Rice)

## Notes

- All features are fully functional in demo mode
- No internet connection required after initial page load
- Data persists only in current browser session
- Perfect for hackathon demonstrations and judging
- Easy to switch to production mode when backend is ready
