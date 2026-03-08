import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { diseaseService } from '../services/api';
import styles from './DiseaseDetection.module.css';

interface DetectionResult {
  id: number;
  disease_name: string;
  confidence_score: number;
  severity: string;
  recommendations: string;
  image_url: string;
  created_at: string;
}

export default function DiseaseDetection() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const handleDetect = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await diseaseService.detect(formData);
      
      // Map backend response to frontend format
      const backendResult = response.data;
      const mappedResult: DetectionResult = {
        id: backendResult.id || Date.now(),
        disease_name: backendResult.diseaseName || backendResult.disease_name,
        confidence_score: backendResult.confidenceScore || backendResult.confidence_score,
        severity: backendResult.severity,
        recommendations: Array.isArray(backendResult.recommendations) 
          ? backendResult.recommendations.join(' ') 
          : backendResult.recommendations,
        image_url: backendResult.imageUrl || backendResult.image_url || preview,
        created_at: backendResult.detectedAt || backendResult.created_at || new Date().toISOString()
      };
      
      setResult(mappedResult);
    } catch (err: any) {
      console.error('Disease detection error:', err);
      setError(err.response?.data?.message || 'Detection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>{t('detectDisease')}</h1>
      <p className={styles.subtitle}>Upload a crop image for AI-powered disease detection</p>

      <div className={styles.uploadSection}>
        <div className={styles.uploadBox}>
          {preview ? (
            <img src={preview} alt="Preview" className={styles.preview} />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.icon}>📷</span>
              <p>Click to upload or drag and drop</p>
              <p className={styles.hint}>JPEG, PNG, HEIC (max 10MB)</p>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/heic"
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
        </div>

        {selectedFile && (
          <button
            onClick={handleDetect}
            disabled={loading}
            className={styles.detectButton}
          >
            {loading ? 'Analyzing...' : 'Detect Disease'}
          </button>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          <span>⚠️</span> {error}
        </div>
      )}

      {result && (
        <div className={styles.result}>
          <h2>Detection Results</h2>
          <div className={styles.resultGrid}>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Disease</div>
              <div className={styles.resultValue}>{result.disease_name}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Confidence</div>
              <div className={styles.resultValue}>{(result.confidence_score * 100).toFixed(1)}%</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Severity</div>
              <div className={styles.resultValue}>{result.severity}</div>
            </div>
          </div>
          <div className={styles.recommendations}>
            <h3>Treatment Recommendations</h3>
            <p>{result.recommendations}</p>
          </div>
        </div>
      )}
    </div>
  );
}
