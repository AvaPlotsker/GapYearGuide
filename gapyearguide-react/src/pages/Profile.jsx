import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSchoolsAsync } from '../utils/data';
import { RecommendationEngine } from '../utils/recommendations';

export default function Profile() {
  const { user, logout, updateUser, favorites, viewedSchools } = useApp();
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [stats, setStats] = useState({ favorites: 0, viewed: 0, matches: 0 });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentSchool: '',
    location: '',
    graduationYear: '',
    schoolType: [],
    hashkafa: [],
    locationPreference: [],
    size: '',
    minBudget: '',
    maxBudget: '',
    programFocus: [],
    importantFeatures: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load schools from Firebase
    const loadSchools = async () => {
      const allSchools = await getSchoolsAsync();
      setSchools(allSchools);
    };
    loadSchools();

    // Initialize form data with user data
    const prefs = user.preferences || {};
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      currentSchool: user.currentSchool || '',
      location: user.location || '',
      graduationYear: user.graduationYear || '',
      schoolType: Array.isArray(user.schoolType) ? user.schoolType : (user.schoolType ? [user.schoolType] : []),
      hashkafa: Array.isArray(prefs.hashkafa) ? prefs.hashkafa : (prefs.hashkafa ? [prefs.hashkafa] : []),
      locationPreference: Array.isArray(prefs.location) ? prefs.location : (prefs.location ? [prefs.location] : []),
      size: prefs.size || '',
      minBudget: prefs.minBudget || '',
      maxBudget: prefs.maxBudget || '',
      programFocus: Array.isArray(prefs.programFocus) ? prefs.programFocus : (prefs.programFocus ? [prefs.programFocus] : []),
      importantFeatures: user.importantFeatures || []
    });
  }, [user]);

  useEffect(() => {
    if (schools.length > 0) {
      updateStats();
    }
  }, [schools, favorites, viewedSchools, user]);

  const updateStats = () => {
    if (!user || schools.length === 0) return;

    const prefs = user.preferences || {};
    const schoolTypes = Array.isArray(user.schoolType)
      ? user.schoolType
      : user.schoolType ? [user.schoolType] : ['seminary'];

    const hashkafas = Array.isArray(prefs.hashkafa)
      ? prefs.hashkafa
      : prefs.hashkafa ? [prefs.hashkafa] : ['modern-orthodox'];

    const locations = Array.isArray(prefs.location)
      ? prefs.location
      : prefs.location ? [prefs.location] : ['jerusalem'];

    const engine = new RecommendationEngine({
      type: schoolTypes,
      hashkafa: hashkafas,
      location: locations,
      size: prefs.size || 'medium',
      minBudget: prefs.minBudget || 20000,
      maxBudget: prefs.maxBudget || 25000,
      programFocus: Array.isArray(prefs.programFocus) && prefs.programFocus.length > 0
        ? prefs.programFocus
        : (prefs.programFocus ? [prefs.programFocus] : ['Academic & Spiritual Growth']),
      importantFeatures: user.importantFeatures || []
    });

    const recommendations = engine.getRecommendations(schools);

    setStats({
      favorites: favorites.length,
      viewed: viewedSchools.length,
      matches: recommendations.length
    });
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: newValue };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Update user data
    const updatedUser = {
      ...user,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      currentSchool: formData.currentSchool,
      location: formData.location,
      graduationYear: formData.graduationYear,
      schoolType: formData.schoolType,
      importantFeatures: formData.importantFeatures,
      preferences: {
        hashkafa: formData.hashkafa,
        location: formData.locationPreference,
        size: formData.size,
        minBudget: parseInt(formData.minBudget) || 0,
        maxBudget: parseInt(formData.maxBudget) || 0,
        programFocus: formData.programFocus
      }
    };

    updateUser(updatedUser);
    setEditMode(false);
    updateStats();
  };

  const handleCancel = () => {
    // Reset form data to current user data
    const prefs = user.preferences || {};
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      currentSchool: user.currentSchool || '',
      location: user.location || '',
      graduationYear: user.graduationYear || '',
      schoolType: Array.isArray(user.schoolType) ? user.schoolType : (user.schoolType ? [user.schoolType] : []),
      hashkafa: Array.isArray(prefs.hashkafa) ? prefs.hashkafa : (prefs.hashkafa ? [prefs.hashkafa] : []),
      locationPreference: Array.isArray(prefs.location) ? prefs.location : (prefs.location ? [prefs.location] : []),
      size: prefs.size || '',
      minBudget: prefs.minBudget || '',
      maxBudget: prefs.maxBudget || '',
      programFocus: Array.isArray(prefs.programFocus) ? prefs.programFocus : (prefs.programFocus ? [prefs.programFocus] : []),
      importantFeatures: user.importantFeatures || []
    });
    setEditMode(false);
  };

  const formatPreferenceValue = (value) => {
    if (!value) return 'Not specified';

    if (Array.isArray(value)) {
      return value.map(v => formatSingleValue(v)).join(', ');
    }

    return formatSingleValue(value);
  };

  const formatSingleValue = (value) => {
    if (typeof value === 'string') {
      return value.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return value;
  };

  if (!user) return null;

  const prefs = user.preferences || {};

  return (
    <main className="main-content">
      <div className="container">
        {/* Profile Header */}
        <section className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user.firstName} {user.lastName}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{stats.favorites}</span>
              <span className="stat-label">Favorites</span>
            </div>
            <div className="stat">
              <span className="stat-number">{stats.viewed}</span>
              <span className="stat-label">Viewed</span>
            </div>
            <div className="stat">
              <span className="stat-number">{stats.matches}</span>
              <span className="stat-label">Matches</span>
            </div>
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </section>

        {editMode ? (
          <form onSubmit={handleSave}>
            {/* Personal Information Section - Edit Mode */}
            <section className="profile-section">
              <div className="section-header">
                <h3>Personal Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="currentSchool">Current School</label>
                  <input
                    type="text"
                    id="currentSchool"
                    value={formData.currentSchool}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentSchool: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="graduationYear">Graduation Year</label>
                  <input
                    type="text"
                    id="graduationYear"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            {/* Preferences Section - Edit Mode */}
            <section className="profile-section">
              <div className="section-header">
                <h3>My Preferences</h3>
              </div>

              <div className="form-group">
                <label>Preferred Type</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="seminary"
                      checked={formData.schoolType.includes('seminary')}
                      onChange={(e) => handleCheckboxChange('schoolType', e.target.value)}
                    />
                    <span>Seminary</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="yeshiva"
                      checked={formData.schoolType.includes('yeshiva')}
                      onChange={(e) => handleCheckboxChange('schoolType', e.target.value)}
                    />
                    <span>Yeshiva</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="gap-year-program"
                      checked={formData.schoolType.includes('gap-year-program')}
                      onChange={(e) => handleCheckboxChange('schoolType', e.target.value)}
                    />
                    <span>Gap Year Program</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Hashkafa</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="modern-orthodox"
                      checked={formData.hashkafa.includes('modern-orthodox')}
                      onChange={(e) => handleCheckboxChange('hashkafa', e.target.value)}
                    />
                    <span>Modern Orthodox</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="yeshivish"
                      checked={formData.hashkafa.includes('yeshivish')}
                      onChange={(e) => handleCheckboxChange('hashkafa', e.target.value)}
                    />
                    <span>Yeshivish</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="chassidish"
                      checked={formData.hashkafa.includes('chassidish')}
                      onChange={(e) => handleCheckboxChange('hashkafa', e.target.value)}
                    />
                    <span>Chassidish</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="mixed"
                      checked={formData.hashkafa.includes('mixed')}
                      onChange={(e) => handleCheckboxChange('hashkafa', e.target.value)}
                    />
                    <span>Mixed</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Location Preference</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="jerusalem"
                      checked={formData.locationPreference.includes('jerusalem')}
                      onChange={(e) => handleCheckboxChange('locationPreference', e.target.value)}
                    />
                    <span>Jerusalem</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="ramat-beit-shemesh"
                      checked={formData.locationPreference.includes('ramat-beit-shemesh')}
                      onChange={(e) => handleCheckboxChange('locationPreference', e.target.value)}
                    />
                    <span>Ramat Beit Shemesh</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="bnei-brak"
                      checked={formData.locationPreference.includes('bnei-brak')}
                      onChange={(e) => handleCheckboxChange('locationPreference', e.target.value)}
                    />
                    <span>Bnei Brak</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="safed"
                      checked={formData.locationPreference.includes('safed')}
                      onChange={(e) => handleCheckboxChange('locationPreference', e.target.value)}
                    />
                    <span>Safed</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="tel-aviv"
                      checked={formData.locationPreference.includes('tel-aviv')}
                      onChange={(e) => handleCheckboxChange('locationPreference', e.target.value)}
                    />
                    <span>Tel Aviv</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="size">School Size</label>
                <select
                  id="size"
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                >
                  <option value="">Select size...</option>
                  <option value="small">Small (&lt; 50)</option>
                  <option value="medium">Medium (50-150)</option>
                  <option value="large">Large (&gt; 150)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="minBudget">
                  Minimum Budget: ${formData.minBudget ? parseInt(formData.minBudget).toLocaleString() : '0'}
                </label>
                <input
                  type="range"
                  id="minBudget"
                  min="0"
                  max="50000"
                  step="1000"
                  value={formData.minBudget || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, minBudget: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxBudget">
                  Maximum Budget: ${formData.maxBudget ? parseInt(formData.maxBudget).toLocaleString() : '0'}
                </label>
                <input
                  type="range"
                  id="maxBudget"
                  min="0"
                  max="50000"
                  step="1000"
                  value={formData.maxBudget || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxBudget: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Program Focus (select all that apply)</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="Academic & Spiritual Growth"
                      checked={formData.programFocus.includes('Academic & Spiritual Growth')}
                      onChange={(e) => handleCheckboxChange('programFocus', e.target.value)}
                    />
                    <span>Academic & Spiritual Growth</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="Intensive Torah Study"
                      checked={formData.programFocus.includes('Intensive Torah Study')}
                      onChange={(e) => handleCheckboxChange('programFocus', e.target.value)}
                    />
                    <span>Intensive Torah Study</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="Personal Development"
                      checked={formData.programFocus.includes('Personal Development')}
                      onChange={(e) => handleCheckboxChange('programFocus', e.target.value)}
                    />
                    <span>Personal Development</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="Leadership & Community"
                      checked={formData.programFocus.includes('Leadership & Community')}
                      onChange={(e) => handleCheckboxChange('programFocus', e.target.value)}
                    />
                    <span>Leadership & Community</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="Israel Experience"
                      checked={formData.programFocus.includes('Israel Experience')}
                      onChange={(e) => handleCheckboxChange('programFocus', e.target.value)}
                    />
                    <span>Israel Experience</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Personal Information Section - View Mode */}
            <section className="profile-section">
              <div className="section-header">
                <h3>Personal Information</h3>
                <button className="btn btn-secondary btn-small" onClick={() => setEditMode(true)}>
                  Edit Profile
                </button>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">{user.firstName} {user.lastName}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{user.email}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Current School</div>
                  <div className="detail-value">{user.currentSchool || 'Not specified'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Location</div>
                  <div className="detail-value">{user.location || 'Not specified'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Graduation Year</div>
                  <div className="detail-value">{user.graduationYear || 'Not specified'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Password</div>
                  <div className="detail-value">••••••••</div>
                </div>
              </div>
            </section>

            {/* Preferences Section - View Mode */}
            <section className="profile-section">
              <div className="section-header">
                <h3>My Preferences</h3>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Preferred Type</div>
                  <div className="detail-value">
                    {formatPreferenceValue(user.schoolType)}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Hashkafa</div>
                  <div className="detail-value">
                    {formatPreferenceValue(prefs.hashkafa)}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Location Preference</div>
                  <div className="detail-value">
                    {formatPreferenceValue(prefs.location)}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">School Size</div>
                  <div className="detail-value">
                    {prefs.size ? `${prefs.size.charAt(0).toUpperCase() + prefs.size.slice(1)} (${
                      prefs.size === 'small' ? '< 50' :
                      prefs.size === 'medium' ? '50-150' : '> 150'
                    })` : 'Not specified'}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Budget Range</div>
                  <div className="detail-value">
                    {prefs.minBudget && prefs.maxBudget
                      ? `$${prefs.minBudget.toLocaleString()} - $${prefs.maxBudget.toLocaleString()}`
                      : 'Not specified'}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Program Focus</div>
                  <div className="detail-value">
                    {Array.isArray(prefs.programFocus) && prefs.programFocus.length > 0
                      ? prefs.programFocus.join(', ')
                      : prefs.programFocus || 'Not specified'}
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Links */}
            <section className="quick-links">
              <Link to="/favorites" className="quick-link-card">
                <div className="quick-link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <h4>My Favorites</h4>
                <p>{stats.favorites} schools saved</p>
              </Link>
              <Link to="/recommendations" className="quick-link-card">
                <div className="quick-link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <h4>Recommendations</h4>
                <p>{stats.matches} schools match your preferences</p>
              </Link>
              <Link to="/browse" className="quick-link-card">
                <div className="quick-link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h4>Browse Schools</h4>
                <p>Explore all programs</p>
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
