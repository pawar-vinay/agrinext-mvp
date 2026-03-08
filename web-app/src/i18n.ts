import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Auth
      login: 'Login',
      mobileNumber: 'Mobile Number',
      sendOTP: 'Send OTP',
      enterOTP: 'Enter OTP',
      verify: 'Verify',
      logout: 'Logout',
      
      // Navigation
      dashboard: 'Dashboard',
      diseaseDetection: 'Disease Detection',
      advisory: 'Farming Advisory',
      schemes: 'Government Schemes',
      profile: 'Profile',
      
      // Dashboard
      welcome: 'Welcome',
      quickAccess: 'Quick Access',
      detectDisease: 'Detect Disease',
      askQuestion: 'Ask Question',
      browseSchemes: 'Browse Schemes',
      
      // Disease Detection
      uploadImage: 'Upload Crop Image',
      takePhoto: 'Take Photo',
      analyzing: 'Analyzing...',
      results: 'Results',
      diseaseName: 'Disease',
      confidence: 'Confidence',
      recommendations: 'Recommendations',
      history: 'History',
      
      // Advisory
      askFarmingQuestion: 'Ask a Farming Question',
      yourQuestion: 'Your Question',
      submit: 'Submit',
      response: 'Response',
      advisoryHistory: 'Advisory History',
      
      // Schemes
      governmentSchemes: 'Government Schemes',
      eligibility: 'Eligibility',
      benefits: 'Benefits',
      howToApply: 'How to Apply',
      
      // Profile
      name: 'Name',
      location: 'Location',
      primaryCrop: 'Primary Crop',
      language: 'Language',
      updateProfile: 'Update Profile',
      
      // Common
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
    }
  },
  hi: {
    translation: {
      // Auth
      login: 'लॉगिन',
      mobileNumber: 'मोबाइल नंबर',
      sendOTP: 'OTP भेजें',
      enterOTP: 'OTP दर्ज करें',
      verify: 'सत्यापित करें',
      logout: 'लॉगआउट',
      
      // Navigation
      dashboard: 'डैशबोर्ड',
      diseaseDetection: 'रोग पहचान',
      advisory: 'कृषि सलाह',
      schemes: 'सरकारी योजनाएं',
      profile: 'प्रोफ़ाइल',
      
      // Dashboard
      welcome: 'स्वागत है',
      quickAccess: 'त्वरित पहुंच',
      detectDisease: 'रोग पहचानें',
      askQuestion: 'प्रश्न पूछें',
      browseSchemes: 'योजनाएं देखें',
      
      // Disease Detection
      uploadImage: 'फसल की तस्वीर अपलोड करें',
      takePhoto: 'फोटो लें',
      analyzing: 'विश्लेषण हो रहा है...',
      results: 'परिणाम',
      diseaseName: 'रोग',
      confidence: 'विश्वास',
      recommendations: 'सिफारिशें',
      history: 'इतिहास',
      
      // Advisory
      askFarmingQuestion: 'कृषि प्रश्न पूछें',
      yourQuestion: 'आपका प्रश्न',
      submit: 'जमा करें',
      response: 'उत्तर',
      advisoryHistory: 'सलाह इतिहास',
      
      // Schemes
      governmentSchemes: 'सरकारी योजनाएं',
      eligibility: 'पात्रता',
      benefits: 'लाभ',
      howToApply: 'आवेदन कैसे करें',
      
      // Profile
      name: 'नाम',
      location: 'स्थान',
      primaryCrop: 'मुख्य फसल',
      language: 'भाषा',
      updateProfile: 'प्रोफ़ाइल अपडेट करें',
      
      // Common
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      cancel: 'रद्द करें',
      save: 'सहेजें',
    }
  },
  te: {
    translation: {
      // Auth
      login: 'లాగిన్',
      mobileNumber: 'మొబైల్ నంబర్',
      sendOTP: 'OTP పంపండి',
      enterOTP: 'OTP నమోదు చేయండి',
      verify: 'ధృవీకరించండి',
      logout: 'లాగౌట్',
      
      // Navigation
      dashboard: 'డాష్‌బోర్డ్',
      diseaseDetection: 'వ్యాధి గుర్తింపు',
      advisory: 'వ్యవసాయ సలహా',
      schemes: 'ప్రభుత్వ పథకాలు',
      profile: 'ప్రొఫైల్',
      
      // Dashboard
      welcome: 'స్వాగతం',
      quickAccess: 'త్వరిత ప్రాప్యత',
      detectDisease: 'వ్యాధిని గుర్తించండి',
      askQuestion: 'ప్రశ్న అడగండి',
      browseSchemes: 'పథకాలను చూడండి',
      
      // Disease Detection
      uploadImage: 'పంట చిత్రాన్ని అప్‌లోడ్ చేయండి',
      takePhoto: 'ఫోటో తీయండి',
      analyzing: 'విశ్లేషిస్తోంది...',
      results: 'ఫలితాలు',
      diseaseName: 'వ్యాధి',
      confidence: 'విశ్వాసం',
      recommendations: 'సిఫార్సులు',
      history: 'చరిత్ర',
      
      // Advisory
      askFarmingQuestion: 'వ్యవసాయ ప్రశ్న అడగండి',
      yourQuestion: 'మీ ప్రశ్న',
      submit: 'సమర్పించండి',
      response: 'ప్రతిస్పందన',
      advisoryHistory: 'సలహా చరిత్ర',
      
      // Schemes
      governmentSchemes: 'ప్రభుత్వ పథకాలు',
      eligibility: 'అర్హత',
      benefits: 'ప్రయోజనాలు',
      howToApply: 'ఎలా దరఖాస్తు చేయాలి',
      
      // Profile
      name: 'పేరు',
      location: 'స్థానం',
      primaryCrop: 'ప్రధాన పంట',
      language: 'భాష',
      updateProfile: 'ప్రొఫైల్ నవీకరించండి',
      
      // Common
      loading: 'లోడ్ అవుతోంది...',
      error: 'లోపం',
      success: 'విజయం',
      cancel: 'రద్దు చేయండి',
      save: 'సేవ్ చేయండి',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
