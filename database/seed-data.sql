-- ============================================
-- Agrinext MVP - Seed Data
-- Sample data for testing and development
-- ============================================

-- ============================================
-- GOVERNMENT SCHEMES SEED DATA
-- ============================================

INSERT INTO government_schemes (
    scheme_code, 
    name_en, 
    name_hi, 
    name_te,
    description_en, 
    description_hi, 
    description_te,
    category, 
    benefits_en,
    benefits_hi,
    benefits_te,
    eligibility_criteria,
    required_documents,
    applicable_states,
    applicable_crops,
    application_deadline,
    external_link,
    implementing_agency,
    is_active
) VALUES
-- 1. PM-KISAN
(
    'PM-KISAN-2024',
    'Pradhan Mantri Kisan Samman Nidhi',
    'प्रधानमंत्री किसान सम्मान निधि',
    'ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి',
    'Income support scheme providing ₹6000 per year to all farmer families in three equal installments',
    'सभी किसान परिवारों को तीन समान किस्तों में प्रति वर्ष ₹6000 की आय सहायता योजना',
    'అన్ని రైతు కుటుంబాలకు మూడు సమాన వాయిదాలలో సంవత్సరానికి ₹6000 ఆదాయ మద్దతు పథకం',
    'subsidies',
    ARRAY['₹6000 per year', 'Direct bank transfer', 'Three equal installments of ₹2000'],
    ARRAY['प्रति वर्ष ₹6000', 'सीधे बैंक हस्तांतरण', '₹2000 की तीन समान किस्तें'],
    ARRAY['సంవత్సరానికి ₹6000', 'ప్రత్యక్ష బ్యాంక్ బదిలీ', '₹2000 యొక్క మూడు సమాన వాయిదాలు'],
    '{"land_ownership": "required", "min_land_size": "any", "income_limit": "none"}'::jsonb,
    ARRAY['Aadhaar Card', 'Bank Account Details', 'Land Ownership Documents'],
    ARRAY['All States', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka'],
    ARRAY['All Crops'],
    '2024-12-31',
    'https://pmkisan.gov.in',
    'Ministry of Agriculture & Farmers Welfare',
    true
),

-- 2. Crop Insurance
(
    'PMFBY-2024',
    'Pradhan Mantri Fasal Bima Yojana',
    'प्रधानमंत्री फसल बीमा योजना',
    'ప్రధాన మంత్రి ఫసల్ బీమా యోజన',
    'Comprehensive crop insurance scheme covering pre-sowing to post-harvest losses',
    'बुवाई से पहले से लेकर कटाई के बाद के नुकसान को कवर करने वाली व्यापक फसल बीमा योजना',
    'విత్తనం ముందు నుండి పంట తర్వాత నష్టాలను కవర్ చేసే సమగ్ర పంట బీమా పథకం',
    'crop_insurance',
    ARRAY['Coverage for natural calamities', 'Low premium rates', 'Quick claim settlement'],
    ARRAY['प्राकृतिक आपदाओं के लिए कवरेज', 'कम प्रीमियम दरें', 'त्वरित दावा निपटान'],
    ARRAY['సహజ విపత్తుల కవరేజ్', 'తక్కువ ప్రీమియం రేట్లు', 'త్వరిత క్లెయిమ్ పరిష్కారం'],
    '{"farmer_type": "all", "crop_type": "notified_crops", "enrollment": "voluntary"}'::jsonb,
    ARRAY['Aadhaar Card', 'Bank Account', 'Land Records', 'Sowing Certificate'],
    ARRAY['All States', 'Andhra Pradesh', 'Telangana'],
    ARRAY['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize'],
    '2024-06-30',
    'https://pmfby.gov.in',
    'Ministry of Agriculture & Farmers Welfare',
    true
),

-- 3. Kisan Credit Card
(
    'KCC-2024',
    'Kisan Credit Card Scheme',
    'किसान क्रेडिट कार्ड योजना',
    'కిసాన్ క్రెడిట్ కార్డ్ పథకం',
    'Credit facility for farmers to meet short-term credit requirements for cultivation and other needs',
    'किसानों के लिए खेती और अन्य जरूरतों के लिए अल्पकालिक ऋण आवश्यकताओं को पूरा करने के लिए ऋण सुविधा',
    'వ్యవసాయం మరియు ఇతర అవసరాల కోసం స్వల్పకాలిక రుణ అవసరాలను తీర్చడానికి రైతులకు రుణ సౌకర్యం',
    'loans',
    ARRAY['Low interest rate (4% per annum)', 'Flexible repayment', 'No collateral for loans up to ₹1.6 lakh'],
    ARRAY['कम ब्याज दर (4% प्रति वर्ष)', 'लचीली पुनर्भुगतान', '₹1.6 लाख तक के ऋण के लिए कोई संपार्श्विक नहीं'],
    ARRAY['తక్కువ వడ్డీ రేటు (సంవత్సరానికి 4%)', 'సౌకర్యవంతమైన తిరిగి చెల్లింపు', '₹1.6 లక్షల వరకు రుణాలకు తాకట్టు లేదు'],
    '{"land_ownership": "required", "credit_limit": "based_on_land_holding"}'::jsonb,
    ARRAY['Aadhaar Card', 'Land Documents', 'Bank Account', 'Passport Size Photos'],
    ARRAY['All States'],
    ARRAY['All Crops'],
    NULL,
    'https://www.nabard.org/content1.aspx?id=523',
    'NABARD',
    true
),

-- 4. Soil Health Card
(
    'SHC-2024',
    'Soil Health Card Scheme',
    'मृदा स्वास्थ्य कार्ड योजना',
    'నేల ఆరోగ్య కార్డ్ పథకం',
    'Free soil testing and health card to promote balanced use of fertilizers',
    'उर्वरकों के संतुलित उपयोग को बढ़ावा देने के लिए मुफ्त मिट्टी परीक्षण और स्वास्थ्य कार्ड',
    'ఎరువుల సమతుల్య వినియోగాన్ని ప్రోత్సహించడానికి ఉచిత నేల పరీక్ష మరియు ఆరోగ్య కార్డ్',
    'subsidies',
    ARRAY['Free soil testing', 'Customized fertilizer recommendations', 'Improved crop yield'],
    ARRAY['मुफ्त मिट्टी परीक्षण', 'अनुकूलित उर्वरक सिफारिशें', 'बेहतर फसल उपज'],
    ARRAY['ఉచిత నేల పరీక్ష', 'అనుకూలీకరించిన ఎరువుల సిఫార్సులు', 'మెరుగైన పంట దిగుబడి'],
    '{"land_ownership": "required", "frequency": "once_in_3_years"}'::jsonb,
    ARRAY['Land Documents', 'Aadhaar Card'],
    ARRAY['All States', 'Andhra Pradesh', 'Telangana'],
    ARRAY['All Crops'],
    NULL,
    'https://soilhealth.dac.gov.in',
    'Department of Agriculture & Cooperation',
    true
),

-- 5. Micro Irrigation Scheme
(
    'PMKSY-MI-2024',
    'Pradhan Mantri Krishi Sinchayee Yojana - Micro Irrigation',
    'प्रधानमंत्री कृषि सिंचाई योजना - सूक्ष्म सिंचाई',
    'ప్రధాన మంత్రి కృషి సించాయి యోజన - సూక్ష్మ నీటిపారుదల',
    'Subsidy for installation of drip and sprinkler irrigation systems',
    'ड्रिप और स्प्रिंकलर सिंचाई प्रणाली की स्थापना के लिए सब्सिडी',
    'డ్రిప్ మరియు స్ప్రింక్లర్ నీటిపారుదల వ్యవస్థల ఏర్పాటుకు సబ్సిడీ',
    'irrigation',
    ARRAY['Up to 55% subsidy', 'Water conservation', 'Increased crop productivity'],
    ARRAY['55% तक सब्सिडी', 'जल संरक्षण', 'बढ़ी हुई फसल उत्पादकता'],
    ARRAY['55% వరకు సబ్సిడీ', 'నీటి పరిరక్షణ', 'పెరిగిన పంట ఉత్పాదకత'],
    '{"land_ownership": "required", "min_land_size": "0.5_hectare"}'::jsonb,
    ARRAY['Land Documents', 'Bank Account', 'Aadhaar Card', 'Quotation from Supplier'],
    ARRAY['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka'],
    ARRAY['All Crops'],
    '2024-09-30',
    'https://pmksy.gov.in',
    'Ministry of Jal Shakti',
    true
);

-- ============================================
-- SAMPLE USERS (for testing only)
-- ============================================

-- Note: In production, users will register through the app
-- These are sample users for development/testing

INSERT INTO users (
    mobile_number,
    name,
    language,
    state,
    district,
    village,
    latitude,
    longitude,
    primary_crop,
    is_active
) VALUES
('+919876543210', 'Ravi Kumar', 'en', 'Andhra Pradesh', 'Krishna', 'Vijayawada', 16.5062, 80.6480, 'Rice', true),
('+919876543211', 'Lakshmi Devi', 'te', 'Telangana', 'Warangal', 'Hanamkonda', 18.0087, 79.5320, 'Cotton', true),
('+919876543212', 'Suresh Reddy', 'hi', 'Maharashtra', 'Nashik', 'Sinnar', 19.8462, 73.9977, 'Sugarcane', true),
('+919876543213', 'Anjali Patil', 'en', 'Karnataka', 'Belgaum', 'Gokak', 16.1667, 74.8333, 'Wheat', true),
('+919876543214', 'Ramesh Naidu', 'te', 'Andhra Pradesh', 'Guntur', 'Tenali', 16.2428, 80.6433, 'Chilli', true);

-- ============================================
-- SAMPLE DISEASE DETECTIONS (for testing)
-- ============================================

INSERT INTO disease_detections (
    user_id,
    image_url,
    crop_type,
    disease_id,
    disease_name,
    disease_name_local,
    confidence,
    severity,
    treatment_recommendations,
    treatment_recommendations_local,
    latitude,
    longitude
)
SELECT 
    u.id,
    'https://storage.example.com/images/sample-' || u.id || '.jpg',
    u.primary_crop,
    'DISEASE_001',
    'Leaf Blight',
    'पत्ती झुलसा',
    85.5,
    'medium',
    'Apply fungicide spray. Remove affected leaves. Ensure proper drainage.',
    'कवकनाशी स्प्रे लगाएं। प्रभावित पत्तियों को हटा दें। उचित जल निकासी सुनिश्चित करें।',
    u.latitude,
    u.longitude
FROM users u
LIMIT 3;

-- ============================================
-- SAMPLE ADVISORIES (for testing)
-- ============================================

INSERT INTO advisories (
    user_id,
    query,
    response,
    category,
    crop_type,
    language,
    rating,
    response_time_ms
)
SELECT 
    u.id,
    'When is the best time to apply fertilizer for ' || u.primary_crop || '?',
    'For ' || u.primary_crop || ', the best time to apply fertilizer is during the vegetative growth stage, typically 20-30 days after sowing. Apply nitrogen-rich fertilizer in split doses for better absorption.',
    'fertilization',
    u.primary_crop,
    u.language,
    5,
    1500
FROM users u
LIMIT 3;

-- ============================================
-- CLEANUP OLD DATA (Optional - for maintenance)
-- ============================================

-- Clean up OTPs older than 24 hours
DELETE FROM otp_verifications WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- Deactivate sessions older than 30 days
UPDATE user_sessions 
SET is_active = false 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days' AND is_active = true;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'government_schemes', COUNT(*) FROM government_schemes
UNION ALL
SELECT 'disease_detections', COUNT(*) FROM disease_detections
UNION ALL
SELECT 'advisories', COUNT(*) FROM advisories;

-- ============================================
-- END OF SEED DATA
-- ============================================
