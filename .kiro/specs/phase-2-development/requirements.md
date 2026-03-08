# Requirements Document: Phase 2 Development - Agrinext MVP

## Introduction

This document specifies the requirements for Phase 2 of the Agrinext MVP, which builds upon the completed Phase 1 infrastructure. Phase 2 delivers the core user-facing functionality through a React Native mobile application integrated with backend APIs for authentication, AI-powered disease detection, and farming advisory services. The system enables farmers to access agricultural expertise through their mobile devices in their preferred language (Hindi, English, or Telugu).

## Glossary

- **Mobile_App**: The React Native mobile application for Android and iOS platforms
- **Auth_Service**: The authentication service handling OTP-based login and JWT token management
- **Disease_Detection_Service**: The service that processes crop images and identifies diseases using AI models
- **Advisory_Service**: The service that provides farming advice using OpenAI API
- **Image_Storage**: AWS S3 bucket (agrinext-images-1772367775698) for storing crop images
- **Database**: PostgreSQL database with existing schema from Phase 1
- **JWT_Token**: JSON Web Token used for authenticating API requests
- **OTP**: One-Time Password sent via SMS for user authentication
- **Twilio_Service**: Third-party SMS service for sending OTP codes
- **AI_Model**: Machine learning model for disease detection (Hugging Face or Roboflow)
- **OpenAI_API**: Third-party API for generating farming advisory responses
- **Translation_Service**: Service for translating content between Hindi, English, and Telugu
- **Local_Storage**: Device-based storage for offline functionality
- **Backend_Server**: Node.js Express server running at http://3.239.184.220:3000
- **Rate_Limiter**: Component that restricts API request frequency per user

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a farmer, I want to register and login using my mobile number with OTP verification, so that I can securely access the application without remembering passwords.

#### Acceptance Criteria

1. WHEN a user enters a valid 10-digit mobile number, THE Auth_Service SHALL send an OTP via Twilio_Service within 30 seconds
2. WHEN a user requests an OTP, THE Rate_Limiter SHALL allow a maximum of 3 OTP requests per hour per mobile number
3. WHEN a user exceeds the OTP request limit, THE Auth_Service SHALL return an error message with the time until next allowed request
4. WHEN a user enters a valid OTP within 10 minutes of generation, THE Auth_Service SHALL verify the OTP and issue a JWT_Token pair
5. THE Auth_Service SHALL issue an access token with 1-hour expiration and a refresh token with 30-day expiration
6. WHEN a new user verifies OTP successfully, THE Auth_Service SHALL prompt for profile information (name, location, primary crop)
7. WHEN profile information is submitted, THE Auth_Service SHALL create a user record in the Database users table
8. WHEN an access token expires, THE Auth_Service SHALL accept a valid refresh token and issue a new access token
9. WHEN a user logs out, THE Auth_Service SHALL invalidate the user's tokens in the user_sessions table
10. THE Auth_Service SHALL log all authentication events in the audit_logs table

### Requirement 2: Mobile Application User Interface

**User Story:** As a farmer, I want an intuitive mobile interface in my preferred language, so that I can easily navigate and use all features.

#### Acceptance Criteria

1. THE Mobile_App SHALL provide authentication screens for login, OTP verification, and registration
2. THE Mobile_App SHALL provide a dashboard screen displaying quick access to all major features
3. THE Mobile_App SHALL provide a camera interface for capturing crop images
4. THE Mobile_App SHALL provide a chat interface for submitting farming questions
5. THE Mobile_App SHALL provide a browser interface for viewing government schemes
6. THE Mobile_App SHALL provide a profile management screen for updating user information
7. THE Mobile_App SHALL support language selection between Hindi, English, and Telugu
8. WHEN a user selects a language, THE Mobile_App SHALL display all UI text in the selected language
9. THE Mobile_App SHALL persist the selected language in Local_Storage
10. THE Mobile_App SHALL use TypeScript for type safety and code quality

### Requirement 3: Disease Detection Functionality

**User Story:** As a farmer, I want to photograph my crops and receive instant disease diagnosis with treatment recommendations, so that I can take timely action to protect my harvest.

#### Acceptance Criteria

1. WHEN a user captures or selects a crop image, THE Mobile_App SHALL upload the image to the Disease_Detection_Service
2. THE Disease_Detection_Service SHALL store the uploaded image in Image_Storage with a unique identifier
3. THE Disease_Detection_Service SHALL process the image using the AI_Model within 30 seconds
4. THE AI_Model SHALL identify crop diseases with a minimum accuracy of 85%
5. THE Disease_Detection_Service SHALL support detection of at least 50 distinct crop diseases
6. WHEN disease detection completes, THE Disease_Detection_Service SHALL return disease name, severity level, and treatment recommendations
7. THE Disease_Detection_Service SHALL translate detection results into the user's preferred language
8. THE Disease_Detection_Service SHALL store detection results in the disease_detections table with user_id, image_url, disease_name, confidence_score, and recommendations
9. WHEN a user requests detection history, THE Disease_Detection_Service SHALL return all past detections for that user ordered by timestamp
10. WHEN a user requests specific detection details, THE Disease_Detection_Service SHALL return the complete detection record including the original image URL

### Requirement 4: Disease Detection API Endpoints

**User Story:** As a mobile application, I want RESTful API endpoints for disease detection, so that I can integrate AI-powered diagnosis into the user experience.

#### Acceptance Criteria

1. THE Disease_Detection_Service SHALL expose POST /api/v1/diseases/detect endpoint accepting multipart/form-data with image file and JWT_Token
2. WHEN an unauthenticated request is received, THE Disease_Detection_Service SHALL return HTTP 401 Unauthorized
3. WHEN an image larger than 10MB is uploaded, THE Disease_Detection_Service SHALL return HTTP 400 Bad Request
4. WHEN image upload to Image_Storage fails, THE Disease_Detection_Service SHALL return HTTP 500 Internal Server Error with error details
5. THE Disease_Detection_Service SHALL expose GET /api/v1/diseases/history endpoint returning paginated detection history
6. THE Disease_Detection_Service SHALL expose GET /api/v1/diseases/:id endpoint returning specific detection details
7. WHEN a user requests another user's detection record, THE Disease_Detection_Service SHALL return HTTP 403 Forbidden
8. THE Disease_Detection_Service SHALL integrate with Hugging Face API or Roboflow for AI model inference
9. WHEN AI model inference fails, THE Disease_Detection_Service SHALL return HTTP 503 Service Unavailable with retry guidance
10. THE Disease_Detection_Service SHALL log all detection requests and results in the audit_logs table

### Requirement 5: Farming Advisory with OpenAI Integration

**User Story:** As a farmer, I want to ask farming questions and receive expert advice in my language, so that I can make informed decisions about my crops.

#### Acceptance Criteria

1. WHEN a user submits a farming question, THE Advisory_Service SHALL send the query to OpenAI_API with context-aware prompts
2. THE Advisory_Service SHALL include user profile data (location, primary crop, language) in the OpenAI_API prompt context
3. THE Advisory_Service SHALL include current season and regional information in the OpenAI_API prompt context
4. THE Advisory_Service SHALL return advisory responses within 5 seconds
5. THE Advisory_Service SHALL translate OpenAI_API responses into the user's preferred language
6. THE Advisory_Service SHALL store advisory queries and responses in the advisories table with user_id, query_text, response_text, and language
7. THE Advisory_Service SHALL support advisory queries for at least 50 major crop types
8. WHEN a user requests advisory history, THE Advisory_Service SHALL return all past advisories for that user ordered by timestamp
9. WHEN a user rates an advisory, THE Advisory_Service SHALL update the rating in the advisories table
10. WHEN OpenAI_API rate limits are exceeded, THE Advisory_Service SHALL return HTTP 429 Too Many Requests with retry guidance

### Requirement 6: Advisory API Endpoints

**User Story:** As a mobile application, I want RESTful API endpoints for farming advisory, so that I can provide AI-powered guidance to users.

#### Acceptance Criteria

1. THE Advisory_Service SHALL expose POST /api/v1/advisories/query endpoint accepting JSON with query text and JWT_Token
2. WHEN an empty query is submitted, THE Advisory_Service SHALL return HTTP 400 Bad Request
3. WHEN a query exceeds 500 characters, THE Advisory_Service SHALL return HTTP 400 Bad Request
4. THE Advisory_Service SHALL expose GET /api/v1/advisories/history endpoint returning paginated advisory history
5. THE Advisory_Service SHALL expose PUT /api/v1/advisories/:id/rate endpoint accepting rating values 1-5
6. WHEN an invalid rating value is submitted, THE Advisory_Service SHALL return HTTP 400 Bad Request
7. WHEN a user rates another user's advisory, THE Advisory_Service SHALL return HTTP 403 Forbidden
8. THE Advisory_Service SHALL log all advisory requests and responses in the audit_logs table
9. WHEN OpenAI_API returns an error, THE Advisory_Service SHALL log the error and return a user-friendly message
10. THE Advisory_Service SHALL implement request queuing when concurrent requests exceed OpenAI_API rate limits

### Requirement 7: Authentication API Endpoints

**User Story:** As a mobile application, I want secure authentication API endpoints, so that I can manage user sessions and protect user data.

#### Acceptance Criteria

1. THE Auth_Service SHALL expose POST /api/v1/auth/send-otp endpoint accepting JSON with mobile number
2. WHEN a mobile number is not 10 digits, THE Auth_Service SHALL return HTTP 400 Bad Request
3. THE Auth_Service SHALL expose POST /api/v1/auth/verify-otp endpoint accepting JSON with mobile number and OTP code
4. WHEN an invalid or expired OTP is submitted, THE Auth_Service SHALL return HTTP 401 Unauthorized
5. THE Auth_Service SHALL expose POST /api/v1/auth/register endpoint accepting JSON with user profile data
6. WHEN required profile fields are missing, THE Auth_Service SHALL return HTTP 400 Bad Request with field details
7. THE Auth_Service SHALL expose POST /api/v1/auth/refresh-token endpoint accepting refresh token
8. WHEN an invalid or expired refresh token is submitted, THE Auth_Service SHALL return HTTP 401 Unauthorized
9. THE Auth_Service SHALL expose POST /api/v1/auth/logout endpoint accepting JWT_Token
10. THE Auth_Service SHALL store active sessions in the user_sessions table with token hash and expiration timestamp

### Requirement 8: Offline Functionality

**User Story:** As a farmer in areas with poor connectivity, I want to access basic features offline, so that I can use the app even without internet access.

#### Acceptance Criteria

1. THE Mobile_App SHALL store user profile data in Local_Storage after successful authentication
2. THE Mobile_App SHALL store detection history in Local_Storage for offline viewing
3. THE Mobile_App SHALL store advisory history in Local_Storage for offline viewing
4. THE Mobile_App SHALL store government schemes data in Local_Storage for offline browsing
5. WHEN the Mobile_App detects no internet connectivity, THE Mobile_App SHALL display an offline indicator
6. WHEN offline, THE Mobile_App SHALL allow users to view cached detection history
7. WHEN offline, THE Mobile_App SHALL allow users to view cached advisory history
8. WHEN offline, THE Mobile_App SHALL allow users to view cached government schemes
9. WHEN offline, THE Mobile_App SHALL queue new detection requests for upload when connectivity returns
10. WHEN connectivity is restored, THE Mobile_App SHALL synchronize queued requests with the Backend_Server

### Requirement 9: Multilingual Support

**User Story:** As a farmer who speaks Hindi, English, or Telugu, I want all content in my preferred language, so that I can fully understand and use the application.

#### Acceptance Criteria

1. THE Mobile_App SHALL provide language selection during initial setup and in profile settings
2. THE Mobile_App SHALL display all static UI text in the selected language
3. THE Disease_Detection_Service SHALL return disease names and treatment recommendations in the user's preferred language
4. THE Advisory_Service SHALL return farming advice in the user's preferred language
5. THE Translation_Service SHALL translate disease detection results from English to Hindi or Telugu when required
6. THE Translation_Service SHALL translate advisory responses from English to Hindi or Telugu when required
7. WHEN translation fails, THE Mobile_App SHALL display content in English with a translation error notice
8. THE Database SHALL store user language preference in the users table
9. THE Backend_Server SHALL use the stored language preference for all API responses
10. THE Mobile_App SHALL support dynamic language switching without requiring app restart

### Requirement 10: Image Upload and Storage

**User Story:** As the system, I want to efficiently store and retrieve crop images, so that users can access their detection history with original images.

#### Acceptance Criteria

1. THE Disease_Detection_Service SHALL upload images to Image_Storage with unique filenames using UUID
2. THE Disease_Detection_Service SHALL organize images in Image_Storage using folder structure: {year}/{month}/{user_id}/{filename}
3. THE Disease_Detection_Service SHALL compress images to maximum 2MB before uploading to Image_Storage
4. THE Disease_Detection_Service SHALL generate presigned URLs for image access with 1-hour expiration
5. WHEN retrieving detection history, THE Disease_Detection_Service SHALL include presigned URLs for each image
6. THE Image_Storage SHALL have public read access disabled for security
7. THE Disease_Detection_Service SHALL validate image format (JPEG, PNG, HEIC) before upload
8. WHEN an unsupported image format is uploaded, THE Disease_Detection_Service SHALL return HTTP 400 Bad Request
9. THE Disease_Detection_Service SHALL store image metadata (size, format, dimensions) in the disease_detections table
10. THE Image_Storage SHALL have lifecycle policies to archive images older than 1 year to S3 Glacier

### Requirement 11: Security and Data Protection

**User Story:** As a user, I want my personal data and images protected, so that my privacy is maintained and my information is secure.

#### Acceptance Criteria

1. THE Backend_Server SHALL validate JWT_Token signature and expiration for all protected endpoints
2. THE Backend_Server SHALL use HTTPS for all API communications
3. THE Auth_Service SHALL hash refresh tokens before storing in the user_sessions table
4. THE Auth_Service SHALL implement bcrypt or similar for any password storage (if passwords are added later)
5. THE Backend_Server SHALL sanitize all user inputs to prevent SQL injection attacks
6. THE Backend_Server SHALL implement CORS policies restricting access to the Mobile_App origin
7. THE Backend_Server SHALL log all security events (failed auth, invalid tokens) in the audit_logs table
8. THE Database SHALL encrypt sensitive fields (mobile numbers) at rest
9. THE Backend_Server SHALL implement rate limiting on all API endpoints to prevent abuse
10. THE Mobile_App SHALL store JWT_Token in secure storage (Keychain for iOS, Keystore for Android)

### Requirement 12: Performance and Scalability

**User Story:** As a user, I want fast response times and reliable service, so that I can efficiently use the application during critical farming decisions.

#### Acceptance Criteria

1. THE Auth_Service SHALL send OTP within 30 seconds of request
2. THE Disease_Detection_Service SHALL return detection results within 30 seconds of image upload
3. THE Advisory_Service SHALL return advisory responses within 5 seconds of query submission
4. THE Backend_Server SHALL handle at least 100 concurrent users without performance degradation
5. THE Database SHALL use connection pooling with minimum 10 and maximum 50 connections
6. THE Backend_Server SHALL implement caching for frequently accessed data (government schemes)
7. THE Backend_Server SHALL log response times for all API endpoints in the audit_logs table
8. WHEN response time exceeds threshold, THE Backend_Server SHALL log a performance warning
9. THE Mobile_App SHALL display loading indicators during API requests
10. THE Mobile_App SHALL implement request timeouts (30s for detection, 10s for other endpoints)

### Requirement 13: Error Handling and Logging

**User Story:** As a system administrator, I want comprehensive error logging and user-friendly error messages, so that I can troubleshoot issues and users understand what went wrong.

#### Acceptance Criteria

1. THE Backend_Server SHALL log all errors with timestamp, user_id, endpoint, and error details in the audit_logs table
2. THE Backend_Server SHALL return user-friendly error messages without exposing internal system details
3. WHEN a third-party service (Twilio, OpenAI, AI_Model) fails, THE Backend_Server SHALL log the external error and return a generic message
4. THE Mobile_App SHALL display error messages in the user's preferred language
5. THE Mobile_App SHALL provide retry options for failed requests
6. THE Backend_Server SHALL implement structured logging with log levels (ERROR, WARN, INFO, DEBUG)
7. THE Backend_Server SHALL log all API requests with method, path, user_id, and response status
8. WHEN database queries fail, THE Backend_Server SHALL log the query and error details
9. THE Mobile_App SHALL report critical errors to a crash reporting service (optional for MVP)
10. THE Backend_Server SHALL implement health check endpoint GET /api/v1/health returning service status

### Requirement 14: Government Schemes Integration

**User Story:** As a farmer, I want to browse available government schemes in my language, so that I can apply for relevant agricultural support programs.

#### Acceptance Criteria

1. THE Mobile_App SHALL display government schemes from the Database government_schemes table
2. THE Mobile_App SHALL show scheme details including name, description, eligibility, benefits, and application process
3. THE Mobile_App SHALL translate scheme information into the user's preferred language
4. THE Mobile_App SHALL allow users to filter schemes by category (subsidy, loan, insurance, training)
5. THE Mobile_App SHALL allow users to search schemes by keyword
6. THE Mobile_App SHALL cache government schemes in Local_Storage for offline access
7. WHEN a user views a scheme, THE Mobile_App SHALL track the view in the audit_logs table
8. THE Mobile_App SHALL provide a link or button to initiate scheme application (tracking only in MVP)
9. THE Database SHALL maintain the 5 seeded government schemes from Phase 1
10. THE Backend_Server SHALL expose GET /api/v1/schemes endpoint returning all active schemes

### Requirement 15: User Profile Management

**User Story:** As a farmer, I want to update my profile information, so that I receive personalized advice relevant to my crops and location.

#### Acceptance Criteria

1. THE Mobile_App SHALL display current user profile data (name, mobile, location, primary crop, language)
2. THE Mobile_App SHALL allow users to edit profile fields except mobile number
3. WHEN a user updates profile data, THE Mobile_App SHALL send the changes to the Backend_Server
4. THE Backend_Server SHALL expose PUT /api/v1/users/profile endpoint accepting updated profile data
5. THE Backend_Server SHALL validate profile data before updating the Database users table
6. WHEN profile update succeeds, THE Backend_Server SHALL return the updated profile data
7. THE Mobile_App SHALL update Local_Storage with new profile data after successful update
8. THE Backend_Server SHALL log profile updates in the audit_logs table
9. THE Mobile_App SHALL allow users to change their preferred language from profile settings
10. WHEN language is changed, THE Mobile_App SHALL immediately update all UI text to the new language

## Success Criteria Summary

Phase 2 will be considered complete when:

1. Users can register and authenticate using mobile number and OTP
2. Users can capture crop images and receive disease detection results with 85%+ accuracy
3. Users can ask farming questions and receive AI-generated advice within 5 seconds
4. All features function in Hindi, English, and Telugu
5. Mobile app works offline for viewing cached data
6. All API endpoints meet specified response time requirements
7. Data is properly stored in the PostgreSQL database
8. Security measures (JWT, rate limiting, input validation) are implemented
9. Error handling and logging are comprehensive
10. Government schemes are browsable in the mobile app

## Technical Constraints

- Backend must use existing Node.js 18 Express server at http://3.239.184.220:3000
- Database must use existing PostgreSQL schema with 8 tables from Phase 1
- Image storage must use existing S3 bucket: agrinext-images-1772367775698
- Mobile app must be built with React Native and TypeScript
- Authentication must use JWT tokens (1-hour access, 30-day refresh)
- OTP delivery must use Twilio service
- Disease detection must use Hugging Face API or Roboflow
- Advisory must use OpenAI API
- Translation must use Google Translate API or multilingual prompts
- Timeline: 4 weeks (Week 3-6 of overall project)
