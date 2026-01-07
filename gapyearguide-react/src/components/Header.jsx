import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    // Handle both / and /browse for the Browse Schools link
    if (path === '/browse') {
      return (location.pathname === '/' || location.pathname === '/browse') ? 'nav-link active' : 'nav-link';
    }
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const isProfileActive = location.pathname === '/profile' ? 'active' : '';

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">GapYearGuide</Link>
          <nav className="main-nav">
            <Link to="/browse" className={isActive('/browse')}>Browse Schools</Link>
            <Link to="/favorites" className={isActive('/favorites')}>Favorites</Link>
            <Link to="/recommendations" className={isActive('/recommendations')}>Recommendations</Link>
            <Link to="/reviews" className={isActive('/reviews')}>Reviews</Link>
          </nav>
          <Link to="/profile" className={`profile-icon ${isProfileActive}`} title="My Profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
