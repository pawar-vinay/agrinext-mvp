import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Advisory.module.css';

interface Advisory {
  id: number;
  query_text: string;
  response_text: string;
  created_at: string;
  rating?: number;
}

export default function Advisory() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<Advisory | null>(null);
  const [history, setHistory] = useState<Advisory[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // DEMO MODE: Don't load history from backend
    // History is maintained in component state
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.length > 500) {
      setError('Query must be between 1 and 500 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // DEMO MODE: Use mock advisory responses for prototype
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate contextual response based on query keywords
      let responseText = '';
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('pest') || lowerQuery.includes('insect')) {
        responseText = 'For pest management, I recommend an integrated approach: 1) Use neem-based organic pesticides as a first line of defense. 2) Introduce beneficial insects like ladybugs. 3) Practice crop rotation to break pest cycles. 4) Monitor regularly and act early when you spot pests. 5) Maintain healthy soil to strengthen plant resistance.';
      } else if (lowerQuery.includes('fertilizer') || lowerQuery.includes('nutrient')) {
        responseText = 'For optimal fertilization: 1) Conduct a soil test to identify specific nutrient deficiencies. 2) Use balanced NPK fertilizer (10-10-10) for general crops. 3) Apply organic compost to improve soil structure. 4) Split fertilizer applications - apply 50% at planting and 50% during active growth. 5) Avoid over-fertilization which can harm plants and pollute water.';
      } else if (lowerQuery.includes('water') || lowerQuery.includes('irrigation')) {
        responseText = 'Efficient water management tips: 1) Water early morning or evening to reduce evaporation. 2) Use drip irrigation for 30-50% water savings. 3) Mulch around plants to retain moisture. 4) Check soil moisture before watering - insert finger 2 inches deep. 5) Collect rainwater for irrigation. Most crops need 1-2 inches of water per week.';
      } else if (lowerQuery.includes('disease') || lowerQuery.includes('fungus')) {
        responseText = 'Disease prevention and management: 1) Ensure good air circulation between plants. 2) Avoid overhead watering to keep leaves dry. 3) Remove infected plant parts immediately. 4) Use disease-resistant varieties when available. 5) Apply copper or sulfur-based fungicides preventively. 6) Practice crop rotation to reduce disease buildup in soil.';
      } else if (lowerQuery.includes('soil') || lowerQuery.includes('compost')) {
        responseText = 'Soil health improvement: 1) Add organic matter like compost or well-rotted manure annually. 2) Maintain soil pH between 6.0-7.0 for most crops. 3) Practice crop rotation to prevent nutrient depletion. 4) Use cover crops during off-season. 5) Avoid over-tilling which damages soil structure. 6) Test soil every 2-3 years.';
      } else if (lowerQuery.includes('yield') || lowerQuery.includes('production')) {
        responseText = 'To increase crop yield: 1) Select high-yielding, disease-resistant varieties. 2) Ensure optimal plant spacing for your crop. 3) Provide adequate nutrition through balanced fertilization. 4) Maintain consistent moisture levels. 5) Control pests and diseases promptly. 6) Harvest at the right time for maximum quality. 7) Keep detailed records to identify what works best.';
      } else {
        responseText = 'Thank you for your question. For best results in farming: 1) Monitor your crops regularly for any issues. 2) Maintain healthy soil through organic matter addition. 3) Ensure proper irrigation and drainage. 4) Use integrated pest management. 5) Keep records of your practices and results. 6) Consult with local agricultural extension services for region-specific advice. Would you like more specific guidance on any particular aspect?';
      }

      const mockResponse: Advisory = {
        id: Date.now(),
        query_text: query.trim(),
        response_text: responseText,
        created_at: new Date().toISOString()
      };

      setResponse(mockResponse);
      
      // Add to history
      setHistory(prev => [mockResponse, ...prev]);
      
      setQuery('');
    } catch (err: any) {
      setError('Failed to get advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>{t('askQuestion')}</h1>
      <p className={styles.subtitle}>Get expert farming advice powered by AI</p>

      <form onSubmit={handleSubmit} className={styles.queryForm}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask your farming question here..."
          className={styles.textarea}
          rows={4}
          maxLength={500}
        />
        <div className={styles.formFooter}>
          <span className={styles.charCount}>{query.length}/500</span>
          <button type="submit" disabled={loading || !query.trim()} className={styles.submitButton}>
            {loading ? 'Getting Advice...' : 'Ask Question'}
          </button>
        </div>
      </form>

      {error && (
        <div className={styles.error}>
          <span>⚠️</span> {error}
        </div>
      )}

      {response && (
        <div className={styles.response}>
          <div className={styles.responseHeader}>
            <h3>AI Response</h3>
            <span className={styles.timestamp}>
              {new Date(response.created_at).toLocaleString()}
            </span>
          </div>
          <div className={styles.question}>
            <strong>Your Question:</strong> {response.query_text}
          </div>
          <div className={styles.answer}>{response.response_text}</div>
        </div>
      )}

      {history.length > 0 && (
        <div className={styles.history}>
          <h2>Previous Questions</h2>
          <div className={styles.historyList}>
            {history.map((item) => (
              <div key={item.id} className={styles.historyItem}>
                <div className={styles.historyQuestion}>
                  <strong>Q:</strong> {item.query_text}
                </div>
                <div className={styles.historyAnswer}>
                  <strong>A:</strong> {item.response_text}
                </div>
                <div className={styles.historyFooter}>
                  <span className={styles.timestamp}>
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
