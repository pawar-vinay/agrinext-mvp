-- Migration: Add rate limiting tables
-- Created: 2026-03-02

-- OTP rate limiting table
CREATE TABLE IF NOT EXISTS otp_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_rate_limits_mobile (mobile_number, created_at)
);

-- API rate limiting table
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_api_rate_limits_identifier (identifier, created_at)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_created_at ON otp_rate_limits(created_at);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_created_at ON api_rate_limits(created_at);
