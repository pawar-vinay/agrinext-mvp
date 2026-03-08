-- ============================================
-- Agrinext MVP - Database Schema
-- PostgreSQL 14+
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    state VARCHAR(50),
    district VARCHAR(50),
    village VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    primary_crop VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT chk_language CHECK (language IN ('en', 'hi', 'te')),
    CONSTRAINT chk_mobile_format CHECK (mobile_number ~ '^\+?[0-9]{10,15}$')
);

-- Indexes for users table
CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_state_district ON users(state, district);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================
-- 2. OTP VERIFICATION TABLE
-- ============================================
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT chk_otp_format CHECK (otp_code ~ '^[0-9]{6}$'),
    CONSTRAINT chk_attempts CHECK (attempts <= 3)
);

-- Indexes for OTP table
CREATE INDEX idx_otp_mobile ON otp_verifications(mobile_number);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);

-- ============================================
-- 3. USER SESSIONS TABLE
-- ============================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    device_info JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for sessions table
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_access_token ON user_sessions(access_token);
CREATE INDEX idx_sessions_active ON user_sessions(is_active) WHERE is_active = true;

-- ============================================
-- 4. DISEASE DETECTIONS TABLE
-- ============================================
CREATE TABLE disease_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    crop_type VARCHAR(50) NOT NULL,
    disease_id VARCHAR(50),
    disease_name VARCHAR(100),
    disease_name_local VARCHAR(100),
    confidence DECIMAL(5, 2),
    severity VARCHAR(20),
    treatment_recommendations TEXT,
    treatment_recommendations_local TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_detection_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_confidence CHECK (confidence >= 0 AND confidence <= 100),
    CONSTRAINT chk_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Indexes for disease detections
CREATE INDEX idx_detections_user ON disease_detections(user_id);
CREATE INDEX idx_detections_created ON disease_detections(created_at DESC);
CREATE INDEX idx_detections_disease ON disease_detections(disease_id);
CREATE INDEX idx_detections_location ON disease_detections(latitude, longitude);
CREATE INDEX idx_detections_crop ON disease_detections(crop_type);

-- ============================================
-- 5. ADVISORIES TABLE
-- ============================================
CREATE TABLE advisories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    category VARCHAR(50),
    crop_type VARCHAR(50),
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    rating INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_advisory_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT chk_advisory_language CHECK (language IN ('en', 'hi', 'te')),
    CONSTRAINT chk_category CHECK (category IN (
        'irrigation', 'fertilization', 'pest_control', 
        'harvesting', 'soil_management', 'weather_related', 'general'
    ))
);

-- Indexes for advisories
CREATE INDEX idx_advisories_user ON advisories(user_id);
CREATE INDEX idx_advisories_created ON advisories(created_at DESC);
CREATE INDEX idx_advisories_category ON advisories(category);
CREATE INDEX idx_advisories_rating ON advisories(rating) WHERE rating IS NOT NULL;

-- ============================================
-- 6. GOVERNMENT SCHEMES TABLE
-- ============================================
CREATE TABLE government_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_code VARCHAR(50) UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_hi TEXT,
    name_te TEXT,
    description_en TEXT NOT NULL,
    description_hi TEXT,
    description_te TEXT,
    category VARCHAR(50) NOT NULL,
    benefits_en TEXT[],
    benefits_hi TEXT[],
    benefits_te TEXT[],
    eligibility_criteria JSONB,
    required_documents TEXT[],
    applicable_states TEXT[],
    applicable_crops TEXT[],
    application_deadline DATE,
    external_link TEXT,
    implementing_agency VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_scheme_category CHECK (category IN (
        'crop_insurance', 'subsidies', 'loans', 
        'training', 'market_linkage', 'irrigation'
    ))
);

-- Indexes for schemes
CREATE INDEX idx_schemes_category ON government_schemes(category);
CREATE INDEX idx_schemes_active ON government_schemes(is_active) WHERE is_active = true;
CREATE INDEX idx_schemes_states ON government_schemes USING GIN(applicable_states);
CREATE INDEX idx_schemes_crops ON government_schemes USING GIN(applicable_crops);
CREATE INDEX idx_schemes_deadline ON government_schemes(application_deadline);

-- ============================================
-- 7. SCHEME APPLICATIONS TABLE (Future use)
-- ============================================
CREATE TABLE scheme_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES government_schemes(id) ON DELETE CASCADE,
    application_data JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    tracking_id VARCHAR(100) UNIQUE,
    submitted_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    
    -- Constraints
    CONSTRAINT fk_application_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_application_scheme FOREIGN KEY (scheme_id) REFERENCES government_schemes(id),
    CONSTRAINT chk_application_status CHECK (status IN (
        'draft', 'submitted', 'under_review', 'approved', 
        'rejected', 'documents_required', 'disbursed'
    ))
);

-- Indexes for applications
CREATE INDEX idx_applications_user ON scheme_applications(user_id);
CREATE INDEX idx_applications_scheme ON scheme_applications(scheme_id);
CREATE INDEX idx_applications_status ON scheme_applications(status);
CREATE INDEX idx_applications_tracking ON scheme_applications(tracking_id);

-- ============================================
-- 8. AUDIT LOG TABLE
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_action CHECK (action IN (
        'create', 'update', 'delete', 'login', 'logout', 'view'
    ))
);

-- Indexes for audit logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schemes_updated_at
    BEFORE UPDATE ON government_schemes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON scheme_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- View for active users with recent activity
CREATE VIEW active_users_summary AS
SELECT 
    u.id,
    u.name,
    u.mobile_number,
    u.state,
    u.district,
    u.primary_crop,
    u.last_login,
    COUNT(DISTINCT d.id) as total_detections,
    COUNT(DISTINCT a.id) as total_advisories,
    MAX(d.created_at) as last_detection,
    MAX(a.created_at) as last_advisory
FROM users u
LEFT JOIN disease_detections d ON u.id = d.user_id
LEFT JOIN advisories a ON u.id = a.user_id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.mobile_number, u.state, u.district, u.primary_crop, u.last_login;

-- View for disease outbreak monitoring
CREATE VIEW disease_outbreak_monitor AS
SELECT 
    disease_id,
    disease_name,
    crop_type,
    state,
    district,
    COUNT(*) as detection_count,
    AVG(confidence) as avg_confidence,
    MAX(created_at) as last_detected,
    COUNT(CASE WHEN severity IN ('high', 'critical') THEN 1 END) as severe_cases
FROM disease_detections d
JOIN users u ON d.user_id = u.id
WHERE d.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY disease_id, disease_name, crop_type, state, district
HAVING COUNT(*) >= 3
ORDER BY detection_count DESC;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Stores farmer user information and profile data';
COMMENT ON TABLE otp_verifications IS 'Temporary storage for OTP verification during registration/login';
COMMENT ON TABLE user_sessions IS 'Manages user authentication sessions with JWT tokens';
COMMENT ON TABLE disease_detections IS 'Stores crop disease detection results from AI analysis';
COMMENT ON TABLE advisories IS 'Stores farming advisory queries and AI-generated responses';
COMMENT ON TABLE government_schemes IS 'Master data for government agricultural schemes';
COMMENT ON TABLE scheme_applications IS 'Tracks user applications to government schemes (future feature)';
COMMENT ON TABLE audit_logs IS 'Audit trail for all significant user actions';

-- ============================================
-- INITIAL DATA CLEANUP FUNCTION
-- ============================================

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_verifications 
    WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE user_sessions 
    SET is_active = false 
    WHERE expires_at < CURRENT_TIMESTAMP AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANT PERMISSIONS (adjust as needed)
-- ============================================

-- Create application user (run separately with appropriate credentials)
-- CREATE USER agrinext_app WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE agrinext TO agrinext_app;
-- GRANT USAGE ON SCHEMA public TO agrinext_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO agrinext_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO agrinext_app;

-- ============================================
-- END OF SCHEMA
-- ============================================
