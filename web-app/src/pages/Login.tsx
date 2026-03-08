import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import styles from './Login.module.css';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registration fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate fields
      if (!name.trim() || !location.trim() || !primaryCrop.trim()) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (mobile.length !== 10) {
        setError('Please enter a valid 10-digit mobile number');
        setLoading(false);
        return;
      }

      // Register without OTP verification
      await register(mobile, name, location, primaryCrop);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.sendOTP(mobile);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(mobile, otp);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Agrinext</h1>
          <p>Smart Farming Assistant</p>
        </div>

        <div className={styles.languageSelector}>
          <button onClick={() => i18n.changeLanguage('en')} className={i18n.language === 'en' ? styles.active : ''}>
            English
          </button>
          <button onClick={() => i18n.changeLanguage('hi')} className={i18n.language === 'hi' ? styles.active : ''}>
            हिंदी
          </button>
          <button onClick={() => i18n.changeLanguage('te')} className={i18n.language === 'te' ? styles.active : ''}>
            తెలుగు
          </button>
        </div>

        <div className={styles.modeSelector}>
          <button 
            onClick={() => setMode('register')} 
            className={mode === 'register' ? styles.active : ''}
          >
            Register
          </button>
          <button 
            onClick={() => setMode('login')} 
            className={mode === 'login' ? styles.active : ''}
          >
            Login
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or District"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Primary Crop</label>
              <input
                type="text"
                value={primaryCrop}
                onChange={(e) => setPrimaryCrop(e.target.value)}
                placeholder="e.g., Rice, Wheat, Cotton"
                required
              />
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        ) : step === 'mobile' ? (
          <form onSubmit={handleSendOTP} className={styles.form}>
            <div className={styles.formGroup}>
              <label>{t('mobileNumber')}</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
              />
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? t('loading') : t('sendOTP')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className={styles.form}>
            <div className={styles.formGroup}>
              <label>{t('enterOTP')}</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                maxLength={6}
                required
              />
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? t('loading') : t('verify')}
            </button>
            <button
              type="button"
              onClick={() => setStep('mobile')}
              className={styles.linkButton}
            >
              Change mobile number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
