import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userManager } from '../services/firebase';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await userManager.signIn(formData.email, formData.password);

    if (result.success) {
      navigate('/browse');
    } else {
      // Provide more helpful error messages
      let errorMessage = result.error || 'Failed to sign in. Please check your credentials.';

      console.log('Login error:', result.error); // Debug log

      if (errorMessage.includes('invalid-credential') || errorMessage.includes('user-not-found') || errorMessage.includes('wrong-password')) {
        errorMessage = 'Invalid email or password. Make sure Email/Password authentication is enabled in Firebase Console, then create a new account.';
      } else if (errorMessage.includes('configuration-not-found')) {
        errorMessage = 'Firebase Email/Password authentication is not enabled. Please enable it in the Firebase Console first.';
      }

      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Sign in to continue</p>
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
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
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
                  placeholder="Enter password"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-link">
              <p>Need an account? <Link to="/signup">Sign up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
