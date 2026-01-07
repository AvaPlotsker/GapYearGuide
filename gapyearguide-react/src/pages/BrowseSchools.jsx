import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSchoolsAsync, getSchoolById } from '../utils/data';
import { useApp } from '../context/AppContext';
import { RecommendationEngine } from '../utils/recommendations';
import SchoolCard from '../components/SchoolCard';
import SchoolDetailModal from '../components/SchoolDetailModal';
import ComparisonModal from '../components/ComparisonModal';
import { reviewManager } from '../services/firebase';

export default function BrowseSchools() {
  const { user, updateReviewsCache } = useApp();
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [compareSchools, setCompareSchools] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [topRecommendations, setTopRecommendations] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [openDropdowns, setOpenDropdowns] = useState({
    location: false,
    hashkafa: false,
    academicLevel: false,
    size: false
  });
  const [filters, setFilters] = useState({
    types: [],
    hashkafas: [],
    locations: [],
    academicLevels: [],
    sizes: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadSchools = async () => {
      const allSchools = await getSchoolsAsync();
      setSchools(allSchools);
      loadAllReviews();
    };
    loadSchools();
  }, []);

  useEffect(() => {
    if (schools.length > 0 && user) {
      loadTopRecommendations();
    }
  }, [schools, user]);

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, schools]);

  // Auto-rotate recommendations carousel
  useEffect(() => {
    if (topRecommendations.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % topRecommendations.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [topRecommendations.length]);

  const loadAllReviews = async () => {
    const result = await reviewManager.getAllReviews();
    if (result.success) {
      const reviewsBySchool = {};
      result.reviews.forEach(review => {
        if (!reviewsBySchool[review.schoolId]) {
          reviewsBySchool[review.schoolId] = [];
        }
        reviewsBySchool[review.schoolId].push(review);
      });

      Object.keys(reviewsBySchool).forEach(schoolId => {
        updateReviewsCache(parseInt(schoolId), reviewsBySchool[schoolId]);
      });
    }
  };

  const loadTopRecommendations = () => {
    if (!user) return;

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
    const recommendations = engine.getRecommendations(schools, 3);
    setTopRecommendations(recommendations);
  };

  const applyFilters = () => {
    if (filters.types.length === 0) {
      setFilteredSchools([]);
      return;
    }

    let result = [...schools];
    result = result.filter(school => filters.types.includes(school.type));

    if (filters.hashkafas.length > 0) {
      result = result.filter(school => filters.hashkafas.includes(school.hashkafa));
    }

    if (filters.locations.length > 0) {
      result = result.filter(school => filters.locations.includes(school.location));
    }

    if (filters.academicLevels.length > 0) {
      result = result.filter(school => filters.academicLevels.includes(school.academicLevel));
    }

    if (filters.sizes.length > 0) {
      result = result.filter(school => filters.sizes.includes(school.size));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(school =>
        school.name.toLowerCase().includes(term) ||
        school.location.toLowerCase().includes(term) ||
        school.hashkafa.toLowerCase().includes(term) ||
        school.description.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredSchools(result);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const current = prev[filterType];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterType]: newValue };
    });
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      hashkafas: [],
      locations: [],
      academicLevels: [],
      sizes: []
    });
    setSearchTerm('');
    setFilteredSchools([]);
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
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

  const quickSelectCategory = (type) => {
    setFilters(prev => ({ ...prev, types: [type] }));
  };

  return (
    <main className="main-content">
      {/* Hero Section */}
      <section className="hero-modern">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="container">
          <div className="hero-content-wrapper">
            <h1>Find Your Perfect Gap Year in Israel</h1>
            <p>Discover seminaries, yeshivas, and programs that match your goals and values</p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{schools.length}+</div>
                <div className="stat-label">Programs</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">5K+</div>
                <div className="stat-label">Students Placed</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">Cities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Search and Filters */}
        <section className="search-section-modern">
          <div className="search-header">
            <h2>Search & Filter Programs</h2>
            <p>Refine your search by location, hashkafa, size, and more</p>
          </div>

          <div className="search-bar">
            <input
              type="text"
              id="searchInput"
              placeholder="Search by name, location, or description..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button id="searchBtn" className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>

          <div className="filters">
            <button
              id="filterToggle"
              className="btn btn-secondary"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
            </button>
            <div
              id="filterPanel"
              className={`filter-panel ${showFilterPanel ? '' : 'hidden'}`}
            >
              <div className="filter-groups-row">
                {/* Location Filter */}
                <div className="filter-group">
                  <div
                    className={`filter-dropdown-header ${openDropdowns.location ? 'open' : ''}`}
                    onClick={() => toggleDropdown('location')}
                  >
                    <label>Location</label>
                    <span className="filter-dropdown-arrow">▼</span>
                  </div>
                  <div className={`filter-dropdown-content ${openDropdowns.location ? 'open' : ''}`}>
                    <div className="checkbox-group">
                      {['jerusalem', 'ramat-beit-shemesh', 'bnei-brak', 'safed', 'tel-aviv'].map(location => (
                        <label key={location} className="checkbox-label">
                          <input
                            type="checkbox"
                            name="locationFilter"
                            value={location}
                            checked={filters.locations.includes(location)}
                            onChange={(e) => handleFilterChange('locations', e.target.value)}
                          />
                          <span>{location.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hashkafa Filter */}
                <div className="filter-group">
                  <div
                    className={`filter-dropdown-header ${openDropdowns.hashkafa ? 'open' : ''}`}
                    onClick={() => toggleDropdown('hashkafa')}
                  >
                    <label>Hashkafa</label>
                    <span className="filter-dropdown-arrow">▼</span>
                  </div>
                  <div className={`filter-dropdown-content ${openDropdowns.hashkafa ? 'open' : ''}`}>
                    <div className="checkbox-group">
                      {['modern-orthodox', 'yeshivish', 'chassidish', 'mixed'].map(hashkafa => (
                        <label key={hashkafa} className="checkbox-label">
                          <input
                            type="checkbox"
                            name="hashkafaFilter"
                            value={hashkafa}
                            checked={filters.hashkafas.includes(hashkafa)}
                            onChange={(e) => handleFilterChange('hashkafas', e.target.value)}
                          />
                          <span>{hashkafa.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Academic Level Filter */}
                <div className="filter-group">
                  <div
                    className={`filter-dropdown-header ${openDropdowns.academicLevel ? 'open' : ''}`}
                    onClick={() => toggleDropdown('academicLevel')}
                  >
                    <label>Academic Level</label>
                    <span className="filter-dropdown-arrow">▼</span>
                  </div>
                  <div className={`filter-dropdown-content ${openDropdowns.academicLevel ? 'open' : ''}`}>
                    <div className="checkbox-group">
                      {['beginner', 'intermediate', 'advanced', 'mixed'].map(level => (
                        <label key={level} className="checkbox-label">
                          <input
                            type="checkbox"
                            name="academicLevelFilter"
                            value={level}
                            checked={filters.academicLevels.includes(level)}
                            onChange={(e) => handleFilterChange('academicLevels', e.target.value)}
                          />
                          <span>{level === 'mixed' ? 'Mixed Levels' : level.charAt(0).toUpperCase() + level.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Size Filter */}
                <div className="filter-group">
                  <div
                    className={`filter-dropdown-header ${openDropdowns.size ? 'open' : ''}`}
                    onClick={() => toggleDropdown('size')}
                  >
                    <label>Size</label>
                    <span className="filter-dropdown-arrow">▼</span>
                  </div>
                  <div className={`filter-dropdown-content ${openDropdowns.size ? 'open' : ''}`}>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="sizeFilter"
                          value="small"
                          checked={filters.sizes.includes('small')}
                          onChange={(e) => handleFilterChange('sizes', e.target.value)}
                        />
                        <span>Small (&lt; 50)</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="sizeFilter"
                          value="medium"
                          checked={filters.sizes.includes('medium')}
                          onChange={(e) => handleFilterChange('sizes', e.target.value)}
                        />
                        <span>Medium (50-150)</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="sizeFilter"
                          value="large"
                          checked={filters.sizes.includes('large')}
                          onChange={(e) => handleFilterChange('sizes', e.target.value)}
                        />
                        <span>Large (&gt; 150)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="filter-actions">
                <button id="applyFilters" className="btn btn-primary" onClick={applyFilters}>
                  Apply Filters
                </button>
                <button id="clearFilters" className="btn btn-secondary" onClick={clearFilters}>
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="view-controls">
            <button
              id="compareBtn"
              className="btn btn-accent"
              disabled={compareSchools.length < 2}
              onClick={() => setShowComparisonModal(true)}
            >
              Compare Selected ({compareSchools.length})
            </button>
            <button id="clearCompareBtn" className="btn btn-secondary" onClick={clearCompareSelection}>
              Clear Selection
            </button>
          </div>
        </section>

        {/* Category Quick Select */}
        <section className="category-section" style={{ marginTop: 'var(--space-5)' }}>
          <h2 className="section-title">Browse by Type</h2>
          <div className="category-grid">
            <div className="category-card" onClick={() => quickSelectCategory('seminary')}>
              <div className="category-image seminary-img">
                <div className="category-overlay"></div>
              </div>
              <div className="category-content">
                <h3>Seminaries</h3>
                <p>Torah study programs for young women</p>
                <span className="category-arrow">→</span>
              </div>
            </div>
            <div className="category-card" onClick={() => quickSelectCategory('yeshiva')}>
              <div className="category-image yeshiva-img">
                <div className="category-overlay"></div>
              </div>
              <div className="category-content">
                <h3>Yeshivas</h3>
                <p>Torah learning programs for young men</p>
                <span className="category-arrow">→</span>
              </div>
            </div>
            <div className="category-card" onClick={() => quickSelectCategory('gap-year-program')}>
              <div className="category-image program-img">
                <div className="category-overlay"></div>
              </div>
              <div className="category-content">
                <h3>Gap Year Programs</h3>
                <p>Comprehensive Israel experiences</p>
                <span className="category-arrow">→</span>
              </div>
            </div>
          </div>
        </section>

        {/* Schools Grid */}
        <section className="schools-section">
          <div id="schoolsGrid" className="schools-grid">
            {filteredSchools.map(school => (
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
          {filteredSchools.length === 0 && filters.types.length > 0 && (
            <div className="empty-state">
              <h3>No schools found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          )}
          {filteredSchools.length === 0 && filters.types.length === 0 && (
            <div className="empty-state">
              <h3>Select a program type to begin</h3>
              <p>Choose Seminary, Yeshiva, or Gap Year Program above to see schools.</p>
            </div>
          )}
        </section>

        {/* Recommendations Section */}
        {user && topRecommendations.length > 0 && (
          <section className="featured-section recommendations-carousel" style={{ marginTop: 'var(--space-6)' }}>
            <div className="section-header-flex">
              <div>
                <h2 className="section-title">You Might Also Like</h2>
                <p className="section-subtitle">Based on your preferences</p>
              </div>
              <div className="carousel-controls">
                <button
                  className="carousel-btn"
                  onClick={() => setCurrentFeaturedIndex((prev) =>
                    prev === 0 ? topRecommendations.length - 1 : prev - 1
                  )}
                >
                  ←
                </button>
                <button
                  className="carousel-btn"
                  onClick={() => setCurrentFeaturedIndex((prev) =>
                    (prev + 1) % topRecommendations.length
                  )}
                >
                  →
                </button>
              </div>
            </div>

            <div className="featured-carousel">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentFeaturedIndex * 100}%)` }}
              >
                {topRecommendations.map((school) => (
                  <div key={school.id} className="featured-card" onClick={() => handleViewDetails(school.id)}>
                    <div className="featured-image">
                      <div className="featured-badge">{school.matchPercentage}% Match</div>
                    </div>
                    <div className="featured-content">
                      <h3>{school.name}</h3>
                      <p className="featured-location">{school.location.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                      <p className="featured-description">{school.description?.substring(0, 150)}...</p>
                      <div className="featured-footer">
                        <span className="featured-cost">${school.cost?.toLocaleString()}/year</span>
                        <span className="featured-cta">View Details →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="carousel-dots">
              {topRecommendations.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentFeaturedIndex ? 'active' : ''}`}
                  onClick={() => setCurrentFeaturedIndex(index)}
                ></button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
              <Link to="/recommendations" className="btn btn-secondary">
                View All Recommendations
              </Link>
            </div>
          </section>
        )}
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
