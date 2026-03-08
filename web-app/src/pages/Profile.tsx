import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import styles from './Profile.module.css';

export default function Profile() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    primary_crop: user?.primary_crop || '',
    language: user?.language || 'en'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        location: user.location || '',
        primary_crop: user.primary_crop || '',
        language: user.language || 'en'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/users/profile', formData);
      i18n.changeLanguage(formData.language);
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Profile</h1>

      {error && (
        <div className={styles.error}>
          <span>⚠️</span> {error}
        </div>
      )}

      {success && (
        <div className={styles.success}>
          <span>✓</span> {success}
        </div>
      )}

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || '👤'}
          </div>
          <div>
            <h2>{user?.name}</h2>
            <p className={styles.mobile}>{user?.mobile_number}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!editing}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Primary Crop</label>
            <input
              type="text"
              value={formData.primary_crop}
              onChange={(e) => setFormData({ ...formData, primary_crop: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Language</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              disabled={!editing}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
          </div>

          <div className={styles.actions}>
            {editing ? (
              <>
                <button type="submit" disabled={loading} className={styles.saveButton}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={styles.editButton}
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
