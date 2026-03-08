# Agrinext MVP - Flow Diagrams

## 1. User Registration & Authentication Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> CheckAuth{User Logged In?}
    CheckAuth -->|Yes| Dashboard[Show Dashboard]
    CheckAuth -->|No| RegScreen[Registration Screen]
    
    RegScreen --> EnterMobile[Enter Mobile Number]
    EnterMobile --> SendOTP[Send OTP via SMS]
    SendOTP --> OTPSent{OTP Sent?}
    
    OTPSent -->|Success| EnterOTP[Enter OTP Code]
    OTPSent -->|Failed| ErrorMsg[Show Error Message]
    ErrorMsg --> EnterMobile
    
    EnterOTP --> VerifyOTP{Verify OTP}
    VerifyOTP -->|Invalid| OTPError[Show Error]
    OTPError --> EnterOTP
    VerifyOTP -->|Valid| NewUser{New User?}
    
    NewUser -->|Yes| ProfileForm[Fill Profile Form]
    ProfileForm --> EnterName[Enter Name]
    EnterName --> SelectLocation[Select State/District]
    SelectLocation --> SelectCrop[Select Primary Crop]
    SelectCrop --> SelectLanguage[Select Language<br/>English/Hindi/Telugu]
    SelectLanguage --> SaveProfile[Save Profile]
    
    NewUser -->|No| IssueToken[Issue JWT Token]
    SaveProfile --> IssueToken
    IssueToken --> Dashboard
    
    Dashboard --> End([User Authenticated])
    
    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style Dashboard fill:#fff4e1
    style ErrorMsg fill:#ffe1e1
    style OTPError fill:#ffe1e1
```

---

## 2. Disease Detection Flow

```mermaid
flowchart TD
    Start([User Selects Disease Detection]) --> ChooseSource{Choose Image Source}
    
    ChooseSource -->|Camera| OpenCamera[Open Camera]
    ChooseSource -->|Gallery| OpenGallery[Open Gallery]
    
    OpenCamera --> CaptureImage[Capture Crop Image]
    OpenGallery --> SelectImage[Select Image]
    
    CaptureImage --> ImagePreview[Show Image Preview]
    SelectImage --> ImagePreview
    
    ImagePreview --> ConfirmImage{Confirm Image?}
    ConfirmImage -->|No| ChooseSource
    ConfirmImage -->|Yes| ValidateQuality[Validate Image Quality]
    
    ValidateQuality --> QualityCheck{Quality OK?}
    QualityCheck -->|No| QualityError[Show Quality Error<br/>Request Better Image]
    QualityError --> ChooseSource
    
    QualityCheck -->|Yes| ShowLoading[Show Loading Indicator]
    ShowLoading --> UploadImage[Upload to Cloud Storage]
    UploadImage --> CallAPI[Call Disease Detection API]
    
    CallAPI --> Processing[AI Model Processing<br/>Cloud-based Inference]
    Processing --> APIResponse{Response Received?}
    
    APIResponse -->|Timeout/Error| ErrorScreen[Show Error Message<br/>Retry Option]
    ErrorScreen --> RetryOption{Retry?}
    RetryOption -->|Yes| CallAPI
    RetryOption -->|No| End
    
    APIResponse -->|Success| ParseResults[Parse Detection Results]
    ParseResults --> CheckConfidence{Confidence >= 70%?}
    
    CheckConfidence -->|No| LowConfidence[Show Low Confidence Warning<br/>Suggest Manual Review]
    CheckConfidence -->|Yes| DisplayResults[Display Results Screen]
    
    LowConfidence --> DisplayResults
    
    DisplayResults --> ShowDisease[Show Disease Name]
    ShowDisease --> ShowSeverity[Show Severity Level<br/>Low/Medium/High/Critical]
    ShowSeverity --> ShowTreatment[Show Treatment Recommendations]
    ShowTreatment --> TranslateContent[Translate to User's Language]
    TranslateContent --> SaveHistory[Save to Detection History]
    
    SaveHistory --> UserActions{User Action}
    UserActions -->|View History| HistoryScreen[Show Detection History]
    UserActions -->|New Detection| ChooseSource
    UserActions -->|Exit| End([End])
    
    HistoryScreen --> End
    
    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style DisplayResults fill:#fff4e1
    style ErrorScreen fill:#ffe1e1
    style QualityError fill:#ffe1e1
    style LowConfidence fill:#fff9e1
```

---

## 3. Agronomy Advisory Flow

```mermaid
flowchart TD
    Start([User Selects Advisory]) --> AdvisoryHome[Advisory Home Screen]
    
    AdvisoryHome --> InputMethod{Choose Input Method}
    InputMethod -->|Text| TextInput[Type Question]
    InputMethod -->|View History| ShowHistory[Show Advisory History]
    
    TextInput --> EnterQuery[Enter Farming Query]
    EnterQuery --> SubmitQuery[Submit Query]
    
    SubmitQuery --> ShowLoading[Show Loading Indicator]
    ShowLoading --> GatherContext[Gather User Context]
    
    GatherContext --> GetProfile[Get User Profile<br/>Crop, Location, Language]
    GetProfile --> BuildPrompt[Build AI Prompt with Context]
    
    BuildPrompt --> CallLLM[Call LLM API<br/>OpenAI/Anthropic]
    CallLLM --> LLMProcessing[AI Processing<br/>Generate Response]
    
    LLMProcessing --> APIResponse{Response Received?}
    APIResponse -->|Error| ErrorScreen[Show Error Message]
    ErrorScreen --> RetryOption{Retry?}
    RetryOption -->|Yes| CallLLM
    RetryOption -->|No| End
    
    APIResponse -->|Success| TranslateResponse[Translate to User's Language]
    TranslateResponse --> DisplayAdvisory[Display Advisory Response]
    
    DisplayAdvisory --> ShowContent[Show Advisory Content]
    ShowContent --> ShowCategory[Show Category<br/>Irrigation/Fertilization/etc]
    ShowCategory --> SaveToHistory[Save to Advisory History]
    
    SaveToHistory --> RatingPrompt{Rate Advisory?}
    RatingPrompt -->|Yes| ShowRating[Show Rating Options<br/>Helpful/Not Helpful]
    RatingPrompt -->|No| UserActions
    
    ShowRating --> SaveRating[Save Rating]
    SaveRating --> UserActions{User Action}
    
    ShowHistory --> DisplayHistory[Display Last 30 Advisories]
    DisplayHistory --> SelectAdvisory{Select Advisory?}
    SelectAdvisory -->|Yes| ViewDetails[View Advisory Details]
    SelectAdvisory -->|No| UserActions
    
    ViewDetails --> UserActions
    
    UserActions -->|New Query| TextInput
    UserActions -->|View History| ShowHistory
    UserActions -->|Exit| End([End])
    
    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style DisplayAdvisory fill:#fff4e1
    style ErrorScreen fill:#ffe1e1
```

---

## 4. Government Schemes Flow

```mermaid
flowchart TD
    Start([User Selects Schemes]) --> SchemeHome[Government Schemes Home]
    
    SchemeHome --> ViewOptions{Choose View}
    ViewOptions -->|Browse All| ShowCategories[Show Scheme Categories]
    ViewOptions -->|Search| SearchSchemes[Search Schemes]
    ViewOptions -->|My Applications| ViewApplications[View Application History]
    
    ShowCategories --> CategoryList[Display Categories<br/>Insurance/Subsidies/Loans/etc]
    CategoryList --> SelectCategory[Select Category]
    
    SearchSchemes --> EnterSearch[Enter Search Terms]
    EnterSearch --> FilterSchemes[Filter by State/Crop]
    
    SelectCategory --> LoadSchemes[Load Schemes from Database]
    FilterSchemes --> LoadSchemes
    
    LoadSchemes --> ApplyFilters[Apply Eligibility Filters<br/>State + Crop]
    ApplyFilters --> TranslateSchemes[Translate to User's Language<br/>English/Hindi/Telugu]
    TranslateSchemes --> DisplayList[Display Scheme List]
    
    DisplayList --> SelectScheme{Select Scheme?}
    SelectScheme -->|No| ViewOptions
    SelectScheme -->|Yes| LoadDetails[Load Scheme Details]
    
    LoadDetails --> ShowDetails[Show Scheme Information]
    ShowDetails --> ShowName[Display Scheme Name]
    ShowName --> ShowBenefits[Display Benefits]
    ShowBenefits --> ShowEligibility[Display Eligibility Criteria]
    ShowEligibility --> ShowDocuments[Display Required Documents]
    ShowDocuments --> ShowDeadline[Display Application Deadline]
    
    ShowDeadline --> CheckEligibility[Run Eligibility Checker]
    CheckEligibility --> EligibilityResult{User Eligible?}
    
    EligibilityResult -->|No| ShowIneligible[Show Ineligibility Reason]
    EligibilityResult -->|Yes| ShowEligible[Show Eligible Badge]
    
    ShowIneligible --> UserAction
    ShowEligible --> UserAction{User Action}
    
    UserAction -->|Apply| RedirectExternal[Redirect to External Portal<br/>Government Website]
    UserAction -->|Back| DisplayList
    UserAction -->|Exit| End
    
    RedirectExternal --> OpenBrowser[Open External Browser]
    OpenBrowser --> End([End])
    
    ViewApplications --> NoTracking[Show Message:<br/>Application Tracking<br/>Coming in v2.0]
    NoTracking --> End
    
    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style ShowDetails fill:#fff4e1
    style ShowIneligible fill:#ffe1e1
    style ShowEligible fill:#e1ffe1
```

---

## 5. Weather Information Flow

```mermaid
flowchart TD
    Start([User Selects Weather]) --> WeatherHome[Weather Home Screen]
    
    WeatherHome --> GetLocation[Get User Location<br/>from Profile]
    GetLocation --> CallWeatherAPI[Call Weather API<br/>OpenWeatherMap]
    
    CallWeatherAPI --> ShowLoading[Show Loading Indicator]
    ShowLoading --> APIResponse{Response Received?}
    
    APIResponse -->|Error| ErrorScreen[Show Error Message<br/>Check Internet Connection]
    ErrorScreen --> RetryOption{Retry?}
    RetryOption -->|Yes| CallWeatherAPI
    RetryOption -->|No| End
    
    APIResponse -->|Success| ParseWeather[Parse Weather Data]
    ParseWeather --> TranslateData[Translate to User's Language]
    
    TranslateData --> DisplayCurrent[Display Current Weather]
    DisplayCurrent --> ShowTemp[Show Temperature]
    ShowTemp --> ShowHumidity[Show Humidity]
    ShowHumidity --> ShowRainfall[Show Rainfall]
    ShowRainfall --> ShowConditions[Show Weather Conditions]
    
    ShowConditions --> DisplayForecast[Display 3-Day Forecast]
    DisplayForecast --> Day1[Day 1 Forecast]
    Day1 --> Day2[Day 2 Forecast]
    Day2 --> Day3[Day 3 Forecast]
    
    Day3 --> CheckAlerts{Severe Weather?}
    CheckAlerts -->|Yes| ShowAlert[Show Weather Alert<br/>Warning Banner]
    CheckAlerts -->|No| UserActions
    
    ShowAlert --> AlertDetails[Show Alert Details<br/>Recommendations]
    AlertDetails --> UserActions{User Action}
    
    UserActions -->|Refresh| CallWeatherAPI
    UserActions -->|Exit| End([End])
    
    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style DisplayCurrent fill:#fff4e1
    style ErrorScreen fill:#ffe1e1
    style ShowAlert fill:#ffe1e1
```

---

## 6. Overall MVP System Architecture Flow

```mermaid
flowchart TB
    subgraph "Mobile App - Android"
        UI[User Interface<br/>React Native/Flutter]
        LocalDB[Local Storage<br/>AsyncStorage]
        AuthModule[Authentication Module]
        AdvisoryModule[Advisory Module]
        DiseaseModule[Disease Detection Module]
        SchemeModule[Scheme Browser Module]
        WeatherModule[Weather Module]
    end
    
    subgraph "Backend - Single Server"
        API[API Gateway<br/>Node.js/Express]
        AuthService[Auth Service<br/>JWT + OTP]
        AdvisoryService[Advisory Service]
        DiseaseService[Disease Service]
        SchemeService[Scheme Service]
        WeatherService[Weather Service]
    end
    
    subgraph "Database"
        PostgreSQL[(PostgreSQL<br/>Single Database)]
    end
    
    subgraph "External Services"
        LLM[LLM API<br/>OpenAI/Anthropic]
        DiseaseAI[Disease Detection API<br/>Hugging Face/Roboflow]
        Translation[Translation API<br/>Google Translate]
        WeatherAPI[Weather API<br/>OpenWeatherMap]
        SMS[SMS Gateway<br/>Twilio]
        Storage[Image Storage<br/>S3/Cloudinary]
    end
    
    UI --> AuthModule
    UI --> AdvisoryModule
    UI --> DiseaseModule
    UI --> SchemeModule
    UI --> WeatherModule
    
    AuthModule --> LocalDB
    AdvisoryModule --> LocalDB
    DiseaseModule --> LocalDB
    
    AuthModule --> API
    AdvisoryModule --> API
    DiseaseModule --> API
    SchemeModule --> API
    WeatherModule --> API
    
    API --> AuthService
    API --> AdvisoryService
    API --> DiseaseService
    API --> SchemeService
    API --> WeatherService
    
    AuthService --> PostgreSQL
    AdvisoryService --> PostgreSQL
    DiseaseService --> PostgreSQL
    SchemeService --> PostgreSQL
    
    AuthService --> SMS
    AdvisoryService --> LLM
    AdvisoryService --> Translation
    DiseaseService --> DiseaseAI
    DiseaseService --> Storage
    DiseaseService --> Translation
    SchemeService --> Translation
    WeatherService --> WeatherAPI
    
    style UI fill:#e1f5e1
    style API fill:#fff4e1
    style PostgreSQL fill:#e1e5ff
    style LLM fill:#ffe1f5
    style DiseaseAI fill:#ffe1f5
```

---

## 7. MVP Development Phase Flow

```mermaid
gantt
    title Agrinext MVP Development Timeline (12 Weeks)
    dateFormat YYYY-MM-DD
    section Phase 1: Foundation
    Setup Environment           :p1, 2026-03-01, 3d
    Basic Android App          :p2, after p1, 4d
    Backend Server Setup       :p3, after p1, 4d
    OTP Authentication         :p4, after p2, 4d
    Profile Management         :p5, after p4, 3d
    
    section Phase 2: Disease Detection
    Integrate ML Model         :p6, after p5, 5d
    Image Upload               :p7, after p6, 3d
    Display Results            :p8, after p7, 3d
    Detection History          :p9, after p8, 3d
    
    section Phase 3: Advisory
    Integrate LLM API          :p10, after p9, 4d
    Query Interface            :p11, after p10, 3d
    Context-aware Responses    :p12, after p11, 4d
    Advisory History           :p13, after p12, 3d
    
    section Phase 4: Schemes & Weather
    Populate Scheme DB         :p14, after p13, 3d
    Scheme Browser             :p15, after p14, 4d
    Eligibility Checker        :p16, after p15, 3d
    Weather Integration        :p17, after p14, 4d
    
    section Phase 5: Polish
    UI/UX Improvements         :p18, after p16, 5d
    Bug Fixes                  :p19, after p18, 5d
    Performance Optimization   :p20, after p19, 4d
    
    section Phase 6: Launch
    Pilot Testing              :p21, after p20, 7d
    Feedback Collection        :p22, after p21, 7d
```

---

## 8. User Journey - Complete Flow

```mermaid
flowchart TD
    Start([Farmer Downloads App]) --> FirstOpen[First App Open]
    FirstOpen --> Register[Register with Mobile]
    Register --> VerifyOTP[Verify OTP]
    VerifyOTP --> CreateProfile[Create Profile]
    CreateProfile --> Dashboard[Main Dashboard]
    
    Dashboard --> ChooseFeature{Choose Feature}
    
    ChooseFeature -->|Disease Detection| TakePhoto[Take Crop Photo]
    TakePhoto --> GetDiagnosis[Get Disease Diagnosis]
    GetDiagnosis --> ViewTreatment[View Treatment]
    ViewTreatment --> Dashboard
    
    ChooseFeature -->|Ask Question| TypeQuery[Type Farming Question]
    TypeQuery --> GetAdvice[Get AI-Generated Advice]
    GetAdvice --> RateAdvice[Rate Advice]
    RateAdvice --> Dashboard
    
    ChooseFeature -->|Browse Schemes| ViewSchemes[View Government Schemes]
    ViewSchemes --> CheckEligibility[Check Eligibility]
    CheckEligibility --> ApplyExternal[Apply on Govt Portal]
    ApplyExternal --> Dashboard
    
    ChooseFeature -->|Check Weather| ViewWeather[View Weather Forecast]
    ViewWeather --> Dashboard
    
    ChooseFeature -->|Profile| ManageProfile[Manage Profile]
    ManageProfile --> Dashboard
    
    ChooseFeature -->|Logout| End([End Session])
    
    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style Dashboard fill:#fff4e1
    style GetDiagnosis fill:#ffe1f5
    style GetAdvice fill:#ffe1f5
```

---

## 9. Data Flow Diagram

```mermaid
flowchart LR
    subgraph "User Layer"
        Farmer[Farmer<br/>Mobile App]
    end
    
    subgraph "Application Layer"
        Auth[Authentication]
        Advisory[Advisory Service]
        Disease[Disease Detection]
        Schemes[Scheme Browser]
        Weather[Weather Service]
    end
    
    subgraph "Data Layer"
        UserDB[(User Data)]
        AdvisoryDB[(Advisory History)]
        DiseaseDB[(Detection History)]
        SchemeDB[(Scheme Data)]
    end
    
    subgraph "External Layer"
        AI[AI Services]
        Govt[Government APIs]
        WeatherExt[Weather APIs]
    end
    
    Farmer -->|Login/Register| Auth
    Farmer -->|Ask Question| Advisory
    Farmer -->|Upload Image| Disease
    Farmer -->|Browse| Schemes
    Farmer -->|Check| Weather
    
    Auth -->|Store/Retrieve| UserDB
    Advisory -->|Store/Retrieve| AdvisoryDB
    Advisory -->|Query| AI
    Disease -->|Store/Retrieve| DiseaseDB
    Disease -->|Analyze| AI
    Schemes -->|Read| SchemeDB
    Schemes -->|Fetch| Govt
    Weather -->|Fetch| WeatherExt
    
    style Farmer fill:#e1f5e1
    style AI fill:#ffe1f5
    style UserDB fill:#e1e5ff
    style AdvisoryDB fill:#e1e5ff
    style DiseaseDB fill:#e1e5ff
    style SchemeDB fill:#e1e5ff
```

---

## Summary

These flow diagrams cover:

1. **User Registration & Authentication** - Complete onboarding process
2. **Disease Detection** - Image capture to diagnosis flow
3. **Agronomy Advisory** - Query submission to response flow
4. **Government Schemes** - Browse, search, and eligibility checking
5. **Weather Information** - Weather data retrieval and display
6. **System Architecture** - Overall technical architecture
7. **Development Timeline** - 12-week Gantt chart
8. **User Journey** - Complete user experience flow
9. **Data Flow** - System data movement diagram

All diagrams are in Mermaid format and can be rendered in any Markdown viewer that supports Mermaid.
