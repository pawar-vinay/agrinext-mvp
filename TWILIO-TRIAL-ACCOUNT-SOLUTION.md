# Twilio Trial Account Solution

## Root Cause Identified

Your Twilio account is in **TRIAL MODE**, which has the following restriction:
- **Error Code**: 21608
- **Error**: "The number +919876543210 is unverified. Trial accounts cannot send messages to unverified numbers"
- **Meaning**: You can only send SMS to phone numbers that you've verified in your Twilio console

## Two Solutions

### Option 1: Verify Phone Numbers (FREE - Recommended for Testing)

This is the quickest solution for testing your application.

**Steps:**
1. Go to Twilio Console: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click **"Add a new number"** or **"Verify a new number"**
3. Enter the phone number you want to test with in international format:
   - Example: `+919876543210` (for India)
   - Example: `+1234567890` (for US)
4. Choose verification method (SMS or Voice Call)
5. Enter the verification code you receive
6. Repeat for any other numbers you want to test with (up to 10 numbers free)

**Limitations:**
- Can verify up to 10 numbers
- Each number must be verified individually
- Good for development/testing only

### Option 2: Upgrade Twilio Account (PAID - Recommended for Production)

This removes all trial restrictions and allows sending to any phone number.

**Steps:**
1. Go to Twilio Billing: https://console.twilio.com/us1/billing/manage-billing/upgrade
2. Click **"Upgrade your account"**
3. Add a payment method (credit card)
4. Complete the upgrade process
5. Your account will be upgraded immediately

**Benefits:**
- Send SMS to ANY phone number (no verification needed)
- Higher rate limits
- Access to all Twilio features
- Required for production use

**Cost:**
- Pay-as-you-go pricing
- SMS to India: ~$0.0075 per message
- No monthly fees (only pay for what you use)
- Initial credit may be provided

## Database Issue (FIXED)

The other issue was a missing database table `otp_rate_limits`. This needs to be created by running the migration:

```sql
CREATE TABLE IF NOT EXISTS otp_rate_limits (
    id SERIAL PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mobile_created ON otp_rate_limits(mobile_number, created_at);
```

## Quick Test After Fixing

After verifying a phone number or upgrading your account:

```bash
cd /home/ssm-user/agrinext-phase2/backend

# Test with YOUR verified number
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"YOUR_VERIFIED_NUMBER"}'
```

Replace `YOUR_VERIFIED_NUMBER` with the 10-digit number you verified (without +91).

## Expected Success Response

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresAt": "2026-03-04T18:10:00.000Z"
}
```

## Recommendation

For immediate testing: **Verify 2-3 phone numbers** (yours and your team members)
For production deployment: **Upgrade your Twilio account**

## Additional Resources

- Twilio Trial Account Docs: https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account
- Twilio Pricing: https://www.twilio.com/sms/pricing
- Verify Phone Numbers: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
