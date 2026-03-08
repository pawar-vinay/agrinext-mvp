# Agrinext Phase 2 - Error Handling and Logging Verification

## Overview

This document provides comprehensive verification procedures for error handling and logging across the Agrinext MVP Phase 2 implementation.

---

## Error Handling Requirements

### Backend Error Handling
- All errors logged to audit_logs table
- User-friendly error messages in all languages
- External service errors handled with retries
- Proper HTTP status codes returned
- Stack traces logged (but not exposed to clients)

### Mobile App Error Handling
- Error messages displayed in user's language
- Retry options provided where applicable
- Offline errors handled gracefully
- Network errors detected and handled
- Loading states managed properly

---

## Backend Error Handling Verification

### 1. Database Errors

#### Test Case 1: Connection Failure
**Scenario**: Database connection fails

**Steps**:
1. Stop database server
2. Make API request
3. Observe error handling

**Expected Results**:
- ✅ Error caught and logged
- ✅ 503 Service Unavailable returned
- ✅ User-friendly message: "Service temporarily unavailable"
- ✅ Error logged to file system (since DB is down)
- ✅ No stack trace exposed to client

#### Test Case 2: Query Timeout
**Scenario**: Database query takes too long

**Steps**:
1. Execute slow query (e.g., full table scan)
2. Observe timeout handling

**Expected Results**:
- ✅ Query timeout after configured duration
- ✅ Error logged with query details
- ✅ 500 Internal Server Error returned
- ✅ User-friendly message displayed

#### Test Case 3: Constraint Violation
**Scenario**: Unique constraint violated

**Steps**:
1. Attempt to register with existing mobile number
2. Observe error handling

**Expected Results**:
- ✅ Constraint violation caught
- ✅ 409 Conflict returned
- ✅ User-friendly message: "Mobile number already registered"
- ✅ Error logged to audit_logs

### 2. External Service Errors

#### Test Case 1: Twilio SMS Failure
**Scenario**: Twilio API fails to send SMS

**Steps**:
1. Configure invalid Twilio credentials
2. Request OTP
3. Observe error handling

**Expected Results**:
- ✅ Error caught and logged
- ✅ Retry attempted (exponential backoff)
- ✅ After max retries, 503 returned
- ✅ User-friendly message: "Unable to send OTP. Please try again."
- ✅ Error details logged to audit_logs

#### Test Case 2: OpenAI API Timeout
**Scenario**: OpenAI API times out

**Steps**:
1. Submit advisory query
2. Simulate OpenAI timeout (> 5 seconds)
3. Observe error handling

**Expected Results**:
- ✅ Request timeout after 5 seconds
- ✅ Error caught and logged
- ✅ 504 Gateway Timeout returned
- ✅ User-friendly message: "Request timed out. Please try again."
- ✅ Error logged to audit_logs

#### Test Case 3: S3 Upload Failure
**Scenario**: S3 upload fails

**Steps**:
1. Configure invalid S3 credentials
2. Upload image for detection
3. Observe error handling

**Expected Results**:
- ✅ Error caught and logged
- ✅ Retry attempted
- ✅ After max retries, 500 returned
- ✅ User-friendly message: "Image upload failed. Please try again."
- ✅ Error logged to audit_logs

#### Test Case 4: AI Model Failure
**Scenario**: Hugging Face API fails

**Steps**:
1. Upload image for detection
2. Simulate Hugging Face failure
3. Observe fallback to Roboflow

**Expected Results**:
- ✅ Primary AI service error caught
- ✅ Fallback to Roboflow attempted
- ✅ If both fail, 503 returned
- ✅ User-friendly message: "Disease detection unavailable. Please try again later."
- ✅ All errors logged to audit_logs

### 3. Authentication Errors

#### Test Case 1: Invalid JWT Token
**Scenario**: User provides invalid JWT token

**Steps**:
1. Make authenticated request with invalid token
2. Observe error handling

**Expected Results**:
- ✅ Token validation fails
- ✅ 401 Unauthorized returned
- ✅ User-friendly message: "Invalid authentication token"
- ✅ Security event logged to audit_logs

#### Test Case 2: Expired JWT Token
**Scenario**: User's access token expired

**Steps**:
1. Wait for token expiration (or manually expire)
2. Make authenticated request
3. Observe error handling

**Expected Results**:
- ✅ Token expiration detected
- ✅ 401 Unauthorized returned
- ✅ User-friendly message: "Session expired. Please login again."
- ✅ Event logged to audit_logs

#### Test Case 3: Rate Limit Exceeded
**Scenario**: User exceeds rate limit

**Steps**:
1. Make 101 requests within 1 minute
2. Observe error handling

**Expected Results**:
- ✅ Rate limit enforced
- ✅ 429 Too Many Requests returned
- ✅ Retry-After header included
- ✅ User-friendly message: "Too many requests. Please try again in X seconds."
- ✅ Event logged to audit_logs

### 4. Validation Errors

#### Test Case 1: Missing Required Fields
**Scenario**: User submits form with missing fields

**Steps**:
1. Submit registration without name
2. Observe error handling

**Expected Results**:
- ✅ Validation error caught
- ✅ 400 Bad Request returned
- ✅ User-friendly message: "Name is required"
- ✅ Field-specific error highlighted

#### Test Case 2: Invalid Data Format
**Scenario**: User provides invalid data format

**Steps**:
1. Submit mobile number with letters
2. Observe error handling

**Expected Results**:
- ✅ Format validation fails
- ✅ 400 Bad Request returned
- ✅ User-friendly message: "Invalid mobile number format"
- ✅ Error logged

#### Test Case 3: Data Length Validation
**Scenario**: User exceeds character limit

**Steps**:
1. Submit advisory query > 500 characters
2. Observe error handling

**Expected Results**:
- ✅ Length validation fails
- ✅ 400 Bad Request returned
- ✅ User-friendly message: "Query must be less than 500 characters"
- ✅ Character count displayed

---

## Mobile App Error Handling Verification

### 1. Network Errors

#### Test Case 1: No Internet Connection
**Scenario**: Device has no internet connection

**Steps**:
1. Turn off WiFi and mobile data
2. Attempt to perform online action
3. Observe error handling

**Expected Results**:
- ✅ Network error detected
- ✅ Offline indicator displayed
- ✅ User-friendly message: "No internet connection"
- ✅ Cached data displayed where available
- ✅ Request queued for sync

#### Test Case 2: Request Timeout
**Scenario**: Network request times out

**Steps**:
1. Simulate slow network
2. Make API request
3. Observe timeout handling

**Expected Results**:
- ✅ Request timeout after configured duration
- ✅ Error message displayed
- ✅ Retry button provided
- ✅ User can retry or cancel

#### Test Case 3: Server Error (5xx)
**Scenario**: Server returns 500 error

**Steps**:
1. Trigger server error
2. Observe error handling

**Expected Results**:
- ✅ Error caught and displayed
- ✅ User-friendly message: "Server error. Please try again later."
- ✅ Retry option provided
- ✅ Error logged locally

### 2. API Errors

#### Test Case 1: Authentication Error (401)
**Scenario**: User's session expired

**Steps**:
1. Expire user's token
2. Make authenticated request
3. Observe error handling

**Expected Results**:
- ✅ 401 error detected
- ✅ User logged out automatically
- ✅ Redirected to login screen
- ✅ Message: "Session expired. Please login again."

#### Test Case 2: Authorization Error (403)
**Scenario**: User attempts unauthorized action

**Steps**:
1. Attempt to access another user's data
2. Observe error handling

**Expected Results**:
- ✅ 403 error detected
- ✅ Error message displayed
- ✅ User remains on current screen
- ✅ Message: "You don't have permission to access this resource"

#### Test Case 3: Not Found Error (404)
**Scenario**: Requested resource not found

**Steps**:
1. Request non-existent detection ID
2. Observe error handling

**Expected Results**:
- ✅ 404 error detected
- ✅ Error message displayed
- ✅ User can navigate back
- ✅ Message: "Resource not found"

### 3. Form Validation Errors

#### Test Case 1: Empty Required Fields
**Scenario**: User submits form with empty fields

**Steps**:
1. Leave required field empty
2. Attempt to submit
3. Observe validation

**Expected Results**:
- ✅ Validation error displayed
- ✅ Field highlighted in red
- ✅ Error message below field
- ✅ Form not submitted

#### Test Case 2: Invalid Format
**Scenario**: User enters invalid format

**Steps**:
1. Enter invalid mobile number
2. Attempt to submit
3. Observe validation

**Expected Results**:
- ✅ Format validation fails
- ✅ Field highlighted in red
- ✅ Error message: "Invalid mobile number format"
- ✅ Form not submitted

### 4. Image Upload Errors

#### Test Case 1: Image Too Large
**Scenario**: User selects image > 10MB

**Steps**:
1. Select large image
2. Attempt to upload
3. Observe error handling

**Expected Results**:
- ✅ Size validation fails
- ✅ Error message displayed
- ✅ Message: "Image size must be less than 10MB"
- ✅ User can select different image

#### Test Case 2: Invalid Image Format
**Scenario**: User selects non-image file

**Steps**:
1. Select PDF or other non-image file
2. Attempt to upload
3. Observe error handling

**Expected Results**:
- ✅ Format validation fails
- ✅ Error message displayed
- ✅ Message: "Please select a valid image file (JPEG, PNG, HEIC)"
- ✅ User can select different file

#### Test Case 3: Upload Failure
**Scenario**: Image upload fails

**Steps**:
1. Select valid image
2. Simulate upload failure
3. Observe error handling

**Expected Results**:
- ✅ Upload error caught
- ✅ Error message displayed
- ✅ Retry button provided
- ✅ User can retry or cancel

---

## Logging Verification

### 1. Audit Logs

#### Authentication Events
```sql
-- Verify authentication events are logged
SELECT * FROM audit_logs 
WHERE action IN ('login', 'logout', 'otp_sent', 'otp_verified', 'registration')
ORDER BY timestamp DESC 
LIMIT 10;
```

**Expected Fields**:
- ✅ timestamp
- ✅ user_id (if applicable)
- ✅ action
- ✅ details (JSON with relevant info)
- ✅ ip_address
- ✅ user_agent

#### API Request Logs
```sql
-- Verify API requests are logged
SELECT * FROM audit_logs 
WHERE action = 'api_request'
ORDER BY timestamp DESC 
LIMIT 10;
```

**Expected Fields**:
- ✅ timestamp
- ✅ user_id
- ✅ endpoint
- ✅ method (GET, POST, etc.)
- ✅ status_code
- ✅ response_time (ms)

#### Security Events
```sql
-- Verify security events are logged
SELECT * FROM audit_logs 
WHERE action IN ('invalid_token', 'rate_limit_exceeded', 'unauthorized_access')
ORDER BY timestamp DESC 
LIMIT 10;
```

**Expected Fields**:
- ✅ timestamp
- ✅ user_id (if applicable)
- ✅ action
- ✅ details (what was attempted)
- ✅ ip_address

#### Error Logs
```sql
-- Verify errors are logged
SELECT * FROM audit_logs 
WHERE action = 'error'
ORDER BY timestamp DESC 
LIMIT 10;
```

**Expected Fields**:
- ✅ timestamp
- ✅ user_id (if applicable)
- ✅ error_type
- ✅ error_message
- ✅ stack_trace (truncated)
- ✅ endpoint
- ✅ request_data (sanitized)

### 2. Application Logs

#### Log Levels
Verify appropriate log levels are used:

```typescript
// ERROR: System errors, exceptions
logger.error('Database connection failed', { error });

// WARN: Warnings, slow requests
logger.warn('Slow request detected', { duration, endpoint });

// INFO: Important events
logger.info('User registered', { userId });

// DEBUG: Detailed debugging info (development only)
logger.debug('Processing request', { requestData });
```

#### Log Format
Verify logs follow consistent format:

```json
{
  "timestamp": "2026-03-02T10:30:00.000Z",
  "level": "error",
  "message": "Database connection failed",
  "context": {
    "error": "Connection timeout",
    "host": "db.example.com",
    "port": 5432
  },
  "service": "agrinext-backend",
  "environment": "production"
}
```

### 3. Log Rotation

#### Verify Log Rotation
```bash
# Check log files
ls -lh logs/

# Expected files:
# - application.log (current)
# - application-2026-03-01.log (archived)
# - application-2026-02-29.log (archived)
# - error.log (current)
# - error-2026-03-01.log (archived)
```

**Configuration**:
- ✅ Daily rotation
- ✅ Max file size: 100MB
- ✅ Keep last 30 days
- ✅ Compress old logs

---

## Error Message Translation Verification

### English Error Messages
```json
{
  "errors": {
    "invalidMobile": "Invalid mobile number",
    "invalidOTP": "Invalid OTP",
    "networkError": "Network error. Please try again.",
    "serverError": "Server error. Please try again later.",
    "unknownError": "An unknown error occurred",
    "nameRequired": "Name is required",
    "locationRequired": "Location is required",
    "primaryCropRequired": "Primary crop is required",
    "updateProfileFailed": "Failed to update profile"
  }
}
```

### Hindi Error Messages
```json
{
  "errors": {
    "invalidMobile": "अमान्य मोबाइल नंबर",
    "invalidOTP": "अमान्य OTP",
    "networkError": "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।",
    "serverError": "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।",
    "unknownError": "एक अज्ञात त्रुटि हुई",
    "nameRequired": "नाम आवश्यक है",
    "locationRequired": "स्थान आवश्यक है",
    "primaryCropRequired": "प्राथमिक फसल आवश्यक है",
    "updateProfileFailed": "प्रोफ़ाइल अपडेट करने में विफल"
  }
}
```

### Telugu Error Messages
```json
{
  "errors": {
    "invalidMobile": "చెల్లని మొబైల్ నంబర్",
    "invalidOTP": "చెల్లని OTP",
    "networkError": "నెట్‌వర్క్ లోపం। దయచేసి మళ్లీ ప్రయత్నించండి।",
    "serverError": "సర్వర్ లోపం। దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి।",
    "unknownError": "తెలియని లోపం సంభవించింది",
    "nameRequired": "పేరు అవసరం",
    "locationRequired": "స్థానం అవసరం",
    "primaryCropRequired": "ప్రాథమిక పంట అవసరం",
    "updateProfileFailed": "ప్రొఫైల్ నవీకరించడం విఫలమైంది"
  }
}
```

---

## Error Handling Checklist

### Backend
- [x] All errors caught and logged
- [x] User-friendly error messages
- [x] Proper HTTP status codes
- [x] Stack traces not exposed
- [x] External service retries implemented
- [x] Database errors handled
- [x] Validation errors handled
- [x] Authentication errors handled
- [x] Authorization errors handled
- [x] Rate limiting errors handled

### Mobile App
- [x] Network errors handled
- [x] API errors handled
- [x] Form validation errors displayed
- [x] Image upload errors handled
- [x] Offline errors handled gracefully
- [x] Error messages translated
- [x] Retry options provided
- [x] Loading states managed

### Logging
- [x] Audit logs implemented
- [x] Authentication events logged
- [x] API requests logged
- [x] Security events logged
- [x] Errors logged with context
- [x] Log rotation configured
- [x] Log levels appropriate
- [x] Sensitive data not logged

---

## Verification Test Results

| Category | Test Cases | Passed | Failed | Notes |
|----------|-----------|--------|--------|-------|
| Database Errors | 3 | - | - | - |
| External Service Errors | 4 | - | - | - |
| Authentication Errors | 3 | - | - | - |
| Validation Errors | 3 | - | - | - |
| Network Errors | 3 | - | - | - |
| API Errors | 3 | - | - | - |
| Form Validation | 2 | - | - | - |
| Image Upload Errors | 3 | - | - | - |
| Audit Logging | 4 | - | - | - |
| Error Translation | 3 | - | - | - |
| **TOTAL** | **31** | **-** | **-** | **-** |

---

## Sign-Off

**Verified By**: _______________  
**Date**: _______________  
**Status**: Pass / Fail / Conditional Pass  
**Notes**: _______________
