import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSchoolsAsync, getSchoolById } from '../utils/data';
import { useApp } from '../context/AppContext';
import SchoolCard from '../components/SchoolCard';
import SchoolDetailModal from '../components/SchoolDetailModal';
import ComparisonModal from '../components/ComparisonModal';

export default function Favorites() {
  const { favorites } = useApp();
  const [favoriteSchools, setFavoriteSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [compareSchools, setCompareSchools] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      // Load schools from Firebase to populate cache
      await getSchoolsAsync();
      // Now get the favorited schools
      const schools = favorites.map(id => getSchoolById(id)).filter(Boolean);
      setFavoriteSchools(schools);
    };
    loadFavorites();
  }, [favorites]);

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

  return (
    <main className="main-content">
      <div className="container">
        {/* Page Header */}
        <section className="page-header">
          <h2 className="page-title">My Favorite Schools</h2>
          <p className="page-description">Schools you've bookmarked for further review</p>
        </section>

        {/* View Controls */}
        {favoriteSchools.length > 0 && (
          <section className="favorites-controls">
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
          </section>
        )}

        {/* Favorites Grid */}
        <section className="favorites-section">
          {favoriteSchools.length > 0 ? (
            <div id="favoritesGrid" className="schools-grid">
              {favoriteSchools.map(school => (
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
            <div id="emptyFavorites" className="empty-state">
              <h3>No favorites yet</h3>
              <p>Click the heart icon on any school card to add it to your favorites!</p>
              <Link to="/browse" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Browse Schools
              </Link>
            </div>
          )}
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
