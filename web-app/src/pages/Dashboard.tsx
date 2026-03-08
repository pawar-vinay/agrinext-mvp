import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const quickActions = [
    {
      title: t('detectDisease'),
      description: 'Upload crop images for AI-powered disease detection',
      icon: '🔬',
      link: '/disease-detection',
      color: '#3498db'
    },
    {
      title: t('askQuestion'),
      description: 'Get expert farming advice powered by AI',
      icon: '💬',
      link: '/advisory',
      color: '#2ecc71'
    },
    {
      title: t('browseSchemes'),
      description: 'Explore government schemes and benefits',
      icon: '📋',
      link: '/schemes',
      color: '#e74c3c'
    }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>{t('welcome')}, {user?.name}!</h1>
        <p>Manage your farm with AI-powered insights</p>
      </div>

      <div className={styles.quickAccess}>
        <h2>{t('quickAccess')}</h2>
        <div className={styles.grid}>
          {quickActions.map((action) => (
            <Link
              key={action.link}
              to={action.link}
              className={styles.card}
              style={{ borderTopColor: action.color }}
            >
              <div className={styles.cardIcon}>{action.icon}</div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🌾</div>
          <div>
            <div className={styles.statValue}>{user?.primary_crop || 'Not set'}</div>
            <div className={styles.statLabel}>Primary Crop</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📍</div>
          <div>
            <div className={styles.statValue}>{user?.location || 'Not set'}</div>
            <div className={styles.statLabel}>Location</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🌐</div>
          <div>
            <div className={styles.statValue}>{user?.language?.toUpperCase() || 'EN'}</div>
            <div className={styles.statLabel}>Language</div>
          </div>
        </div>
      </div>
    </div>
  );
}
