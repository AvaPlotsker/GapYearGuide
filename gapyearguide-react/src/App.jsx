import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BrowseSchools from './pages/BrowseSchools';
import Favorites from './pages/Favorites';
import Recommendations from './pages/Recommendations';
import Reviews from './pages/Reviews';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import ImportSchools from './pages/ImportSchools';
import './styles.css';

function App() {
  const { user, loading } = useApp();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #e0e0e0',
            borderTop: '5px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/browse" element={user ? <BrowseSchools /> : <Navigate to="/login" />} />
          <Route path="/favorites" element={user ? <Favorites /> : <Navigate to="/login" />} />
          <Route
            path="/recommendations"
            element={user ? <Recommendations /> : <Navigate to="/login" />}
          />
          <Route path="/reviews" element={user ? <Reviews /> : <Navigate to="/login" />} />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={user ? <Navigate to="/browse" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/browse" /> : <Signup />} />
          <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" />} />
          <Route path="/import" element={user ? <ImportSchools /> : <Navigate to="/login" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
