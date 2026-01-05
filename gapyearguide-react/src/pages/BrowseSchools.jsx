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
  const [filteredSchools, setFilteredSchools] = useState([]); // Start empty
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [compareSchools, setCompareSchools] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [topRecommendations, setTopRecommendations] = useState([]);
  const [openDropdowns, setOpenDropdowns] = useState({
    location: false,
    hashkafa: false,
    academicLevel: false,
    size: false
  });
  const [filters, setFilters] = useState({
    types: [], // Start with empty - user must select first
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
      // Don't set filteredSchools here - leave it empty initially
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
  }, [filters, searchTerm]);

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
    if (!user) {
      return;
    }

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
    // If no type selected, show nothing
    if (filters.types.length === 0) {
      setFilteredSchools([]);
      return;
    }

    let result = [...schools];

    // Type filter (required)
    result = result.filter(school => filters.types.includes(school.type));

    // Hashkafa filter
    if (filters.hashkafas.length > 0) {
      result = result.filter(school => filters.hashkafas.includes(school.hashkafa));
    }

    // Location filter
    if (filters.locations.length > 0) {
      result = result.filter(school => filters.locations.includes(school.location));
    }

    // Academic Level filter
    if (filters.academicLevels.length > 0) {
      result = result.filter(school => filters.academicLevels.includes(school.academicLevel));
    }

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter(school => filters.sizes.includes(school.size));
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(school =>
        school.name.toLowerCase().includes(term) ||
        school.location.toLowerCase().includes(term) ||
        school.hashkafa.toLowerCase().includes(term) ||
        school.description.toLowerCase().includes(term)
      );
    }

    // Sort alphabetically by name
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

  return (
    <main className="main-content">
      <div className="container">
        {/* Search and Filters Section */}
        <section className="search-section">
          {/* Type Selector */}
          <div className="type-selector">
            <label className="type-selector-label">I'm looking for:</label>
            <div className="type-options">
              <label className="type-option">
                <input
                  type="checkbox"
                  name="typeFilter"
                  value="seminary"
                  checked={filters.types.includes('seminary')}
                  onChange={(e) => handleFilterChange('types', e.target.value)}
                />
                <span>Seminary</span>
              </label>
              <label className="type-option">
                <input
                  type="checkbox"
                  name="typeFilter"
                  value="yeshiva"
                  checked={filters.types.includes('yeshiva')}
                  onChange={(e) => handleFilterChange('types', e.target.value)}
                />
                <span>Yeshiva</span>
              </label>
              <label className="type-option">
                <input
                  type="checkbox"
                  name="typeFilter"
                  value="gap-year-program"
                  checked={filters.types.includes('gap-year-program')}
                  onChange={(e) => handleFilterChange('types', e.target.value)}
                />
                <span>Gap Year Program</span>
              </label>
            </div>
          </div>

          <div className="search-bar">
            <input
              type="text"
              id="searchInput"
              placeholder="Search schools by name, location, or hashkafa..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
              Filters
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
              Compare Selected (<span id="compareCount">{compareSchools.length}</span>)
            </button>
            <button id="clearCompareBtn" className="btn btn-secondary" onClick={clearCompareSelection}>
              Clear Selection
            </button>
          </div>
        </section>

        {/* Recommendations Section */}
        {user && topRecommendations.length > 0 && (
          <section className="recommendations-banner" id="recommendationsBanner">
            <h3>✨ Recommended For You</h3>
            <div id="recommendationsPreview" className="recommendations-preview">
              {topRecommendations.map(school => (
                <div
                  key={school.id}
                  className="recommendation-mini-card"
                  onClick={() => handleViewDetails(school.id)}
                >
                  <span className="match-badge">{school.matchPercentage}% Match</span>
                  <h4>{school.name}</h4>
                  <p>{school.location.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                </div>
              ))}
            </div>
            <Link to="/recommendations" className="btn btn-secondary">
              View All Recommendations
            </Link>
          </section>
        )}

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
          {filteredSchools.length === 0 && (
            <div className="empty-state">
              <h3>No schools found</h3>
              <p>Try adjusting your filters or search terms.</p>
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
