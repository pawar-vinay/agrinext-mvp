-- Fix missing rate limit tables
-- Run this on the RDS database

-- Create otp_rate_limits table
CREATE TABLE IF NOT EXISTS otp_rate_limits (
    id SERIAL PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mobile_created ON otp_rate_limits(mobile_number, created_at);

-- Create api_rate_limits table
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    endpoint VARCHAR(255) NOT NULL,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_endpoint_created ON api_rate_limits(user_id, endpoint, created_at);
CREATE INDEX IF NOT EXISTS idx_ip_endpoint_created ON api_rate_limits(ip_address, endpoint, created_at);

-- Verify tables exist
SELECT 
    tablename, 
    schemaname 
FROM pg_tables 
WHERE tablename IN ('otp_rate_limits', 'api_rate_limits');

-- Show success message
SELECT 'Rate limit tables created successfully!' as status;
