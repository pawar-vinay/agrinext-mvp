# 🚀 Agrinext MVP - Phase 1 & 2 Setup Guide

## Overview

This guide will walk you through setting up and building Phase 1 (Foundation) and Phase 2 (Core Features) of the Agrinext MVP.

---

## ✅ Prerequisites

Before starting, ensure you have:

- [x] Node.js 18+ installed
- [x] PostgreSQL 14+ installed
- [x] Git installed
- [x] Code editor (VS Code recommended)
- [x] Postman or similar API testing tool
- [x] Android Studio (for mobile development)

---

## 📋 Phase 1: Foundation Setup

### Step 1: Database Setup (COMPLETED ✅)

The database is already set up! Files created:
- `database/schema.sql` - Database schema
- `database/seed-data.sql` - Sample data
- `database/setup.ps1` - Windows setup script

To initialize the database:

```powershell
cd database
.\setup.ps1
```

### Step 2: Backend Setup

#### 2.1 Install Dependencies

```powershell
cd backend
npm install
```

#### 2.2 Configure Environment

```powershell
# Copy example env file
copy .env.example .env

# Edit .env file with your credentials
notepad .env
```

**Required Configuration:**
- Database credentials (from Step 1)
- JWT secrets (generate random strings)
- Twilio credentials (sign up at twilio.com)
- AWS credentials (for S3 image storage)
- OpenAI API key (for advisory)

#### 2.3 Start Backend Server

```powershell
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start at: `http://localhost:3000`

### Step 3: Test Backend APIs

Use Postman to test:

**Health Check:**
```
GET http://localhost:3000/api/v1/health
```

**Send OTP:**
```
POST http://localhost:3000/api/v1/auth/send-otp
Body: { "mobile_number": "+919876543210" }
```

---

## 📱 Mobile App Setup

### Step 1: Create React Native Project

```powershell
# Install React Native CLI
npm install -g react-native-cli

# Create new project
npx react-native init AgrinextMobile
cd AgrinextMobile
```

### Step 2: Install Dependencies

```powershell
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install axios react-native-async-storage
npm install react-native-image-picker
npm install react-native-vector-icons
```

### Step 3: Configure Environment

Create `mobile/.env`:
```
API_BASE_URL=http://10.0.2.2:3000/api/v1
```

Note: `10.0.2.2` is the Android emulator's localhost

### Step 4: Run Mobile App

```powershell
# Start Metro bundler
npm start

# Run on Android (in another terminal)
npm run android
```

---

## 🔧 Development Workflow

### Backend Development

1. **Create Feature Branch**
   ```powershell
   git checkout -b feature/authentication
   ```

2. **Write Code**
   - Controllers in `backend/src/controllers/`
   - Routes in `backend/src/routes/`
   - Services in `backend/src/services/`

3. **Test APIs**
   - Use Postman collections
   - Write unit tests with Jest

4. **Commit Changes**
   ```powershell
   git add .
   git commit -m "feat: add authentication API"
   ```

### Mobile Development

1. **Create Screens**
   - Screens in `mobile/src/screens/`
   - Components in `mobile/src/components/`

2. **Connect to APIs**
   - API services in `mobile/src/services/`
   - Use axios for HTTP requests

3. **Test on Device**
   - Use Android emulator
   - Test on physical device

---

## 📦 What's Been Created

### Backend Structure:
```
backend/
├── src/
│   ├── config/
│   │   └── database.js          ✅ Database connection
│   ├── utils/
│   │   └── logger.js             ✅ Winston logger
│   ├── controllers/              🔨 To be created
│   ├── routes/                   🔨 To be created
│   ├── services/                 🔨 To be created
│   └── middleware/               🔨 To be created
├── package.json                  ✅ Dependencies defined
└── .env.example                  ✅ Environment template
```

### Database:
```
database/
├── schema.sql                    ✅ Complete schema
├── seed-data.sql                 ✅ Sample data
├── setup.ps1                     ✅ Setup script
└── README.md                     ✅ Documentation
```

---

## 🎯 Phase 1 Implementation Checklist

### Week 1: Backend Foundation

- [ ] **Day 1-2: Project Setup**
  - [x] Initialize Node.js project
  - [x] Set up database connection
  - [x] Configure logging
  - [ ] Create error handling middleware
  - [ ] Set up API versioning

- [ ] **Day 3-4: Authentication API**
  - [ ] Create OTP service (Twilio integration)
  - [ ] Create JWT service
  - [ ] Build auth controller
  - [ ] Create auth routes
  - [ ] Test OTP flow

- [ ] **Day 5-7: API Gateway & Middleware**
  - [ ] Create authentication middleware
  - [ ] Add rate limiting
  - [ ] Add request validation
  - [ ] Add CORS configuration
  - [ ] Create API documentation

### Week 2: Mobile App Foundation

- [ ] **Day 1-2: App Setup**
  - [ ] Initialize React Native project
  - [ ] Set up navigation
  - [ ] Create app theme/styling
  - [ ] Set up state management

- [ ] **Day 3-4: Authentication Screens**
  - [ ] Create Login screen
  - [ ] Create OTP verification screen
  - [ ] Create Registration screen
  - [ ] Integrate with backend APIs

- [ ] **Day 5-7: Profile & Dashboard**
  - [ ] Create profile creation screen
  - [ ] Create dashboard screen
  - [ ] Implement logout functionality
  - [ ] Add loading states

---

## 🎯 Phase 2 Implementation Checklist

### Week 3-4: Disease Detection

- [ ] **Backend**
  - [ ] Create image upload endpoint
  - [ ] Integrate AWS S3
  - [ ] Integrate disease detection AI
  - [ ] Create detection history endpoint
  - [ ] Add translation service

- [ ] **Mobile**
  - [ ] Create camera/gallery picker
  - [ ] Create image upload UI
  - [ ] Create results display screen
  - [ ] Create history screen
  - [ ] Add loading/error states

### Week 5-6: Advisory Service

- [ ] **Backend**
  - [ ] Create advisory endpoint
  - [ ] Integrate OpenAI API
  - [ ] Add context gathering
  - [ ] Create history endpoint
  - [ ] Add rating system

- [ ] **Mobile**
  - [ ] Create query input screen
  - [ ] Create response display
  - [ ] Create history screen
  - [ ] Add rating UI
  - [ ] Add loading/error states

---

## 🧪 Testing Strategy

### Backend Testing

```powershell
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Mobile Testing

```powershell
# Run tests
npm test

# E2E tests (Detox)
npm run test:e2e
```

---

## 🚀 Deployment

### Backend Deployment (AWS EC2)

1. **Provision EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier)
   - Security group: Allow ports 22, 80, 443, 3000

2. **Deploy Application**
   ```bash
   # SSH into server
   ssh -i key.pem ubuntu@your-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Clone repository
   git clone your-repo-url
   cd backend
   npm install --production
   
   # Start with PM2
   npm install -g pm2
   pm2 start src/server.js --name agrinext-api
   pm2 startup
   pm2 save
   ```

### Database Deployment (AWS RDS)

1. **Create RDS PostgreSQL Instance**
   - PostgreSQL 14
   - db.t3.micro (free tier)
   - Enable public access (for development)

2. **Run Migrations**
   ```bash
   psql -h your-rds-endpoint -U postgres -d agrinext_mvp -f database/schema.sql
   ```

---

## 📚 Additional Resources

### Documentation
- [Express.js Docs](https://expressjs.com/)
- [React Native Docs](https://reactnative.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://jwt.io/introduction)

### API Services
- [Twilio SMS](https://www.twilio.com/docs/sms)
- [AWS S3](https://docs.aws.amazon.com/s3/)
- [OpenAI API](https://platform.openai.com/docs)
- [Hugging Face](https://huggingface.co/docs)

---

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Solution: Ensure PostgreSQL is running and credentials are correct

**OTP Not Sending:**
```
Error: Twilio authentication failed
```
Solution: Verify Twilio credentials in .env file

**Mobile App Not Connecting:**
```
Error: Network request failed
```
Solution: Use `10.0.2.2` instead of `localhost` for Android emulator

---

## 📞 Support

For issues or questions:
- Check logs: `backend/logs/`
- Review API documentation
- Test with Postman collections

---

## ✅ Success Criteria

### Phase 1 Complete When:
- ✅ Database is running
- ✅ Backend server starts without errors
- ✅ User can register with mobile number
- ✅ OTP verification works
- ✅ JWT authentication is functional
- ✅ Mobile app can login/logout

### Phase 2 Complete When:
- ✅ User can upload crop images
- ✅ Disease detection returns results
- ✅ User can ask farming questions
- ✅ AI-generated advice is displayed
- ✅ History is saved and viewable

---

**Ready to start?** Begin with Step 1: Database Setup!

Good luck! 🚀
