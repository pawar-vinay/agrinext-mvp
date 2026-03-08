-- Migration: Add Rate Limiting Tables
-- Description: Creates tables for OTP and API rate limiting
-- Date: 2026-03-04
-- Author: Agrinext Team

-- Create OTP rate limiting table
CREATE TABLE IF NOT EXISTS otp_rate_limits (
    id SERIAL PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_otp_mobile_created 
ON otp_rate_limits(mobile_number, created_at);

-- Create API rate limiting table
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    endpoint VARCHAR(255) NOT NULL,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_api_user_endpoint_created 
ON api_rate_limits(user_id, endpoint, created_at);

CREATE INDEX IF NOT EXISTS idx_api_ip_endpoint_created 
ON api_rate_limits(ip_address, endpoint, created_at);

-- Add comments for documentation
COMMENT ON TABLE otp_rate_limits IS 'Tracks OTP requests for rate limiting per mobile number';
COMMENT ON TABLE api_rate_limits IS 'Tracks API requests for rate limiting per user and IP address';

COMMENT ON COLUMN otp_rate_limits.mobile_number IS 'Mobile number requesting OTP (without country code)';
COMMENT ON COLUMN otp_rate_limits.created_at IS 'Timestamp of OTP request';

COMMENT ON COLUMN api_rate_limits.user_id IS 'User ID making the API request (nullable for unauthenticated requests)';
COMMENT ON COLUMN api_rate_limits.endpoint IS 'API endpoint being accessed';
COMMENT ON COLUMN api_rate_limits.ip_address IS 'IP address of the client';
COMMENT ON COLUMN api_rate_limits.created_at IS 'Timestamp of API request';

-- Verify tables were created
SELECT 
    tablename, 
    schemaname,
    tableowner
FROM pg_tables 
WHERE tablename IN ('otp_rate_limits', 'api_rate_limits')
ORDER BY tablename;

-- Show success message
SELECT 'Rate limiting tables created successfully!' as status;
