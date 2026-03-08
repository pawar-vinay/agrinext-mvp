import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('dashboard'), icon: '🏠' },
    { path: '/disease-detection', label: t('diseaseDetection'), icon: '🔬' },
    { path: '/advisory', label: t('advisory'), icon: '💬' },
    { path: '/schemes', label: t('schemes'), icon: '📋' },
    { path: '/profile', label: t('profile'), icon: '👤' },
  ];

  return (
    <div className={styles.layout}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>Agrinext</h2>
        </div>
        <div className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <div className={styles.user}>
          <div className={styles.userInfo}>
            <strong>{user?.name || 'User'}</strong>
            <small>{user?.mobile_number}</small>
          </div>
          <button onClick={logout} className={styles.logoutBtn}>
            {t('logout')}
          </button>
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
