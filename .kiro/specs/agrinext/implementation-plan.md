# Agrinext MVP - Phase 1 & 2 Implementation Plan

## Overview

This document outlines the complete implementation plan for Phase 1 (Foundation) and Phase 2 (Core Features) of the Agrinext MVP.

## Phase 1: Foundation (Week 1-2)

### Components to Build:
1. ✅ Database Setup (COMPLETED)
2. 🔨 Authentication Module
3. 🔨 API Gateway
4. 🔨 Basic Mobile App Structure

### Technology Stack:

**Backend:**
- Node.js 18+ with Express
- PostgreSQL 14+ (already set up)
- JWT for authentication
- Twilio for SMS OTP
- bcrypt for password hashing

**Mobile App:**
- React Native (faster development than native)
- React Navigation for routing
- AsyncStorage for local data
- Axios for API calls

**Development Tools:**
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Jest for testing

---

## Phase 2: Core Features (Week 3-6)

### Components to Build:
1. 🔨 Disease Detection Module
2. 🔨 Advisory Service Module

### Additional Services:
- AWS S3 / Cloudinary for image storage
- OpenAI / Anthropic API for advisory
- Hugging Face / Roboflow for disease detection
- Google Translate API for multilingual support

---

## Project Structure

```
agrinext-mvp/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── app.js             # Express app
│   ├── tests/                 # Backend tests
│   ├── package.json
│   └── .env
│
├── mobile/                     # React Native App
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── screens/           # App screens
│   │   ├── navigation/        # Navigation setup
│   │   ├── services/          # API services
│   │   ├── store/             # State management
│   │   ├── utils/             # Utility functions
│   │   └── App.js             # Root component
│   ├── android/               # Android native code
│   ├── ios/                   # iOS native code (future)
│   ├── package.json
│   └── .env
│
├── database/                   # Database files (COMPLETED)
│   ├── schema.sql
│   ├── seed-data.sql
│   ├── setup.ps1
│   └── README.md
│
└── docs/                       # Documentation
    ├── api/                   # API documentation
    └── architecture/          # Architecture docs
```

---

## Implementation Timeline

### Week 1: Backend Foundation
- **Day 1-2:** Project setup, Express server, database connection
- **Day 3-4:** Authentication API (OTP, JWT)
- **Day 5-7:** API Gateway, middleware, error handling

### Week 2: Mobile App Foundation
- **Day 1-2:** React Native setup, navigation
- **Day 3-4:** Authentication screens (Login, Register, OTP)
- **Day 5-7:** Profile creation, dashboard

### Week 3-4: Disease Detection
- **Day 1-2:** Image upload API, S3 integration
- **Day 3-4:** AI model integration (Hugging Face/Roboflow)
- **Day 5-7:** Mobile UI for disease detection
- **Day 8-10:** Results display, history

### Week 5-6: Advisory Service
- **Day 1-2:** Advisory API, LLM integration
- **Day 3-4:** Context-aware prompts, translation
- **Day 5-7:** Mobile UI for advisory
- **Day 8-10:** History, rating system

---

## Development Approach

### 1. API-First Development
- Design and document APIs first
- Use Postman/Swagger for testing
- Mobile team can work in parallel with mock data

### 2. Test-Driven Development (TDD)
- Write tests before implementation
- Maintain >80% code coverage
- Automated testing in CI/CD

### 3. Incremental Deployment
- Deploy to staging after each feature
- User acceptance testing (UAT)
- Gradual rollout to production

---

## Key Decisions

### Authentication Flow:
1. User enters mobile number
2. Backend sends OTP via Twilio
3. User enters OTP
4. Backend verifies and issues JWT
5. Mobile app stores JWT in AsyncStorage

### Image Upload Flow:
1. User captures/selects image
2. Mobile app uploads to backend
3. Backend uploads to S3/Cloudinary
4. Backend calls AI API for detection
5. Results stored in database
6. Response sent to mobile app

### Advisory Flow:
1. User types question
2. Mobile app sends to backend
3. Backend gathers context (user profile, location)
4. Backend calls LLM API with context
5. Response translated to user's language
6. Stored in database and sent to mobile

---

## Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agrinext_mvp
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# AWS S3 (Image Storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=agrinext-images

# OpenAI (Advisory)
OPENAI_API_KEY=your_openai_key

# Hugging Face (Disease Detection)
HUGGINGFACE_API_KEY=your_hf_key

# Google Translate
GOOGLE_TRANSLATE_API_KEY=your_translate_key

# Server
PORT=3000
NODE_ENV=development
```

### Mobile (.env)
```env
API_BASE_URL=http://localhost:3000/api/v1
```

---

## API Endpoints (Phase 1 & 2)

### Authentication
- POST `/api/v1/auth/send-otp` - Send OTP
- POST `/api/v1/auth/verify-otp` - Verify OTP and login
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/refresh-token` - Refresh JWT
- POST `/api/v1/auth/logout` - Logout

### User Profile
- GET `/api/v1/users/profile` - Get user profile
- PUT `/api/v1/users/profile` - Update profile
- GET `/api/v1/users/stats` - Get user statistics

### Disease Detection
- POST `/api/v1/diseases/detect` - Upload and detect disease
- GET `/api/v1/diseases/history` - Get detection history
- GET `/api/v1/diseases/:id` - Get specific detection

### Advisory
- POST `/api/v1/advisories/query` - Submit advisory query
- GET `/api/v1/advisories/history` - Get advisory history
- PUT `/api/v1/advisories/:id/rate` - Rate advisory

---

## Success Criteria

### Phase 1 Complete When:
- ✅ Database is set up and running
- ✅ User can register with mobile number
- ✅ OTP verification works
- ✅ JWT authentication is functional
- ✅ Mobile app can login/logout
- ✅ Basic dashboard is visible

### Phase 2 Complete When:
- ✅ User can upload crop images
- ✅ Disease detection returns results
- ✅ Detection history is saved and viewable
- ✅ User can ask farming questions
- ✅ AI-generated advice is displayed
- ✅ Advisory history is saved and viewable
- ✅ Multilingual support works (3 languages)

---

## Risk Mitigation

### Technical Risks:
1. **AI API Costs** - Implement rate limiting, caching
2. **Image Upload Size** - Compress images on mobile
3. **OTP Delivery** - Have fallback SMS provider
4. **Database Performance** - Proper indexing (already done)

### Timeline Risks:
1. **API Integration Delays** - Start with mock data
2. **Mobile Development** - Use React Native templates
3. **Testing Time** - Automated testing from day 1

---

## Next Steps

1. **Run Database Setup**
   ```powershell
   cd database
   .\setup.ps1
   ```

2. **Create Backend Project**
   - Initialize Node.js project
   - Set up Express server
   - Configure database connection

3. **Create Mobile Project**
   - Initialize React Native project
   - Set up navigation
   - Create authentication screens

4. **Start Development**
   - Backend team: Authentication API
   - Mobile team: Login/Register screens
   - Parallel development with mock data

---

## Team Allocation

### Backend Developer (1)
- Week 1-2: Authentication, API Gateway
- Week 3-4: Disease Detection API
- Week 5-6: Advisory API

### Mobile Developer (1)
- Week 1-2: App setup, Authentication UI
- Week 3-4: Disease Detection UI
- Week 5-6: Advisory UI

### ML Engineer (Part-time)
- Week 3-4: Disease detection model integration
- Week 5-6: Advisory LLM integration

---

**Ready to start building?** Let me know which component you want to create first!
