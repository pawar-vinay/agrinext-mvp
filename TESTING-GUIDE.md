# Agrinext Phase 2 - Testing Guide

## Overview

This document provides comprehensive testing procedures for the Agrinext MVP Phase 2 implementation. All tests should be performed on both iOS and Android devices.

---

## Test Environment Setup

### Prerequisites
- Backend server running and accessible
- Database populated with test data
- Test user accounts created
- External services configured (Twilio, OpenAI, AWS S3, etc.)
- Mobile app installed on test devices (iOS and Android)

### Test Accounts
- Test Mobile: +91 9999999999 (or configured test number)
- OTP: Use actual OTP from Twilio or test OTP if configured

---

## Task 24.1: Authentication Flow Testing

### Test Case 1: OTP Sending
**Objective**: Verify OTP can be sent successfully

**Steps**:
1. Open the app
2. Enter a valid 10-digit mobile number
3. Tap "Send OTP"

**Expected Results**:
- ✅ Loading indicator appears
- ✅ OTP sent successfully message displayed
- ✅ Navigation to OTP verification screen
- ✅ SMS received with 6-digit OTP
- ✅ OTP expires after 10 minutes

**Rate Limiting Test**:
1. Request OTP 3 times within an hour
2. Attempt 4th request

**Expected Results**:
- ✅ First 3 requests succeed
- ✅ 4th request shows rate limit error
- ✅ Error message shows retry time

### Test Case 2: OTP Verification
**Objective**: Verify OTP verification works correctly

**Steps**:
1. Enter received 6-digit OTP
2. Tap "Verify"

**Expected Results**:
- ✅ Loading indicator appears
- ✅ OTP verified successfully
- ✅ For new users: Navigate to registration screen
- ✅ For existing users: Navigate to dashboard
- ✅ JWT tokens stored securely

**Invalid OTP Test**:
1. Enter incorrect OTP
2. Tap "Verify"

**Expected Results**:
- ✅ Error message displayed
- ✅ User remains on verification screen
- ✅ Can retry with correct OTP

### Test Case 3: User Registration
**Objective**: Verify new user registration

**Steps**:
1. Complete OTP verification as new user
2. Fill in registration form:
   - Name: "Test User"
   - Location: "Test Location"
   - Primary Crop: "Rice"
   - Language: "English"
3. Tap "Submit"

**Expected Results**:
- ✅ All fields validated (required fields)
- ✅ Loading indicator appears
- ✅ User registered successfully
- ✅ Profile data stored in database
- ✅ Navigate to dashboard
- ✅ User profile cached locally

### Test Case 4: Token Refresh
**Objective**: Verify token refresh mechanism

**Steps**:
1. Login successfully
2. Wait for access token to expire (1 hour) or manually expire
3. Make an API request

**Expected Results**:
- ✅ Access token refreshed automatically
- ✅ API request succeeds with new token
- ✅ User not logged out

### Test Case 5: Logout
**Objective**: Verify logout functionality

**Steps**:
1. Login successfully
2. Navigate to Profile
3. Tap "Logout"

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ User logged out successfully
- ✅ Tokens invalidated in database
- ✅ Local tokens cleared
- ✅ Navigate to login screen

---

## Task 24.2: Disease Detection Flow Testing

### Test Case 1: Image Capture and Upload
**Objective**: Verify image capture and disease detection

**Steps**:
1. Login to app
2. Navigate to Detection screen
3. Tap "Take Photo"
4. Capture image of crop/leaf
5. Confirm image

**Expected Results**:
- ✅ Camera opens successfully
- ✅ Image captured and previewed
- ✅ Image compressed to max 2MB
- ✅ Upload progress indicator shown
- ✅ Detection completes within 30 seconds
- ✅ Results displayed correctly

### Test Case 2: Gallery Image Selection
**Objective**: Verify gallery image selection

**Steps**:
1. Navigate to Detection screen
2. Tap "Select from Gallery"
3. Choose an image
4. Confirm selection

**Expected Results**:
- ✅ Gallery opens successfully
- ✅ Image selected and previewed
- ✅ Image compressed if needed
- ✅ Detection proceeds normally

### Test Case 3: Detection Results
**Objective**: Verify detection results display

**Expected Results**:
- ✅ Disease name displayed
- ✅ Severity level shown (Low/Medium/High)
- ✅ Confidence score displayed (0-100%)
- ✅ Treatment recommendations shown
- ✅ Original image displayed with presigned URL
- ✅ Content translated to user's language

### Test Case 4: Detection History
**Objective**: Verify detection history functionality

**Steps**:
1. Navigate to Detection History tab
2. Scroll through history
3. Pull to refresh
4. Tap on a detection item

**Expected Results**:
- ✅ History loaded with pagination
- ✅ Detections ordered by timestamp (newest first)
- ✅ Pull-to-refresh works
- ✅ Tapping item navigates to detail screen
- ✅ Detail screen shows complete information

### Test Case 5: Offline Detection Caching
**Objective**: Verify offline detection viewing

**Steps**:
1. Perform several detections while online
2. Turn off internet connection
3. Navigate to Detection History

**Expected Results**:
- ✅ Cached detections displayed
- ✅ Images load from cache
- ✅ Offline indicator shown
- ✅ Cannot perform new detections offline
- ✅ Appropriate error message shown

---

## Task 24.3: Advisory Flow Testing

### Test Case 1: Submit Advisory Query
**Objective**: Verify advisory query submission

**Steps**:
1. Navigate to Advisory screen
2. Enter question: "How to control pests in rice crop?"
3. Tap "Submit"

**Expected Results**:
- ✅ Query validated (max 500 characters)
- ✅ Loading indicator shown
- ✅ Response received within 5 seconds
- ✅ Response displayed in conversation format
- ✅ Response translated to user's language

### Test Case 2: Rate Advisory
**Objective**: Verify advisory rating

**Steps**:
1. View advisory response
2. Tap on star rating (1-5 stars)

**Expected Results**:
- ✅ Rating submitted successfully
- ✅ Rating saved to database
- ✅ Rating displayed in history

### Test Case 3: Advisory History
**Objective**: Verify advisory history

**Steps**:
1. Navigate to Advisory History tab
2. Scroll through history
3. Pull to refresh

**Expected Results**:
- ✅ History loaded with pagination
- ✅ Advisories ordered by timestamp (newest first)
- ✅ Ratings displayed for each advisory
- ✅ Pull-to-refresh works

### Test Case 4: Offline Advisory Caching
**Objective**: Verify offline advisory viewing

**Steps**:
1. Submit several queries while online
2. Turn off internet connection
3. Navigate to Advisory History

**Expected Results**:
- ✅ Cached advisories displayed
- ✅ Offline indicator shown
- ✅ Cannot submit new queries offline
- ✅ Query queued for sync message shown

---

## Task 24.4: Multilingual Support Testing

### Test Case 1: Language Selection
**Objective**: Verify language selection and persistence

**Steps**:
1. Navigate to Profile
2. Change language to Hindi
3. Observe UI changes
4. Close and reopen app

**Expected Results**:
- ✅ UI text changes to Hindi immediately
- ✅ All screens translated correctly
- ✅ Language preference persisted
- ✅ App opens in Hindi on restart

### Test Case 2: Content Translation
**Objective**: Verify API content translation

**Steps**:
1. Set language to Telugu
2. Perform disease detection
3. Submit advisory query
4. View government schemes

**Expected Results**:
- ✅ Detection results translated to Telugu
- ✅ Advisory responses translated to Telugu
- ✅ Scheme information translated to Telugu
- ✅ Error messages translated to Telugu

### Test Case 3: Dynamic Language Switching
**Objective**: Verify language switching without restart

**Steps**:
1. Set language to English
2. Navigate to various screens
3. Change language to Hindi
4. Navigate back through screens

**Expected Results**:
- ✅ All screens update to Hindi
- ✅ No app restart required
- ✅ Cached content re-translated
- ✅ No UI glitches or errors

---

## Task 24.5: Offline Functionality Testing

### Test Case 1: Offline Mode Detection
**Objective**: Verify offline mode detection

**Steps**:
1. Open app while online
2. Turn off WiFi and mobile data
3. Observe UI changes

**Expected Results**:
- ✅ Offline indicator banner appears
- ✅ Banner shows "You are offline" message
- ✅ Features requiring internet disabled

### Test Case 2: Cached Data Viewing
**Objective**: Verify cached data access offline

**Steps**:
1. While online, view:
   - Detection history
   - Advisory history
   - Government schemes
   - User profile
2. Turn off internet
3. Navigate to same screens

**Expected Results**:
- ✅ Detection history loads from cache
- ✅ Advisory history loads from cache
- ✅ Schemes load from cache
- ✅ Profile loads from cache
- ✅ "Showing cached data" indicator displayed

### Test Case 3: Request Queuing
**Objective**: Verify offline request queuing

**Steps**:
1. Turn off internet
2. Attempt to:
   - Submit advisory query
   - Rate an advisory
3. Turn on internet
4. Wait for sync

**Expected Results**:
- ✅ Requests queued with message
- ✅ Queue count visible
- ✅ Requests sync automatically when online
- ✅ Success notification shown after sync

### Test Case 4: Connectivity Restoration
**Objective**: Verify behavior when connectivity restored

**Steps**:
1. Use app offline for several actions
2. Turn on internet connection
3. Observe app behavior

**Expected Results**:
- ✅ Offline indicator disappears
- ✅ Queued requests sync automatically
- ✅ Fresh data fetched from API
- ✅ Cache updated with new data

---

## Task 24.6: Security Features Testing

### Test Case 1: JWT Token Validation
**Objective**: Verify JWT token validation

**Steps**:
1. Login successfully
2. Manually modify stored access token
3. Make an API request

**Expected Results**:
- ✅ Invalid token detected
- ✅ 401 Unauthorized error returned
- ✅ User logged out automatically
- ✅ Redirected to login screen

### Test Case 2: Cross-User Authorization
**Objective**: Verify users cannot access other users' data

**Steps**:
1. Login as User A
2. Note a detection ID from User A
3. Logout and login as User B
4. Attempt to access User A's detection ID

**Expected Results**:
- ✅ 403 Forbidden error returned
- ✅ Error message displayed
- ✅ User B cannot view User A's data

### Test Case 3: API Rate Limiting
**Objective**: Verify API rate limiting

**Steps**:
1. Make 100+ API requests within 1 minute
2. Observe response

**Expected Results**:
- ✅ First 100 requests succeed
- ✅ Subsequent requests return 429 error
- ✅ Error message shows retry time
- ✅ Requests succeed after wait period

### Test Case 4: Input Sanitization
**Objective**: Verify SQL injection prevention

**Steps**:
1. Attempt to enter SQL injection strings in:
   - Advisory query: "'; DROP TABLE users; --"
   - Profile name: "<script>alert('xss')</script>"
2. Submit forms

**Expected Results**:
- ✅ Input sanitized before processing
- ✅ No SQL injection occurs
- ✅ No XSS vulnerabilities
- ✅ Data stored safely

---

## Test Execution Checklist

### iOS Testing
- [ ] iPhone 12 or newer (iOS 15+)
- [ ] All test cases executed
- [ ] Screenshots captured for issues
- [ ] Performance metrics recorded

### Android Testing
- [ ] Android 10+ device
- [ ] All test cases executed
- [ ] Screenshots captured for issues
- [ ] Performance metrics recorded

### Cross-Platform Testing
- [ ] UI consistency verified
- [ ] Feature parity confirmed
- [ ] Navigation flows identical
- [ ] Error handling consistent

---

## Bug Reporting Template

```markdown
**Bug ID**: BUG-XXX
**Severity**: Critical / High / Medium / Low
**Platform**: iOS / Android / Both
**Device**: [Device model and OS version]

**Description**:
[Clear description of the bug]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Videos**:
[Attach evidence]

**Logs**:
[Relevant error logs]
```

---

## Test Results Summary

| Test Category | Total Tests | Passed | Failed | Blocked |
|--------------|-------------|--------|--------|---------|
| Authentication | 5 | - | - | - |
| Disease Detection | 5 | - | - | - |
| Advisory | 4 | - | - | - |
| Multilingual | 3 | - | - | - |
| Offline | 4 | - | - | - |
| Security | 4 | - | - | - |
| **TOTAL** | **25** | **-** | **-** | **-** |

---

## Sign-Off

**Tested By**: _______________  
**Date**: _______________  
**Status**: Pass / Fail / Conditional Pass  
**Notes**: _______________
