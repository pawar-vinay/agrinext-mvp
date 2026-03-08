# Agrinext Web Application

React + TypeScript + Vite web application for Phase 2 MVP modules.

## Features

- **Authentication**: OTP-based login with JWT tokens
- **Dashboard**: Quick access to all features with user stats
- **Disease Detection**: Upload crop images for AI-powered disease diagnosis
- **Advisory**: Ask farming questions and get AI-generated advice
- **Government Schemes**: Browse and search agricultural schemes
- **Profile Management**: Update user information and language preferences
- **Multilingual**: Support for English, Hindi, and Telugu

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- i18next (internationalization)
- Axios (API client)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure backend API URL:
The app is configured to connect to: `http://3.239.184.220:3000/api/v1`

If you need to change this, edit `web-app/src/services/api.ts`

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
web-app/
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout.tsx   # Main layout with sidebar
│   ├── contexts/        # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/           # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DiseaseDetection.tsx
│   │   ├── Advisory.tsx
│   │   ├── Schemes.tsx
│   │   └── Profile.tsx
│   ├── services/        # API services
│   │   └── api.ts
│   ├── i18n.ts          # Internationalization config
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html
├── package.json
└── vite.config.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints Used

- `POST /auth/send-otp` - Send OTP to mobile number
- `POST /auth/verify-otp` - Verify OTP and login
- `POST /auth/logout` - Logout user
- `POST /diseases/detect` - Upload image for disease detection
- `GET /diseases/history` - Get detection history
- `POST /advisories/query` - Submit farming question
- `GET /advisories/history` - Get advisory history
- `GET /schemes` - Get government schemes
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
