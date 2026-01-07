import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userManager } from '../services/firebase';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolType: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.schoolType.length === 0) {
      setError('Please select at least one school type');
      return;
    }

    setLoading(true);

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      schoolType: formData.schoolType,
      preferences: {
        hashkafa: ['modern-orthodox'],
        location: ['jerusalem'],
        size: 'medium',
        minBudget: 20000,
        maxBudget: 25000,
        programFocus: 'Academic & Spiritual Growth'
      },
      importantFeatures: []
    };

    const result = await userManager.signUp(formData.email, formData.password, userData);

    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.error || 'Failed to create account. Please try again.');
    }

    setLoading(false);
  };

  const handleSchoolTypeChange = (type) => {
    setFormData(prev => {
      const types = prev.schoolType.includes(type)
        ? prev.schoolType.filter(t => t !== type)
        : [...prev.schoolType, type];
      return { ...prev, schoolType: types };
    });
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-subtitle">Find your gap year program</p>
            </div>

            {error && (
              <div style={{
                padding: '1rem',
                marginBottom: '1.5rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 'var(--radius-sm)',
                color: '#991B1B',
                fontSize: '0.9375rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Sarah"
                    className="form-input"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Goldberg"
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="At least 6 characters"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter your password"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>I'm looking for a...</label>
                <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.schoolType.includes('seminary')}
                      onChange={() => handleSchoolTypeChange('seminary')}
                      disabled={loading}
                    />
                    <span>Seminary</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.schoolType.includes('yeshiva')}
                      onChange={() => handleSchoolTypeChange('yeshiva')}
                      disabled={loading}
                    />
                    <span>Yeshiva</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.schoolType.includes('gap-year-program')}
                      onChange={() => handleSchoolTypeChange('gap-year-program')}
                      disabled={loading}
                    />
                    <span>Gap Year Program</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  marginTop: '0.5rem'
                }}>
                  <label className="checkbox-label" style={{ margin: 0 }}>
                    <input type="checkbox" id="agreeTerms" required disabled={loading} />
                    <span style={{ fontWeight: '500' }}>I agree to the Terms of Service and Privacy Policy</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-link">
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
