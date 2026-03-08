-- ============================================
-- Phase 2 Schema Upgrade Migration
-- Upgrades Phase 1 schema to Phase 2 requirements
-- Safe to run multiple times (idempotent)
-- ============================================

-- Start transaction
BEGIN;

-- ============================================
-- 1. BACKUP VERIFICATION
-- ============================================
-- Verify tables exist before migration
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Phase 1 schema not found. Please ensure Phase 1 is deployed first.';
    END IF;
END $;

-- ============================================
-- 2. ADD NEW COLUMNS TO EXISTING TABLES
-- ============================================

-- Users table: Add latitude/longitude if not exists
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'latitude') THEN
        ALTER TABLE users ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'longitude') THEN
        ALTER TABLE users ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
END $;

-- Disease detections: Add new fields for Phase 2
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'disease_detections' AND column_name = 'disease_name_local') THEN
        ALTER TABLE disease_detections ADD COLUMN disease_name_local VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'disease_detections' AND column_name = 'treatment_recommendations_local') THEN
        ALTER TABLE disease_detections ADD COLUMN treatment_recommendations_local TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'disease_detections' AND column_name = 'latitude') THEN
        ALTER TABLE disease_detections ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'disease_detections' AND column_name = 'longitude') THEN
        ALTER TABLE disease_detections ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
END $;

-- Advisories: Add response_time_ms if not exists
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'advisories' AND column_name = 'response_time_ms') THEN
        ALTER TABLE advisories ADD COLUMN response_time_ms INTEGER;
    END IF;
END $;

-- User sessions: Add device_info and ip_address if not exists
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_sessions' AND column_name = 'device_info') THEN
        ALTER TABLE user_sessions ADD COLUMN device_info JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_sessions' AND column_name = 'ip_address') THEN
        ALTER TABLE user_sessions ADD COLUMN ip_address INET;
    END IF;
END $;

-- ============================================
-- 3. CREATE NEW INDEXES FOR PERFORMANCE
-- ============================================

-- Disease detections: Location-based queries
CREATE INDEX IF NOT EXISTS idx_detections_location 
ON disease_detections(latitude, longitude);

-- Disease detections: Crop type filtering
CREATE INDEX IF NOT EXISTS idx_detections_crop 
ON disease_detections(crop_type);

-- Advisories: Category filtering
CREATE INDEX IF NOT EXISTS idx_advisories_category 
ON advisories(category);

-- Advisories: Rating filtering
CREATE INDEX IF NOT EXISTS idx_advisories_rating 
ON advisories(rating) WHERE rating IS NOT NULL;

-- Government schemes: GIN indexes for array columns
CREATE INDEX IF NOT EXISTS idx_schemes_states 
ON government_schemes USING GIN(applicable_states);

CREATE INDEX IF NOT EXISTS idx_schemes_crops 
ON government_schemes USING GIN(applicable_crops);

-- ============================================
-- 4. UPDATE CONSTRAINTS
-- ============================================

-- Ensure language constraints are correct
DO $
BEGIN
    -- Drop old constraint if exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'chk_language' AND table_name = 'users') THEN
        ALTER TABLE users DROP CONSTRAINT chk_language;
    END IF;
    
    -- Add new constraint
    ALTER TABLE users ADD CONSTRAINT chk_language 
    CHECK (language IN ('en', 'hi', 'te'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $;

-- Ensure advisory language constraint
DO $
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'chk_advisory_language' AND table_name = 'advisories') THEN
        ALTER TABLE advisories DROP CONSTRAINT chk_advisory_language;
    END IF;
    
    ALTER TABLE advisories ADD CONSTRAINT chk_advisory_language 
    CHECK (language IN ('en', 'hi', 'te'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $;

-- ============================================
-- 5. CREATE VIEWS FOR PHASE 2
-- ============================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS active_users_summary;
DROP VIEW IF EXISTS disease_outbreak_monitor;

-- Active users summary view
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

-- Disease outbreak monitoring view
CREATE VIEW disease_outbreak_monitor AS
SELECT 
    d.disease_id,
    d.disease_name,
    d.crop_type,
    u.state,
    u.district,
    COUNT(*) as detection_count,
    AVG(d.confidence) as avg_confidence,
    MAX(d.created_at) as last_detected,
    COUNT(CASE WHEN d.severity IN ('high', 'critical') THEN 1 END) as severe_cases
FROM disease_detections d
JOIN users u ON d.user_id = u.id
WHERE d.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY d.disease_id, d.disease_name, d.crop_type, u.state, u.district
HAVING COUNT(*) >= 3
ORDER BY detection_count DESC;

-- ============================================
-- 6. CREATE CLEANUP FUNCTIONS
-- ============================================

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $
BEGIN
    DELETE FROM otp_verifications 
    WHERE expires_at < CURRENT_TIMESTAMP;
END;
$ LANGUAGE plpgsql;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $
BEGIN
    UPDATE user_sessions 
    SET is_active = false 
    WHERE expires_at < CURRENT_TIMESTAMP AND is_active = true;
END;
$ LANGUAGE plpgsql;

-- ============================================
-- 7. UPDATE EXISTING DATA (IF NEEDED)
-- ============================================

-- Set default language for existing users without language
UPDATE users 
SET language = 'en' 
WHERE language IS NULL OR language = '';

-- Set default category for existing advisories
UPDATE advisories 
SET category = 'general' 
WHERE category IS NULL;

-- ============================================
-- 8. VERIFY MIGRATION
-- ============================================

-- Count tables
DO $
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    IF table_count < 8 THEN
        RAISE EXCEPTION 'Migration incomplete: Expected 8 tables, found %', table_count;
    END IF;
    
    RAISE NOTICE 'Migration verification: % tables found', table_count;
END $;

-- Verify critical columns exist
DO $
BEGIN
    -- Check users.latitude
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'latitude') THEN
        RAISE EXCEPTION 'Migration failed: users.latitude not created';
    END IF;
    
    -- Check disease_detections.disease_name_local
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'disease_detections' AND column_name = 'disease_name_local') THEN
        RAISE EXCEPTION 'Migration failed: disease_detections.disease_name_local not created';
    END IF;
    
    RAISE NOTICE 'Migration verification: All critical columns exist';
END $;

-- ============================================
-- 9. COMMIT TRANSACTION
-- ============================================

COMMIT;

-- ============================================
-- 10. POST-MIGRATION STATISTICS
-- ============================================

-- Display migration summary
SELECT 
    'Migration Complete' as status,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
    (SELECT COUNT(*) FROM information_schema.views 
     WHERE table_schema = 'public') as total_views,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM government_schemes) as total_schemes,
    (SELECT COUNT(*) FROM disease_detections) as total_detections,
    (SELECT COUNT(*) FROM advisories) as total_advisories;

-- Display index summary
SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Log migration completion
INSERT INTO audit_logs (action, entity_type, entity_id, new_values, created_at)
VALUES (
    'update',
    'database_schema',
    NULL,
    '{"migration": "002_phase2_schema_upgrade", "status": "completed"}'::jsonb,
    CURRENT_TIMESTAMP
);

SELECT 'Phase 2 schema migration completed successfully!' as message;

-- ============================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- ============================================
-- To rollback this migration, run:
-- 
-- BEGIN;
-- 
-- -- Remove new columns
-- ALTER TABLE users DROP COLUMN IF EXISTS latitude;
-- ALTER TABLE users DROP COLUMN IF EXISTS longitude;
-- ALTER TABLE disease_detections DROP COLUMN IF EXISTS disease_name_local;
-- ALTER TABLE disease_detections DROP COLUMN IF EXISTS treatment_recommendations_local;
-- ALTER TABLE disease_detections DROP COLUMN IF EXISTS latitude;
-- ALTER TABLE disease_detections DROP COLUMN IF EXISTS longitude;
-- ALTER TABLE advisories DROP COLUMN IF EXISTS response_time_ms;
-- ALTER TABLE user_sessions DROP COLUMN IF EXISTS device_info;
-- ALTER TABLE user_sessions DROP COLUMN IF EXISTS ip_address;
-- 
-- -- Drop new indexes
-- DROP INDEX IF EXISTS idx_detections_location;
-- DROP INDEX IF EXISTS idx_detections_crop;
-- DROP INDEX IF EXISTS idx_advisories_category;
-- DROP INDEX IF EXISTS idx_advisories_rating;
-- DROP INDEX IF EXISTS idx_schemes_states;
-- DROP INDEX IF EXISTS idx_schemes_crops;
-- 
-- -- Drop views
-- DROP VIEW IF EXISTS active_users_summary;
-- DROP VIEW IF EXISTS disease_outbreak_monitor;
-- 
-- -- Drop functions
-- DROP FUNCTION IF EXISTS cleanup_expired_otps();
-- DROP FUNCTION IF EXISTS cleanup_expired_sessions();
-- 
-- COMMIT;
-- 
-- ============================================

