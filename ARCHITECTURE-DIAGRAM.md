# Agrinext MVP - AWS Architecture Diagrams

## High-Level Architecture (For PowerPoint)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                           │
│  ┌──────────────────────┐              ┌──────────────────────┐        │
│  │   Mobile App         │              │   Web Application    │        │
│  │   (React Native)     │              │   (React + Vite)     │        │
│  │   - Android          │              │   - Responsive       │        │
│  │   - iOS              │              │   - PWA Support      │        │
│  └──────────────────────┘              └──────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Amazon API Gateway (REST API)                       │   │
│  │  - Authentication & Authorization                                │   │
│  │  - Rate Limiting (1000 req/min per user)                        │   │
│  │  - Request/Response Transformation                              │   │
│  │  - CORS Configuration                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         COMPUTE LAYER (Serverless)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Lambda     │  │   Lambda     │  │   Lambda     │                 │
│  │   Auth       │  │   Disease    │  │   Advisory   │                 │
│  │   Service    │  │   Service    │  │   Service    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│  ┌──────────────┐  ┌──────────────┐                                    │
│  │   Lambda     │  │   Lambda     │                                    │
│  │   Scheme     │  │   User       │                                    │
│  │   Service    │  │   Service    │                                    │
│  └──────────────┘  └──────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        AWS AI/ML SERVICES LAYER                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    Amazon Bedrock                               │    │
│  │  ┌──────────────────┐  ┌──────────────────┐                   │    │
│  │  │  Claude 3 Sonnet │  │  Bedrock Agents  │                   │    │
│  │  │  - Advisory      │  │  - Workflows     │                   │    │
│  │  │  - RAG Queries   │  │  - Automation    │                   │    │
│  │  └──────────────────┘  └──────────────────┘                   │    │
│  └────────────────────────────────────────────────────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Amazon          │  │  Amazon          │  │  Amazon          │    │
│  │  Rekognition     │  │  Translate       │  │  Comprehend      │    │
│  │  - Disease       │  │  - Multi-lang    │  │  - Sentiment     │    │
│  │  - Detection     │  │  - 22+ languages │  │  - Analysis      │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA & STORAGE LAYER                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Amazon RDS      │  │  Amazon S3       │  │  Amazon          │    │
│  │  (PostgreSQL)    │  │  - Crop Images   │  │  OpenSearch      │    │
│  │  - User Data     │  │  - Documents     │  │  - Vector DB     │    │
│  │  - Transactions  │  │  - Backups       │  │  - RAG KB        │    │
│  │  - Audit Logs    │  │  - Knowledge Base│  │  - Search        │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────┐                           │
│  │  Amazon          │  │  AWS Secrets     │                           │
│  │  DynamoDB        │  │  Manager         │                           │
│  │  - Sessions      │  │  - API Keys      │                           │
│  │  - Cache         │  │  - Credentials   │                           │
│  └──────────────────┘  └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    MONITORING & SECURITY LAYER                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Amazon          │  │  AWS IAM         │  │  AWS CloudTrail  │    │
│  │  CloudWatch      │  │  - Roles         │  │  - Audit Logs    │    │
│  │  - Metrics       │  │  - Policies      │  │  - Compliance    │    │
│  │  - Logs          │  │  - MFA           │  │  - Security      │    │
│  │  - Alarms        │  │                  │  │                  │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Disease Detection Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Image Capture                                                   │
│  Farmer captures crop image → Mobile/Web App                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Upload to S3                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon S3 Bucket: agrinext-crop-images                           │  │
│  │  - Secure upload with pre-signed URL                             │  │
│  │  - Image stored with metadata (user, location, timestamp)        │  │
│  │  - Triggers Lambda function via S3 event                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Image Analysis                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  AWS Lambda: Disease Detection Function                          │  │
│  │  1. Retrieve image from S3                                       │  │
│  │  2. Call Amazon Rekognition Custom Labels                        │  │
│  │  3. Detect disease patterns and confidence scores                │  │
│  │  4. Extract disease type, severity, affected area                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon Rekognition Custom Labels                                │  │
│  │  - Custom-trained model for crop diseases                        │  │
│  │  - Detects: Blight, Rust, Leaf Spot, Bacterial Wilt, etc.       │  │
│  │  - Returns: Disease name, confidence %, bounding boxes           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Treatment Recommendation                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon Bedrock (Claude 3 Sonnet)                                │  │
│  │  Input:                                                           │  │
│  │  - Disease detected: "Rice Blast"                                │  │
│  │  - Severity: "Moderate"                                          │  │
│  │  - Crop: "Rice"                                                  │  │
│  │  - Location: "Karnataka"                                         │  │
│  │  - Season: "Monsoon"                                             │  │
│  │                                                                   │  │
│  │  Process:                                                         │  │
│  │  1. Retrieve relevant treatment knowledge from RAG               │  │
│  │  2. Generate personalized treatment plan                         │  │
│  │  3. Include: Fungicides, organic methods, preventive measures    │  │
│  │  4. Add cost estimates and application instructions              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Localization                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon Translate                                                 │  │
│  │  - Translate treatment plan to farmer's language                 │  │
│  │  - Supported: Hindi, Telugu, Kannada, Tamil, etc.                │  │
│  │  - Preserve technical terms and measurements                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Response Delivery                                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  API Gateway → Mobile/Web App                                    │  │
│  │  Response includes:                                               │  │
│  │  - Disease name and description                                  │  │
│  │  - Severity level and affected area                              │  │
│  │  - Treatment recommendations                                     │  │
│  │  - Cost estimates                                                │  │
│  │  - Preventive measures                                           │  │
│  │  - Related resources and videos                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Storage & Analytics                                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon RDS (PostgreSQL)                                         │  │
│  │  - Store detection record                                        │  │
│  │  - Link to user profile                                          │  │
│  │  - Track treatment effectiveness                                 │  │
│  │  - Generate analytics for disease outbreaks                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

**Total Time**: < 3 seconds
**Cost**: ~$0.05 per detection
```

---


## RAG Advisory Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: User Query                                                      │
│  Farmer asks: "How to increase rice yield in monsoon season?"           │
│  Language: Hindi                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Query Processing                                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  AWS Lambda: Advisory Function                                   │  │
│  │  1. Receive query from API Gateway                               │  │
│  │  2. Extract user context (location, crop, language)              │  │
│  │  3. Translate query to English if needed                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon Translate                                                 │  │
│  │  Input: "मानसून में धान की उपज कैसे बढ़ाएं?"                    │  │
│  │  Output: "How to increase rice yield in monsoon season?"         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon Comprehend                                                │  │
│  │  - Extract entities: Crop (Rice), Season (Monsoon)               │  │
│  │  - Detect intent: Yield improvement                              │  │
│  │  - Analyze sentiment: Neutral/Seeking help                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Knowledge Retrieval (RAG)                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon Bedrock Knowledge Base                                   │  │
│  │  1. Convert query to embedding vector                            │  │
│  │  2. Search Amazon OpenSearch for similar documents               │  │
│  │  3. Apply filters: Crop=Rice, Season=Monsoon, Location=Karnataka│  │
│  │  4. Retrieve top 5 most relevant documents                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon OpenSearch Service                                       │  │
│  │  Vector Search (k-NN):                                           │  │
│  │  - Document 1: "Rice cultivation best practices" (Score: 0.92)   │  │
│  │  - Document 2: "Monsoon farming techniques" (Score: 0.89)        │  │
│  │  - Document 3: "Yield optimization strategies" (Score: 0.87)     │  │
│  │  - Document 4: "Fertilizer recommendations" (Score: 0.85)        │  │
│  │  - Document 5: "Water management in monsoon" (Score: 0.83)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Retrieved Context (Snippets)                                    │  │
│  │  - Use high-yielding varieties like IR64, Swarna                 │  │
│  │  - Apply NPK fertilizers in split doses                          │  │
│  │  - Maintain 5-7cm water level during monsoon                     │  │
│  │  - Use System of Rice Intensification (SRI) method               │  │
│  │  - Control weeds within first 30 days                            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Response Generation                                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon Bedrock (Claude 3 Sonnet)                                │  │
│  │                                                                   │  │
│  │  Prompt Structure:                                                │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │ System: You are an agricultural expert helping farmers     │ │  │
│  │  │                                                             │ │  │
│  │  │ Context: [Retrieved documents from RAG]                    │ │  │
│  │  │                                                             │ │  │
│  │  │ User Profile:                                               │ │  │
│  │  │ - Name: Ashok Kumar                                        │ │  │
│  │  │ - Location: Karnataka                                      │ │  │
│  │  │ - Crop: Rice                                               │ │  │
│  │  │ - Season: Monsoon                                          │ │  │
│  │  │ - Language: Hindi                                          │ │  │
│  │  │                                                             │ │  │
│  │  │ Question: How to increase rice yield in monsoon season?    │ │  │
│  │  │                                                             │ │  │
│  │  │ Instructions:                                               │ │  │
│  │  │ - Provide actionable, step-by-step advice                  │ │  │
│  │  │ - Include cost estimates                                   │ │  │
│  │  │ - Consider local conditions (Karnataka, Monsoon)           │ │  │
│  │  │ - Be concise and practical                                 │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │  Generated Response:                                              │  │
│  │  "To increase rice yield in monsoon season in Karnataka:        │  │
│  │   1. Use high-yielding varieties (IR64, Swarna) - ₹500/kg       │  │
│  │   2. Apply NPK fertilizers in 3 split doses - ₹2000/acre        │  │
│  │   3. Maintain 5-7cm water level - proper drainage               │  │
│  │   4. Use SRI method for 30% higher yield                        │  │
│  │   5. Control weeds in first 30 days - ₹1500/acre                │  │
│  │   Expected yield increase: 20-30%"                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Localization                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon Translate                                                 │  │
│  │  Translate response back to Hindi:                               │  │
│  │  "कर्नाटक में मानसून के मौसम में धान की उपज बढ़ाने के लिए:      │  │
│  │   1. उच्च उपज देने वाली किस्में (IR64, स्वर्णा) - ₹500/किग्रा    │  │
│  │   2. NPK उर्वरक 3 बार में डालें - ₹2000/एकड़                     │  │
│  │   3. 5-7 सेमी पानी का स्तर बनाए रखें                            │  │
│  │   4. SRI विधि से 30% अधिक उपज                                   │  │
│  │   5. पहले 30 दिनों में खरपतवार नियंत्रण - ₹1500/एकड़             │  │
│  │   अपेक्षित उपज वृद्धि: 20-30%"                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Response Delivery & Storage                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  API Gateway → Mobile/Web App                                    │  │
│  │  - Deliver localized response                                    │  │
│  │  - Include related resources (videos, articles)                  │  │
│  │  - Suggest follow-up questions                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon RDS (PostgreSQL)                                         │  │
│  │  - Store advisory record                                         │  │
│  │  - Link to user profile                                          │  │
│  │  - Track user satisfaction                                       │  │
│  │  - Generate analytics                                            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

**Total Time**: < 5 seconds
**Cost**: ~$0.03 per query
**Accuracy**: 95%+ relevance with RAG
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA INGESTION                                   │
│                                                                          │
│  Government Sources → S3 → Bedrock Knowledge Base → OpenSearch          │
│  Research Papers    → S3 → Bedrock Knowledge Base → OpenSearch          │
│  Farming Guides     → S3 → Bedrock Knowledge Base → OpenSearch          │
│  Historical Data    → S3 → Bedrock Knowledge Base → OpenSearch          │
│                                                                          │
│  Automatic Processing:                                                   │
│  - PDF/HTML parsing                                                     │
│  - Text chunking (512 tokens)                                           │
│  - Embedding generation (Titan Embeddings)                              │
│  - Vector storage in OpenSearch                                         │
│  - Metadata indexing                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA PROCESSING                                  │
│                                                                          │
│  User Interactions → Lambda → RDS (PostgreSQL)                          │
│  - User profiles                                                        │
│  - Disease detections                                                   │
│  - Advisory queries                                                     │
│  - Scheme applications                                                  │
│  - Feedback and ratings                                                 │
│                                                                          │
│  Images → S3 → Rekognition → Results → RDS                             │
│  - Crop images                                                          │
│  - Disease detection results                                            │
│  - Image metadata                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA ANALYTICS                                   │
│                                                                          │
│  RDS → Amazon QuickSight → Dashboards                                   │
│  - User engagement metrics                                              │
│  - Disease outbreak patterns                                            │
│  - Advisory topic trends                                                │
│  - Scheme adoption rates                                                │
│  - Regional insights                                                    │
│                                                                          │
│  CloudWatch Logs → Insights → Alerts                                    │
│  - System performance                                                   │
│  - Error rates                                                          │
│  - Cost optimization                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NETWORK SECURITY                                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Amazon VPC                                  │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐            │   │
│  │  │  Public Subnet       │  │  Private Subnet      │            │   │
│  │  │  - API Gateway       │  │  - Lambda Functions  │            │   │
│  │  │  - NAT Gateway       │  │  - RDS Database      │            │   │
│  │  └──────────────────────┘  │  - OpenSearch        │            │   │
│  │                             └──────────────────────┘            │   │
│  │  Security Groups:                                               │   │
│  │  - API Gateway: 443 (HTTPS only)                               │   │
│  │  - Lambda: Outbound only                                       │   │
│  │  - RDS: 5432 (from Lambda only)                                │   │
│  │  - OpenSearch: 443 (from Lambda only)                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         ACCESS CONTROL                                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      AWS IAM                                     │   │
│  │  Roles:                                                          │   │
│  │  - LambdaExecutionRole: Invoke Bedrock, Rekognition, Translate  │   │
│  │  - APIGatewayRole: Invoke Lambda functions                      │   │
│  │  - RDSAccessRole: Read/Write database                           │   │
│  │  - S3AccessRole: Read/Write objects                             │   │
│  │                                                                  │   │
│  │  Policies: Least privilege principle                            │   │
│  │  - No wildcard permissions                                      │   │
│  │  - Resource-specific access                                     │   │
│  │  - Time-based access (temporary credentials)                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA ENCRYPTION                                  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Encryption at Rest (AWS KMS):                                  │   │
│  │  - S3: AES-256 encryption                                       │   │
│  │  - RDS: Encrypted storage volumes                               │   │
│  │  - EBS: Encrypted Lambda storage                                │   │
│  │  - OpenSearch: Encrypted indices                                │   │
│  │  - Secrets Manager: Encrypted credentials                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Encryption in Transit:                                          │   │
│  │  - TLS 1.3 for all API calls                                    │   │
│  │  - HTTPS only (no HTTP)                                         │   │
│  │  - Certificate management with ACM                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         MONITORING & AUDIT                               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  AWS CloudTrail:                                                 │   │
│  │  - Log all API calls                                             │   │
│  │  - Track user actions                                            │   │
│  │  - Compliance auditing                                           │   │
│  │  - Retention: 90 days (hot), 7 years (cold)                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Amazon CloudWatch:                                              │   │
│  │  - Real-time monitoring                                          │   │
│  │  - Security alerts                                               │   │
│  │  - Anomaly detection                                             │   │
│  │  - Automated responses                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Cost Optimization Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COMPUTE OPTIMIZATION                             │
│                                                                          │
│  Lambda:                                                                 │
│  - Right-size memory (512MB-1GB)                                        │
│  - Optimize cold starts (Provisioned Concurrency for critical)          │
│  - Use ARM64 (Graviton2) for 20% cost savings                           │
│  - Implement caching to reduce invocations                              │
│                                                                          │
│  API Gateway:                                                            │
│  - Enable caching (TTL: 5 minutes)                                      │
│  - Use REST API (cheaper than HTTP API for this use case)               │
│  - Implement rate limiting to prevent abuse                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         STORAGE OPTIMIZATION                             │
│                                                                          │
│  S3:                                                                     │
│  - Use Intelligent-Tiering for automatic cost optimization              │
│  - Lifecycle policies: Move to Glacier after 90 days                    │
│  - Compress images before upload                                        │
│  - Delete old temporary files                                           │
│                                                                          │
│  RDS:                                                                    │
│  - Use Reserved Instances (40% savings)                                 │
│  - Right-size instance (start with t3.medium)                           │
│  - Enable automated backups (7-day retention)                           │
│  - Use read replicas only when needed                                   │
│                                                                          │
│  OpenSearch:                                                             │
│  - Use t3.small for development                                         │
│  - Scale to t3.medium for production                                    │
│  - Enable UltraWarm for cold data                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI SERVICE OPTIMIZATION                          │
│                                                                          │
│  Bedrock:                                                                │
│  - Use Claude 3 Haiku for simple queries (cheaper)                      │
│  - Use Claude 3 Sonnet for complex queries                              │
│  - Implement prompt caching                                             │
│  - Optimize token usage (concise prompts)                               │
│  - Set max_tokens limit                                                 │
│                                                                          │
│  Rekognition:                                                            │
│  - Batch processing when possible                                       │
│  - Use Custom Labels only when needed                                   │
│  - Cache results for similar images                                     │
│                                                                          │
│  Translate:                                                              │
│  - Cache translations                                                   │
│  - Batch translate when possible                                        │
│  - Use custom terminology for consistency                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**END OF ARCHITECTURE DIAGRAMS**

## Notes for PowerPoint Creation

1. **Use AWS Icons**: Download official AWS architecture icons from aws.amazon.com/architecture/icons
2. **Color Scheme**: Use AWS brand colors (orange #FF9900, dark blue #232F3E, white)
3. **Diagram Tools**: Use draw.io, Lucidchart, or PowerPoint SmartArt
4. **Animations**: Add step-by-step animations to show data flow
5. **Legends**: Include legends for icons and color coding
6. **Simplify**: Start with high-level, then drill down in backup slides
