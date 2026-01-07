import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSchoolsAsync, getSchoolById } from '../utils/data';
import { useApp } from '../context/AppContext';
import { RecommendationEngine } from '../utils/recommendations';
import SchoolCard from '../components/SchoolCard';
import SchoolDetailModal from '../components/SchoolDetailModal';
import ComparisonModal from '../components/ComparisonModal';

export default function Recommendations() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [compareSchools, setCompareSchools] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [sortBy, setSortBy] = useState('match');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
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

    const userPreferences = {
      type: schoolTypes,
      hashkafa: hashkafas,
      location: locations,
      size: prefs.size || 'medium',
      minBudget: prefs.minBudget || 20000,
      maxBudget: prefs.maxBudget || 25000,
      programFocus: prefs.programFocus || 'Academic & Spiritual Growth',
      importantFeatures: user.importantFeatures || []
    };

    const engine = new RecommendationEngine(userPreferences);
    const allSchools = await getSchoolsAsync();
    const matches = engine.getRecommendations(allSchools);

    setRecommendations(matches);
  };

  const handleSort = (value) => {
    setSortBy(value);
    let sorted = [...recommendations];

    switch (value) {
      case 'match':
        sorted.sort((a, b) => b.matchPercentage - a.matchPercentage);
        break;
      case 'rating':
        // Would need to implement rating sorting
        break;
      case 'cost':
        sorted.sort((a, b) => a.cost - b.cost);
        break;
    }

    setRecommendations(sorted);
  };

  const handleViewDetails = (schoolId) => {
    const school = getSchoolById(schoolId);
    setSelectedSchool(school);
  };

  const handleCompareToggle = (schoolId) => {
    setCompareSchools(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      } else {
        if (prev.length >= 4) {
          alert('You can only compare up to 4 schools at once.');
          return prev;
        }
        return [...prev, schoolId];
      }
    });
  };

  const clearCompareSelection = () => {
    setCompareSchools([]);
  };

  const getPreferencesText = () => {
    if (!user) return '';

    const prefs = user.preferences || {};
    const parts = [];

    if (prefs.hashkafa && prefs.hashkafa.length > 0) {
      const hashkafas = Array.isArray(prefs.hashkafa) ? prefs.hashkafa : [prefs.hashkafa];
      parts.push(hashkafas.map(h => h.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(' or '));
    }

    if (prefs.location && prefs.location.length > 0) {
      const locations = Array.isArray(prefs.location) ? prefs.location : [prefs.location];
      parts.push(locations.map(l => l.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(' or '));
    }

    if (prefs.size) {
      parts.push(`${prefs.size.charAt(0).toUpperCase() + prefs.size.slice(1)} size`);
    }

    if (prefs.minBudget && prefs.maxBudget) {
      parts.push(`$${(prefs.minBudget / 1000).toFixed(0)}-${(prefs.maxBudget / 1000).toFixed(0)}K budget`);
    }

    return parts.join(', ');
  };

  return (
    <main className="main-content">
      <div className="container">
        {/* Page Header */}
        <section className="page-header">
          <h2 className="page-title">Recommended For You</h2>
          <p className="page-description">Schools that match your preferences and interests</p>
        </section>

        {/* Match Info Banner */}
        <section className="match-info-banner">
          <div className="match-info-content">
            <div className="match-info-text">
              <h3>We found {recommendations.length} great {recommendations.length === 1 ? 'match' : 'matches'} for you</h3>
              <p>Based on your preferences: {getPreferencesText()}</p>
            </div>
            <Link to="/profile" className="btn btn-secondary">Update Preferences</Link>
          </div>
        </section>

        {/* View Controls */}
        <section className="recommendations-controls">
          <div className="view-controls">
            <button
              id="compareBtn"
              className="btn btn-accent"
              disabled={compareSchools.length < 2}
              onClick={() => setShowComparisonModal(true)}
            >
              Compare Selected (<span id="compareCount">{compareSchools.length}</span>)
            </button>
            <button
              id="clearCompareBtn"
              className="btn btn-secondary"
              onClick={clearCompareSelection}
            >
              Clear Selection
            </button>
          </div>
          <div className="sort-controls">
            <label htmlFor="sortRecommendations">Sort by:</label>
            <select
              id="sortRecommendations"
              className="filter-select"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="match">Best Match</option>
              <option value="rating">Highest Rated</option>
              <option value="cost">Lowest Cost</option>
            </select>
          </div>
        </section>

        {/* Recommendations Grid */}
        <section className="recommendations-section">
          {recommendations.length > 0 ? (
            <div id="recommendationsGrid" className="schools-grid">
              {recommendations.map(school => (
                <SchoolCard
                  key={school.id}
                  school={school}
                  onViewDetails={handleViewDetails}
                  showCompare={true}
                  onCompareToggle={handleCompareToggle}
                  isSelected={compareSchools.includes(school.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No recommendations yet</h3>
              <p>Update your preferences to get personalized recommendations.</p>
              <Link to="/profile" className="btn btn-primary" style={{ marginTop: '1rem' }}>Update Preferences</Link>
            </div>
          )}
        </section>

        {/* Browse All Section */}
        <section className="browse-all-section">
          <h3>Didn't find what you're looking for?</h3>
          <p>Browse all schools or update your preferences to get better recommendations.</p>
          <div className="browse-actions">
            <Link to="/browse" className="btn btn-primary">Browse All Schools</Link>
            <Link to="/profile" className="btn btn-secondary">Update Preferences</Link>
          </div>
        </section>
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <ComparisonModal
          schools={compareSchools.map(id => getSchoolById(id))}
          onClose={() => setShowComparisonModal(false)}
        />
      )}

      {/* School Detail Modal */}
      {selectedSchool && (
        <SchoolDetailModal
          school={selectedSchool}
          onClose={() => setSelectedSchool(null)}
        />
      )}
    </main>
  );
}
