# Implementation Plan: Phase 2 Development - Agrinext MVP

## Overview

This implementation plan breaks down the Phase 2 Development into discrete coding tasks that build upon the completed Phase 1 infrastructure. The implementation follows a layered approach: backend services first, then mobile application, with testing integrated throughout. All code will be written in TypeScript for type safety and maintainability.

## Tasks

- [x] 1. Set up backend project structure and core infrastructure
  - Create TypeScript backend project with Express
  - Set up database connection pooling (10-50 connections)
  - Configure environment variables for all external services
  - Set up structured logging infrastructure with log levels
  - Create base error classes and error handler middleware
  - _Requirements: 11.5, 13.1, 13.6_

- [ ]* 1.1 Write property test for error handler middleware
  - **Property 36: Error Message Safety**
  - **Validates: Requirements 13.2**

- [x] 2. Implement authentication service and OTP functionality
  - [x] 2.1 Create Twilio integration for OTP sending
    - Implement sendOTP function with retry logic and exponential backoff
    - Generate 6-digit OTP codes with 10-minute expiration
    - Store OTP codes with timestamps in database or cache
    - _Requirements: 1.1, 1.4_

  - [x] 2.2 Implement OTP rate limiting
    - Create rate limiter middleware tracking requests per mobile number
    - Enforce 3 OTP requests per hour limit
    - Return error with retry time when limit exceeded
    - _Requirements: 1.2, 1.3_

  - [ ]* 2.3 Write property test for OTP rate limiting
    - **Property 1: OTP Rate Limiting Enforcement**
    - **Validates: Requirements 1.2**

  - [x] 2.4 Implement OTP verification and JWT token generation
    - Create verifyOTP function validating code and expiration
    - Generate JWT access tokens (1-hour expiry) and refresh tokens (30-day expiry)
    - Hash refresh tokens before storing in user_sessions table
    - _Requirements: 1.4, 1.5, 7.10, 11.3_

  - [ ]* 2.5 Write property tests for token generation and validation
    - **Property 2: Valid OTP Verification Within Time Window**
    - **Property 3: Token Expiration Times**
    - **Property 20: Token Validation Enforcement**
    - **Property 22: Session Storage with Token Hashing**
    - **Validates: Requirements 1.4, 1.5, 7.4, 7.8, 11.1, 7.10, 11.3**

  - [x] 2.6 Implement user registration
    - Create registerUser function accepting profile data
    - Validate required fields (name, location, primary crop, language)
    - Insert user record into users table
    - _Requirements: 1.6, 1.7, 7.6_

  - [ ]* 2.7 Write property tests for user registration
    - **Property 4: User Registration Data Persistence**
    - **Property 21: Required Profile Fields Validation**
    - **Validates: Requirements 1.7, 7.6**

  - [x] 2.8 Implement token refresh and logout
    - Create refreshAccessToken function validating refresh token
    - Create logout function invalidating tokens in user_sessions table
    - _Requirements: 1.8, 1.9_

  - [ ]* 2.9 Write property tests for token lifecycle
    - **Property 5: Token Refresh Round-Trip**
    - **Property 6: Session Invalidation on Logout**
    - **Validates: Requirements 1.8, 1.9**

- [x] 3. Create authentication API endpoints
  - [x] 3.1 Implement POST /api/v1/auth/send-otp endpoint
    - Validate 10-digit mobile number format
    - Call sendOTP service function
    - Return success response with expiration time
    - _Requirements: 7.1, 7.2_

  - [ ]* 3.2 Write property test for mobile number validation
    - **Property 19: Invalid Mobile Number Rejection**
    - **Validates: Requirements 7.2**

  - [x] 3.3 Implement POST /api/v1/auth/verify-otp endpoint
    - Accept mobile number and OTP code
    - Call verifyOTP service function
    - Return tokens and isNewUser flag
    - _Requirements: 7.3, 7.4_

  - [x] 3.4 Implement POST /api/v1/auth/register endpoint
    - Accept user profile data
    - Validate required fields
    - Call registerUser service function
    - Return user profile and tokens
    - _Requirements: 7.5, 7.6_

  - [x] 3.5 Implement POST /api/v1/auth/refresh-token endpoint
    - Accept refresh token
    - Call refreshAccessToken service function
    - Return new access token
    - _Requirements: 7.7, 7.8_

  - [x] 3.6 Implement POST /api/v1/auth/logout endpoint
    - Extract user ID from JWT token
    - Call logout service function
    - Return success response
    - _Requirements: 7.9_

- [x] 4. Implement JWT authentication middleware
  - Create authMiddleware validating JWT signature and expiration
  - Extract user ID from token and attach to request object
  - Return 401 Unauthorized for invalid/expired tokens
  - Log authentication failures to audit_logs table
  - _Requirements: 11.1, 11.7, 13.1_

- [ ]* 4.1 Write property tests for authentication middleware
  - **Property 14: Unauthenticated Request Rejection**
  - **Validates: Requirements 4.2**

- [x] 5. Implement disease detection service
  - [x] 5.1 Create S3 image upload functionality
    - Implement uploadToS3 function with folder structure {year}/{month}/{user_id}/{filename}
    - Generate unique UUID-based filenames
    - Compress images to maximum 2MB before upload
    - Validate image format (JPEG, PNG, HEIC)
    - Store image metadata (size, format, dimensions)
    - _Requirements: 3.2, 10.1, 10.2, 10.3, 10.7, 10.9_

  - [ ]* 5.2 Write property tests for image upload
    - **Property 9: Image Upload with Unique Identifiers**
    - **Property 28: Image Storage Folder Structure**
    - **Property 29: Image Compression Before Upload**
    - **Property 31: Image Format Validation**
    - **Property 32: Image Metadata Storage**
    - **Validates: Requirements 3.2, 10.1, 10.2, 10.3, 10.7, 10.9**

  - [x] 5.3 Integrate AI model for disease detection
    - Implement Hugging Face API integration for disease detection
    - Implement Roboflow API as fallback
    - Create detectDiseaseWithFallback function with error handling
    - Parse AI model response for disease name, severity, confidence score
    - _Requirements: 3.3, 3.4, 3.5, 4.8, 4.9_

  - [x] 5.4 Implement disease detection workflow
    - Create detectDisease function orchestrating upload and AI inference
    - Store detection results in disease_detections table with all fields
    - Generate presigned URLs with 1-hour expiration for image access
    - Implement translation of disease names and recommendations
    - _Requirements: 3.6, 3.7, 3.8, 10.4, 10.5_

  - [ ]* 5.5 Write property tests for detection workflow
    - **Property 10: Detection Result Completeness**
    - **Property 30: Presigned URL Generation with Expiration**
    - **Validates: Requirements 3.6, 10.4, 10.5**

  - [x] 5.6 Implement detection history and retrieval
    - Create getDetectionHistory function with pagination
    - Order detections by timestamp descending
    - Create getDetectionById function with authorization check
    - Include presigned URLs in history responses
    - _Requirements: 3.9, 3.10_

  - [ ]* 5.7 Write property tests for detection history
    - **Property 11: Detection History Ordering**
    - **Property 12: Detection Data Round-Trip**
    - **Validates: Requirements 3.9, 3.10**

- [x] 6. Create disease detection API endpoints
  - [x] 6.1 Implement POST /api/v1/diseases/detect endpoint
    - Accept multipart/form-data with image file
    - Validate authentication with JWT middleware
    - Validate image size (max 10MB)
    - Call detectDisease service function
    - Handle S3 upload failures with 500 error
    - Handle AI model failures with 503 error
    - Log all detection requests to audit_logs table
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.9, 4.10_

  - [x] 6.2 Implement GET /api/v1/diseases/history endpoint
    - Accept pagination parameters (page, limit)
    - Call getDetectionHistory service function
    - Return paginated detection results
    - _Requirements: 4.5_

  - [x] 6.3 Implement GET /api/v1/diseases/:id endpoint
    - Extract detection ID from URL parameter
    - Call getDetectionById service function
    - Enforce authorization (user can only access own detections)
    - Return 403 Forbidden for cross-user access attempts
    - _Requirements: 4.6, 4.7_

  - [ ]* 6.4 Write property test for cross-user authorization
    - **Property 13: Cross-User Authorization Enforcement**
    - **Validates: Requirements 4.7, 6.7**

- [x] 7. Implement farming advisory service
  - [x] 7.1 Create OpenAI integration for advisory
    - Implement generateAdviceWithFallback function with timeout (5 seconds)
    - Build context-aware prompts including user profile data
    - Include location, primary crop, language in prompt context
    - Include current season and regional information
    - Handle OpenAI rate limits with 429 error
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.10_

  - [ ]* 7.2 Write property test for advisory context
    - **Property 15: Advisory Context Inclusion**
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [x] 7.3 Implement advisory translation and storage
    - Translate OpenAI responses to user's preferred language
    - Store advisory queries and responses in advisories table
    - Support at least 50 major crop types in prompts
    - _Requirements: 5.5, 5.6, 5.7_

  - [x] 7.4 Implement advisory history and rating
    - Create getAdvisoryHistory function with pagination
    - Order advisories by timestamp descending
    - Create rateAdvisory function updating rating in database
    - Validate rating values (1-5)
    - _Requirements: 5.8, 5.9, 6.6_

  - [ ]* 7.5 Write property tests for advisory features
    - **Property 16: Advisory History Ordering**
    - **Property 17: Advisory Rating Round-Trip**
    - **Property 18: Invalid Rating Rejection**
    - **Validates: Requirements 5.8, 5.9, 6.6**

- [x] 8. Create advisory API endpoints
  - [x] 8.1 Implement POST /api/v1/advisories/query endpoint
    - Accept JSON with query text
    - Validate authentication with JWT middleware
    - Validate query is not empty and under 500 characters
    - Call generateAdvice service function
    - Handle OpenAI errors with user-friendly messages
    - Log all advisory requests to audit_logs table
    - _Requirements: 6.1, 6.2, 6.3, 6.8, 6.9_

  - [x] 8.2 Implement GET /api/v1/advisories/history endpoint
    - Accept pagination parameters (page, limit)
    - Call getAdvisoryHistory service function
    - Return paginated advisory results
    - _Requirements: 6.4_

  - [x] 8.3 Implement PUT /api/v1/advisories/:id/rate endpoint
    - Accept rating value (1-5)
    - Validate rating range
    - Enforce authorization (user can only rate own advisories)
    - Call rateAdvisory service function
    - Return 403 Forbidden for cross-user access attempts
    - _Requirements: 6.5, 6.6, 6.7_

- [x] 9. Implement user profile service and endpoints
  - [x] 9.1 Create user service functions
    - Implement getUserProfile function
    - Implement updateUserProfile function with validation
    - Ensure mobile number is immutable (read-only)
    - Validate profile fields before database update
    - Log profile updates to audit_logs table
    - _Requirements: 15.1, 15.2, 15.3, 15.5, 15.8_

  - [ ]* 9.2 Write property tests for profile management
    - **Property 40: Profile Update Immutability of Mobile Number**
    - **Property 41: Profile Update Round-Trip**
    - **Property 43: Profile Data Validation**
    - **Validates: Requirements 15.2, 15.3, 15.5, 15.6**

  - [x] 9.3 Implement GET /api/v1/users/profile endpoint
    - Extract user ID from JWT token
    - Call getUserProfile service function
    - Return user profile data
    - _Requirements: 15.1_

  - [x] 9.4 Implement PUT /api/v1/users/profile endpoint
    - Accept updated profile data
    - Call updateUserProfile service function
    - Return updated profile data
    - _Requirements: 15.3, 15.4, 15.6_

- [x] 10. Implement government schemes service and endpoints
  - [x] 10.1 Create government schemes service functions
    - Implement getAllSchemes function with translation
    - Implement getSchemeById function with translation
    - Implement filterSchemes function by category and keyword
    - Cache schemes data for performance
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 10.2 Write property tests for scheme features
    - **Property 37: Government Scheme Display Completeness**
    - **Property 38: Scheme Filtering by Category**
    - **Property 39: Scheme Keyword Search**
    - **Validates: Requirements 14.2, 14.4, 14.5**

  - [x] 10.3 Implement GET /api/v1/schemes endpoint
    - Accept optional category and keyword filters
    - Accept language parameter from user profile
    - Call getAllSchemes or filterSchemes service function
    - Return translated scheme data
    - _Requirements: 14.10_

  - [x] 10.4 Implement GET /api/v1/schemes/:id endpoint
    - Extract scheme ID from URL parameter
    - Call getSchemeById service function
    - Return translated scheme details
    - Track scheme views in audit_logs table
    - _Requirements: 14.2, 14.7_

- [x] 11. Implement translation service
  - Create translation service wrapper for Google Translate API
  - Implement translateContent function for disease results
  - Implement multilingual prompt generation for OpenAI
  - Handle translation failures with fallback to English
  - _Requirements: 3.7, 5.5, 9.3, 9.4, 9.5, 9.6, 13.4, 14.3_

- [ ]* 11.1 Write property test for content translation
  - **Property 25: Content Translation to User Language**
  - **Validates: Requirements 3.7, 5.5, 9.3, 9.4, 9.5, 9.6, 13.4, 14.3**

- [x] 12. Implement core middleware and utilities
  - [x] 12.1 Create CORS middleware
    - Configure CORS policies restricting to mobile app origin
    - _Requirements: 11.6_

  - [x] 12.2 Create rate limiting middleware
    - Implement rate limiter for all API endpoints
    - Enforce 100 requests per minute per user
    - Return 429 Too Many Requests when limit exceeded
    - _Requirements: 11.9_

  - [ ]* 12.3 Write property test for rate limiting
    - **Property 35: API Rate Limiting Enforcement**
    - **Validates: Requirements 11.9**

  - [x] 12.4 Create SQL injection prevention utilities
    - Implement input sanitization functions
    - Use parameterized queries for all database operations
    - _Requirements: 11.5_

  - [ ]* 12.5 Write property test for SQL injection prevention
    - **Property 33: SQL Injection Prevention**
    - **Validates: Requirements 11.5**

  - [x] 12.6 Create audit logging utilities
    - Implement auditLogger with functions for all event types
    - Log authentication events, API requests, security events, errors
    - Include timestamp, user_id, action, endpoint, method, status, response time
    - _Requirements: 1.10, 4.10, 6.8, 11.7, 12.7, 13.1, 13.7, 14.7, 15.8_

  - [ ]* 12.7 Write property test for audit logging
    - **Property 34: Comprehensive Audit Logging**
    - **Validates: Requirements 1.10, 4.10, 6.8, 11.7, 12.7, 13.1, 13.7, 14.7, 15.8**

  - [x] 12.8 Implement health check endpoint
    - Create GET /api/v1/health endpoint
    - Return service status and dependencies health
    - _Requirements: 13.10_

- [x] 13. Checkpoint - Backend services complete
  - Ensure all backend tests pass, verify all API endpoints are functional, ask the user if questions arise.

- [x] 14. Set up React Native mobile application
  - [x] 14.1 Initialize React Native project with TypeScript
    - Create new React Native project
    - Configure TypeScript with strict mode
    - Set up project structure (screens, components, services, utils)
    - Install core dependencies (React Navigation, Axios, AsyncStorage)
    - _Requirements: 2.10_

  - [x] 14.2 Set up navigation structure
    - Configure React Navigation with stack and tab navigators
    - Create navigation routes for all screens
    - Implement authentication flow navigation
    - _Requirements: 2.1, 2.2_

  - [x] 14.3 Set up internationalization (i18n)
    - Install and configure i18n library
    - Create translation files for Hindi, English, Telugu
    - Implement LanguageProvider context
    - Create language selection component
    - _Requirements: 2.7, 2.8, 9.1, 9.2_

  - [ ]* 14.4 Write property test for language selection
    - **Property 7: Language Selection Persistence**
    - **Property 8: UI Text Translation Completeness**
    - **Validates: Requirements 2.8, 2.9, 9.2**

  - [x] 14.5 Set up secure storage for tokens
    - Configure Keychain (iOS) and Keystore (Android) integration
    - Create SecureStorage wrapper for token persistence
    - _Requirements: 11.10_

  - [x] 14.6 Create API client service
    - Implement Axios-based API client with interceptors
    - Add JWT token injection in request headers
    - Implement error handling and network error detection
    - Add request timeout configuration (30s for detection, 10s for others)
    - _Requirements: 12.10_

- [x] 15. Implement authentication screens
  - [x] 15.1 Create LoginScreen component
    - Implement mobile number input with validation
    - Create OTP request button
    - Display loading indicator during OTP sending
    - Handle errors with localized messages
    - _Requirements: 2.1, 13.4_

  - [x] 15.2 Create OTPVerificationScreen component
    - Implement OTP code input (6 digits)
    - Create verify button
    - Display loading indicator during verification
    - Handle errors with localized messages and retry option
    - Navigate to registration or dashboard based on isNewUser flag
    - _Requirements: 2.1, 13.5_

  - [x] 15.3 Create RegistrationScreen component
    - Implement profile form (name, location, primary crop, language)
    - Validate required fields
    - Create submit button
    - Display loading indicator during registration
    - Handle errors with localized messages
    - _Requirements: 2.1, 7.6_

  - [x] 15.4 Create AuthContext for global authentication state
    - Implement authentication state management
    - Store user profile and tokens
    - Provide login, logout, and token refresh functions
    - Persist authentication state to SecureStorage
    - _Requirements: 1.8, 1.9_

- [x] 16. Implement disease detection screens
  - [x] 16.1 Create CameraScreen component
    - Integrate React Native Camera for image capture
    - Implement camera controls (capture, switch camera)
    - Allow gallery image selection as alternative
    - Display captured/selected image preview
    - _Requirements: 2.3_

  - [x] 16.2 Create image upload and detection functionality
    - Compress image before upload using react-native-image-resizer
    - Upload image to disease detection API
    - Display loading indicator with progress
    - Handle upload errors with retry option
    - _Requirements: 3.1, 10.3_

  - [x] 16.3 Create DetectionResultScreen component
    - Display disease name, severity, confidence score
    - Display treatment recommendations
    - Show original image with presigned URL
    - Translate all content to user's preferred language
    - _Requirements: 3.6, 3.7_

  - [x] 16.4 Create DetectionHistoryScreen component
    - Fetch and display paginated detection history
    - Order detections by timestamp descending
    - Implement pull-to-refresh
    - Handle loading and error states
    - _Requirements: 3.9_

  - [x] 16.5 Create DetectionDetailScreen component
    - Display complete detection record
    - Show image metadata (size, format, dimensions)
    - Allow navigation back to history
    - _Requirements: 3.10_

- [x] 17. Implement advisory screens
  - [x] 17.1 Create AdvisoryScreen component
    - Implement question input text area
    - Validate query length (max 500 characters)
    - Create submit button
    - Display loading indicator during API request
    - Handle errors with retry option
    - _Requirements: 2.4, 6.2, 6.3_

  - [x] 17.2 Create AdvisoryChatScreen component
    - Display conversation-style Q&A interface
    - Show query and response with timestamps
    - Translate responses to user's preferred language
    - Implement rating component (1-5 stars)
    - _Requirements: 5.5, 5.9_

  - [x] 17.3 Create AdvisoryHistoryScreen component
    - Fetch and display paginated advisory history
    - Order advisories by timestamp descending
    - Show ratings for each advisory
    - Implement pull-to-refresh
    - Handle loading and error states
    - _Requirements: 5.8_

- [x] 18. Implement government schemes screens
  - [x] 18.1 Create SchemesListScreen component
    - Fetch and display all government schemes
    - Translate scheme information to user's preferred language
    - Implement category filter (subsidy, loan, insurance, training)
    - Implement keyword search
    - _Requirements: 14.1, 14.3, 14.4, 14.5_

  - [x] 18.2 Create SchemeDetailScreen component
    - Display complete scheme information
    - Show name, description, eligibility, benefits, application process
    - Translate all content to user's preferred language
    - Provide application link/button (tracking only for MVP)
    - _Requirements: 14.2, 14.8_

- [x] 19. Implement profile management screens
  - [x] 19.1 Create ProfileScreen component
    - Display current user profile data
    - Show mobile number as read-only
    - Provide edit button navigating to edit screen
    - Include language selection option
    - _Requirements: 15.1, 15.2, 15.9_

  - [x] 19.2 Create ProfileEditScreen component
    - Implement profile edit form (name, location, primary crop, language)
    - Validate all fields before submission
    - Create save button
    - Display loading indicator during update
    - Handle errors with localized messages
    - Update local cache after successful update
    - _Requirements: 15.2, 15.3, 15.4, 15.5, 15.7_

  - [ ]* 19.3 Write property tests for profile features
    - **Property 26: Language Preference Persistence**
    - **Property 27: Dynamic Language Switching**
    - **Property 42: Profile Cache Synchronization**
    - **Validates: Requirements 9.8, 9.9, 9.10, 15.7, 15.10**

- [x] 20. Implement offline functionality
  - [x] 20.1 Set up local storage for offline data
    - Configure AsyncStorage for simple data
    - Configure SQLite for structured data (detection/advisory history)
    - Create data models for cached data
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 20.2 Implement data caching on API responses
    - Cache user profile after authentication
    - Cache detection history after fetch
    - Cache advisory history after fetch
    - Cache government schemes after fetch
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 14.6_

  - [ ]* 20.3 Write property test for offline caching
    - **Property 23: Offline Data Caching Round-Trip**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 14.6**

  - [x] 20.3 Implement offline mode detection and UI
    - Create connectivity monitoring service
    - Display offline indicator banner when no connectivity
    - Allow viewing cached data when offline
    - Disable features requiring network when offline
    - _Requirements: 8.5, 8.6, 8.7, 8.8_

  - [x] 20.4 Implement request queuing for offline requests
    - Queue detection requests when offline
    - Queue advisory requests when offline
    - Store queued requests in local storage
    - Implement sync on connectivity restoration
    - _Requirements: 8.9, 8.10_

  - [ ]* 20.5 Write property test for offline request queuing
    - **Property 24: Offline Request Queuing**
    - **Validates: Requirements 8.9, 8.10**

- [x] 21. Implement shared UI components
  - Create OfflineIndicator component
  - Create LoadingSpinner component with localized text
  - Create ErrorMessage component with localized messages and retry button
  - Create custom Button, Input, and Card components
  - _Requirements: 12.9, 13.4, 13.5_

- [x] 22. Implement dashboard screen
  - Create DashboardScreen component with quick access to all features
  - Display user greeting with name
  - Show feature cards (Disease Detection, Advisory, Schemes, Profile)
  - Implement navigation to each feature
  - _Requirements: 2.2_

- [x] 23. Checkpoint - Mobile app core features complete
  - Ensure all mobile screens are functional, verify navigation flows, test on both iOS and Android, ask the user if questions arise.

- [x] 24. Integration and end-to-end testing
  - [x] 24.1 Test complete authentication flow
    - Test OTP sending, verification, and registration
    - Test token refresh and logout
    - Test rate limiting enforcement
    - _Requirements: 1.1-1.10_

  - [x] 24.2 Test complete disease detection flow
    - Test image capture, upload, and detection
    - Test detection history and detail views
    - Test offline caching and viewing
    - _Requirements: 3.1-3.10_

  - [x] 24.3 Test complete advisory flow
    - Test query submission and response display
    - Test advisory history and rating
    - Test offline caching and viewing
    - _Requirements: 5.1-5.10_

  - [x] 24.4 Test multilingual support
    - Test language selection and persistence
    - Test UI text translation for all screens
    - Test content translation for API responses
    - Test dynamic language switching
    - _Requirements: 9.1-9.10_

  - [x] 24.5 Test offline functionality
    - Test offline mode detection and indicator
    - Test cached data viewing when offline
    - Test request queuing and sync on reconnection
    - _Requirements: 8.1-8.10_

  - [x] 24.6 Test security features
    - Test JWT token validation and expiration
    - Test cross-user authorization enforcement
    - Test rate limiting on all endpoints
    - Test input sanitization and SQL injection prevention
    - _Requirements: 11.1-11.10_

- [x] 25. Performance optimization
  - Optimize API response times (detection < 30s, advisory < 5s)
  - Implement caching for government schemes
  - Optimize database queries with indexes
  - Optimize mobile app image loading and rendering
  - Test with 100 concurrent users
  - _Requirements: 12.1-12.10_

- [x] 26. Error handling and logging verification
  - Verify all errors logged to audit_logs table
  - Verify user-friendly error messages in all languages
  - Verify external service error handling with retries
  - Verify error display in mobile app with retry options
  - _Requirements: 13.1-13.10_

- [x] 27. Final checkpoint - Complete system testing
  - Ensure all tests pass, verify all requirements are met, test on real devices, ask the user if questions arise before deployment.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties from the design document
- All code is written in TypeScript for type safety
- Backend services are implemented before mobile app to enable parallel development
- Testing is integrated throughout rather than deferred to the end
- External service integrations (Twilio, OpenAI, AI models) include error handling and fallbacks
