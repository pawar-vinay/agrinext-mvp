# Minimum Viable Product (MVP) Scope: Agrinext

## Executive Summary

This MVP focuses on delivering the three core value propositions of Agrinext while maintaining a realistic scope for initial launch. The MVP will validate the product-market fit with rural Indian farmers by providing essential functionality in crop disease detection, agronomy advice, and government scheme access.

## MVP Philosophy

**Goal**: Launch a functional product that solves the most critical farmer pain points within 3-4 months, gather user feedback, and iterate.

**Success Metrics**:
- 1,000+ active farmers using the app within first 3 months
- 70%+ accuracy in disease detection for top 10 diseases
- 80%+ user satisfaction with advisory quality
- Average response time < 2 minutes for queries

## Core Features (MUST HAVE)

### 1. User Authentication & Profile (Simplified)
**From Requirements**: Requirement 4, Requirement 7

**MVP Scope**:
- ✅ Mobile number registration with OTP verification
- ✅ Basic profile: name, location (state/district), primary crop (single crop only), language preference
- ✅ Simple login/logout
- ✅ Basic security: JWT tokens, TLS encryption

**Deferred to Post-MVP**:
- ❌ Multiple crops per profile
- ❌ Farm size tracking
- ❌ Account lockout after failed attempts
- ❌ Data deletion requests (GDPR compliance)

**Implementation Priority**: HIGH (Foundation for all features)

---

### 2. Crop Disease Detection (Core Feature)
**From Requirements**: Requirement 3

**MVP Scope**:
- ✅ Upload crop image from camera or gallery
- ✅ Detect top 10 most common diseases (reduced from 50)
- ✅ Display disease name, severity, and basic treatment in user's language
- ✅ Store detection history (last 30 days only)
- ✅ Basic image quality validation

**Deferred to Post-MVP**:
- ❌ Regional outbreak alerts
- ❌ Advanced image quality guidance
- ❌ Organic treatment alternatives
- ❌ Yield impact estimation
- ❌ On-device TensorFlow Lite model (cloud-only for MVP)

**Implementation Priority**: HIGH (Primary value proposition)

**Technical Simplifications**:
- Use pre-trained model from Hugging Face or similar
- Cloud-based inference only (no offline detection)
- Focus on 3-5 major crops (rice, wheat, cotton, tomato, potato)
- Target 70% accuracy threshold (vs 85% in full version)

---

### 3. Agronomy Advisory (Simplified)
**From Requirements**: Requirement 1, Requirement 8

**MVP Scope**:
- ✅ Text-based query submission
- ✅ AI-generated responses using LLM (GPT/Claude) with crop knowledge base
- ✅ Context-aware: considers user's crop and location
- ✅ View advisory history (last 30 entries)
- ✅ Simple rating system (helpful/not helpful)

**Deferred to Post-MVP**:
- ❌ Proactive weather-based advisories
- ❌ Pattern recognition across farmers
- ❌ Knowledge base of 50+ crops (start with 10 major crops)
- ❌ Advanced search and filtering
- ❌ 2-year history retention (MVP: 90 days)

**Implementation Priority**: HIGH (Core value proposition)

**Technical Simplifications**:
- Use OpenAI/Anthropic API with custom prompts
- Simple keyword-based context injection
- No complex NLP or pattern matching

---

### 4. Government Schemes (Read-Only)
**From Requirements**: Requirement 2

**MVP Scope**:
- ✅ Browse government schemes by category
- ✅ View scheme details in user's language (3 languages: English, Hindi, Telugu)
- ✅ Basic eligibility checker (state + crop based)
- ✅ External link to official application portal

**Deferred to Post-MVP**:
- ❌ In-app scheme application
- ❌ Application tracking
- ❌ Document upload
- ❌ 10+ language support (MVP: 3 languages)
- ❌ Automatic translation of new schemes
- ❌ Deadline reminders

**Implementation Priority**: MEDIUM (Important but not critical for MVP)

**Technical Simplifications**:
- Static scheme database (manual updates)
- No integration with government APIs
- Simple filtering logic
- Redirect to external sites for applications

---

### 5. Basic Multilingual Support
**From Requirements**: Requirement 2

**MVP Scope**:
- ✅ Support 3 languages: English, Hindi, Telugu
- ✅ Language selection during registration
- ✅ UI text translation
- ✅ Advisory responses in selected language

**Deferred to Post-MVP**:
- ❌ 10+ regional languages
- ❌ Voice input/output (Requirement 9)
- ❌ Automatic language detection
- ❌ Real-time translation of user-generated content

**Implementation Priority**: MEDIUM

**Technical Simplifications**:
- Use Google Translate API or similar
- Pre-translated UI strings
- Focus on most widely spoken languages

---

### 6. Weather Information (Basic)
**From Requirements**: Requirement 11

**MVP Scope**:
- ✅ Display current weather for user's location
- ✅ 3-day forecast (reduced from 7 days)
- ✅ Basic weather alerts (severe weather only)

**Deferred to Post-MVP**:
- ❌ 7-day forecast
- ❌ Historical weather data
- ❌ Weather-based farming recommendations
- ❌ Proactive alerts 12 hours in advance

**Implementation Priority**: LOW (Nice to have for MVP)

**Technical Simplifications**:
- Use free weather API (OpenWeatherMap)
- Simple display, no advanced analytics

---

## Explicitly OUT OF SCOPE for MVP

### Features Deferred to v2.0+

1. **Offline Capability** (Requirement 5)
   - Reason: Complex to implement, requires significant mobile development
   - Alternative: Focus on areas with basic connectivity first

2. **Community Forum** (Requirement 10)
   - Reason: Requires moderation, complex social features
   - Alternative: Launch with core features first, add social later

3. **Push Notifications** (Requirement 6)
   - Reason: Infrastructure overhead, not critical for MVP
   - Alternative: In-app notifications only

4. **Voice Input/Output** (Requirement 9)
   - Reason: Complex multilingual speech recognition
   - Alternative: Text-based interface with simple language

5. **Scheme Application Tracking** (Requirement 12)
   - Reason: Requires government API integration
   - Alternative: Provide information only, external application

6. **Advanced Analytics & Monitoring** (Requirement 8.4)
   - Reason: Not user-facing, can add post-launch
   - Alternative: Basic logging only

---

## MVP Architecture (Simplified)

### Technology Stack

**Mobile App**:
- Platform: Android only (no iOS for MVP)
- Framework: React Native or Flutter (faster development than native Kotlin)
- Local Storage: AsyncStorage (no Room database complexity)

**Backend**:
- Single Node.js/Express server (no microservices)
- Single PostgreSQL database (no MongoDB/Redis for MVP)
- Cloud hosting: AWS/GCP/Heroku

**AI/ML**:
- Disease Detection: Cloud-based API (Hugging Face, Roboflow, or custom)
- Advisory: OpenAI/Anthropic API with custom prompts
- Translation: Google Translate API

**External Services**:
- Weather: OpenWeatherMap API (free tier)
- SMS OTP: Twilio or similar
- Image Storage: AWS S3 or Cloudinary

### Simplified Data Model

```sql
-- Users table (simplified)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    state VARCHAR(50),
    district VARCHAR(50),
    primary_crop VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Disease detections
CREATE TABLE disease_detections (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    image_url TEXT,
    disease_name VARCHAR(100),
    confidence FLOAT,
    severity VARCHAR(20),
    treatment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Advisories
CREATE TABLE advisories (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    query TEXT,
    response TEXT,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Government schemes (static data)
CREATE TABLE schemes (
    id UUID PRIMARY KEY,
    name_en TEXT,
    name_hi TEXT,
    name_te TEXT,
    description_en TEXT,
    description_hi TEXT,
    description_te TEXT,
    category VARCHAR(50),
    applicable_states TEXT[],
    applicable_crops TEXT[],
    external_link TEXT
);
```

---

## MVP Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Set up development environment
- Create basic Android app with authentication
- Set up backend server with database
- Implement OTP-based registration/login
- Basic profile management

**Deliverable**: Users can register and log in

---

### Phase 2: Disease Detection (Weeks 3-4)
- Integrate disease detection model/API
- Implement image upload and processing
- Display results with treatment recommendations
- Store detection history
- Add multilingual support for results

**Deliverable**: Users can detect diseases in crop images

---

### Phase 3: Advisory Service (Weeks 5-6)
- Integrate LLM API for advisory generation
- Build query submission interface
- Implement context-aware responses
- Add advisory history view
- Implement rating system

**Deliverable**: Users can ask questions and get farming advice

---

### Phase 4: Schemes & Weather (Weeks 7-8)
- Populate scheme database
- Build scheme browsing interface
- Implement eligibility checker
- Integrate weather API
- Display weather information

**Deliverable**: Users can browse schemes and view weather

---

### Phase 5: Polish & Testing (Weeks 9-10)
- UI/UX improvements
- Bug fixes
- Performance optimization
- User acceptance testing
- Prepare for launch

**Deliverable**: Production-ready MVP

---

### Phase 6: Pilot Launch (Weeks 11-12)
- Deploy to production
- Onboard 50-100 pilot users
- Gather feedback
- Monitor performance
- Iterate based on feedback

**Deliverable**: Live app with real users

---

## MVP Success Criteria

### Functional Requirements
- ✅ Users can register and create profiles
- ✅ Users can upload images and get disease detection results
- ✅ Users can ask farming questions and receive advice
- ✅ Users can browse government schemes
- ✅ App works in 3 languages (English, Hindi, Telugu)

### Performance Requirements
- ✅ Disease detection: < 30 seconds response time
- ✅ Advisory queries: < 2 minutes response time
- ✅ App load time: < 3 seconds
- ✅ 99% uptime during business hours

### Quality Requirements
- ✅ Disease detection accuracy: > 70% for top 10 diseases
- ✅ User satisfaction: > 80% positive ratings
- ✅ Crash-free rate: > 95%

### Business Requirements
- ✅ 1,000+ registered users within 3 months
- ✅ 500+ active monthly users
- ✅ 50+ disease detections per day
- ✅ 100+ advisory queries per day

---

## Post-MVP Roadmap

### Version 2.0 (Months 4-6)
- Offline capability for disease detection
- Expand to 20 diseases and 20 crops
- Add 5 more languages
- Push notifications
- Community forum (basic)

### Version 3.0 (Months 7-9)
- Voice input/output
- In-app scheme applications
- Application tracking
- Advanced analytics
- Regional outbreak alerts

### Version 4.0 (Months 10-12)
- iOS app
- On-device ML models
- Advanced community features
- Integration with government APIs
- Proactive advisory system

---

## Resource Requirements for MVP

### Team
- 1 Full-stack Developer (backend + API integration)
- 1 Mobile Developer (React Native/Flutter)
- 1 ML Engineer (part-time, for model integration)
- 1 UI/UX Designer (part-time)
- 1 Product Manager/Project Lead

### Infrastructure Costs (Monthly)
- Cloud hosting: $50-100
- Database: $20-50
- AI APIs (OpenAI/Anthropic): $100-200
- Weather API: Free tier
- SMS OTP: $20-50
- Image storage: $10-20
- **Total**: ~$200-420/month

### Timeline
- Development: 10 weeks
- Testing & Pilot: 2 weeks
- **Total**: 12 weeks (3 months)

---

## Risk Mitigation

### Technical Risks
1. **ML Model Accuracy**: Use pre-trained models, start with limited diseases
2. **API Costs**: Monitor usage, implement rate limiting
3. **Scalability**: Start small, optimize as user base grows

### Business Risks
1. **User Adoption**: Focus on pilot region, gather feedback early
2. **Language Barriers**: Start with 3 languages, expand based on demand
3. **Connectivity Issues**: Target semi-urban areas first, add offline later

### Operational Risks
1. **Content Moderation**: Defer community features to v2.0
2. **Support Load**: Provide FAQ and basic in-app help
3. **Data Privacy**: Implement basic security, enhance post-MVP

---

## Conclusion

This MVP scope balances ambition with pragmatism, focusing on the three core value propositions:
1. **Disease Detection**: Helps farmers identify crop diseases quickly
2. **Agronomy Advice**: Provides personalized farming guidance
3. **Scheme Access**: Connects farmers with government benefits

By limiting scope to essential features, using existing APIs/services, and focusing on 3 languages and 10 diseases, we can launch a functional product in 3 months that validates the concept and gathers real user feedback for future iterations.

**Next Steps**: Review this MVP scope with stakeholders, adjust based on feedback, and begin Phase 1 development.
