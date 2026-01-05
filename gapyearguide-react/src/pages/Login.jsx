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
            <h2>Welcome Back!</h2>
            <p className="auth-subtitle">Sign in to access your personalized recommendations</p>

            {error && (
              <div style={{
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                color: '#c33'
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
                  placeholder="Enter your password"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" id="rememberMe" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="link">Forgot password?</a>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="form-divider">
                <span>or</span>
              </div>

              <button type="button" className="btn btn-google" disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.258c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                  <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account yet? <Link to="/signup" className="link">Create one here</Link></p>
            </div>
          </div>

          <div className="auth-benefits">
            <h3>Why Join GapYearGuide?</h3>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">✨</span>
                <div>
                  <strong>Personalized Recommendations</strong>
                  <p>Get matched with schools based on your preferences</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">❤️</span>
                <div>
                  <strong>Save Your Favorites</strong>
                  <p>Bookmark schools and compare them side-by-side</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">📊</span>
                <div>
                  <strong>Track Your Progress</strong>
                  <p>Keep all your research organized in one place</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">🗺️</span>
                <div>
                  <strong>Explore with Confidence</strong>
                  <p>Detailed info on location, costs, and amenities</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
