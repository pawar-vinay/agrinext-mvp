import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Schemes.module.css';

interface Scheme {
  id: number;
  name: string;
  description: string;
  eligibility: string;
  benefits: string;
  application_process: string;
  category: string;
}

export default function Schemes() {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      // DEMO MODE: Use mock schemes data for prototype
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockSchemes: Scheme[] = [
        {
          id: 1,
          name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
          description: 'Direct income support of ₹6,000 per year to all farmer families in three equal installments.',
          eligibility: 'All landholding farmer families. Small and marginal farmers with combined land holding up to 2 hectares.',
          benefits: '₹6,000 per year paid in three installments of ₹2,000 each directly to bank accounts.',
          application_process: 'Apply online at pmkisan.gov.in or visit nearest Common Service Center (CSC) with land records and Aadhaar.',
          category: 'subsidy'
        },
        {
          id: 2,
          name: 'Kisan Credit Card (KCC)',
          description: 'Credit facility for farmers to meet short-term credit requirements for cultivation and other needs.',
          eligibility: 'All farmers - individual/joint borrowers who are owner cultivators. Tenant farmers, oral lessees, and sharecroppers.',
          benefits: 'Credit up to ₹3 lakh at 7% interest rate. Additional 3% interest subvention for prompt repayment.',
          application_process: 'Apply at any bank branch with land documents, identity proof, and address proof. Online application available on bank websites.',
          category: 'loan'
        },
        {
          id: 3,
          name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
          description: 'Crop insurance scheme providing financial support to farmers in case of crop failure.',
          eligibility: 'All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.',
          benefits: 'Coverage for pre-sowing to post-harvest losses. Premium: 2% for Kharif, 1.5% for Rabi crops.',
          application_process: 'Apply through banks, insurance companies, or online at pmfby.gov.in within cut-off dates.',
          category: 'insurance'
        },
        {
          id: 4,
          name: 'Soil Health Card Scheme',
          description: 'Provides soil health cards to farmers with information on nutrient status and recommendations.',
          eligibility: 'All farmers across India. Priority to small and marginal farmers.',
          benefits: 'Free soil testing and customized fertilizer recommendations. Helps reduce fertilizer costs by 10-15%.',
          application_process: 'Contact local agriculture department or Krishi Vigyan Kendra (KVK) for soil sample collection.',
          category: 'subsidy'
        },
        {
          id: 5,
          name: 'National Agriculture Market (e-NAM)',
          description: 'Online trading platform for agricultural commodities to ensure better price discovery.',
          eligibility: 'All farmers and traders. Registration required on e-NAM portal.',
          benefits: 'Access to nationwide market, transparent price discovery, online payment, and reduced transaction costs.',
          application_process: 'Register on enam.gov.in with mobile number, Aadhaar, and bank account details.',
          category: 'subsidy'
        },
        {
          id: 6,
          name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
          description: 'Promotes organic farming through cluster approach and certification.',
          eligibility: 'Farmers willing to adopt organic farming. Groups of 50 farmers forming clusters of 50 hectares.',
          benefits: '₹50,000 per hectare over 3 years for organic inputs, certification, and marketing support.',
          application_process: 'Apply through State Agriculture Department or register clusters with local agriculture office.',
          category: 'subsidy'
        },
        {
          id: 7,
          name: 'Agriculture Infrastructure Fund',
          description: 'Medium to long-term debt financing for investment in post-harvest management infrastructure.',
          eligibility: 'Farmers, FPOs, Agri-entrepreneurs, Startups, and Central/State agencies.',
          benefits: 'Loans up to ₹2 crore with 3% interest subvention. Credit guarantee coverage for loans up to ₹2 crore.',
          application_process: 'Apply through lending institutions (banks, NBFCs) with project report and required documents.',
          category: 'loan'
        },
        {
          id: 8,
          name: 'Rashtriya Krishi Vikas Yojana (RKVY)',
          description: 'State-level schemes for agricultural development with focus on increasing production.',
          eligibility: 'Varies by state and specific scheme component. Generally for all categories of farmers.',
          benefits: 'Subsidies for farm equipment, irrigation, seeds, and infrastructure. Benefits vary by state.',
          application_process: 'Contact State Agriculture Department or District Agriculture Office for specific schemes.',
          category: 'subsidy'
        },
        {
          id: 9,
          name: 'Kisan Vikas Patra (KVP)',
          description: 'Savings scheme that doubles investment in fixed period. Useful for long-term farm investments.',
          eligibility: 'Any adult individual, joint accounts, or on behalf of minors.',
          benefits: 'Investment doubles in approximately 115 months. Can be transferred and used as collateral.',
          application_process: 'Available at post offices. Apply with identity and address proof. Minimum investment ₹1,000.',
          category: 'loan'
        },
        {
          id: 10,
          name: 'Farmer Training Programs',
          description: 'Skill development and training programs on modern farming techniques and technologies.',
          eligibility: 'All farmers interested in learning new techniques. Priority to small and marginal farmers.',
          benefits: 'Free training on crop management, pest control, organic farming, and farm mechanization.',
          application_process: 'Contact nearest Krishi Vigyan Kendra (KVK) or Agriculture Training Center.',
          category: 'training'
        }
      ];

      setSchemes(mockSchemes);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesFilter = filter === 'all' || scheme.category === filter;
    const matchesSearch = search === '' || 
      scheme.name.toLowerCase().includes(search.toLowerCase()) ||
      scheme.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = ['all', 'subsidy', 'loan', 'insurance', 'training'];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading schemes...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>{t('browseSchemes')}</h1>
      <p className={styles.subtitle}>Explore government schemes and benefits</p>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search schemes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.categoryFilters}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`${styles.filterButton} ${filter === cat ? styles.active : ''}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.schemesList}>
        {filteredSchemes.length === 0 ? (
          <div className={styles.empty}>No schemes found</div>
        ) : (
          filteredSchemes.map((scheme) => (
            <div key={scheme.id} className={styles.schemeCard}>
              <div className={styles.schemeHeader}>
                <h3>{scheme.name}</h3>
                <span className={styles.category}>{scheme.category}</span>
              </div>
              <p className={styles.description}>{scheme.description}</p>
              <div className={styles.schemeDetails}>
                <div className={styles.detailSection}>
                  <h4>Eligibility</h4>
                  <p>{scheme.eligibility}</p>
                </div>
                <div className={styles.detailSection}>
                  <h4>Benefits</h4>
                  <p>{scheme.benefits}</p>
                </div>
                <div className={styles.detailSection}>
                  <h4>Application Process</h4>
                  <p>{scheme.application_process}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
