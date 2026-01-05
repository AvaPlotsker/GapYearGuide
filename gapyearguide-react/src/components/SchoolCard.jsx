import { useApp } from '../context/AppContext';

export default function SchoolCard({ school, onViewDetails, showCompare = false, onCompareToggle, isSelected = false }) {
  const { favorites, toggleFavorite, reviewsCache } = useApp();
  const isFavorite = favorites.includes(school.id);

  const formatLocation = (location) => {
    return location.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatHashkafa = (hashkafa) => {
    return hashkafa.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatShanaBet = (shanaBet) => {
    if (!shanaBet?.offered) {
      return 'Not offered';
    }
    const programType = shanaBet.programType === 'both' ? 'Madricha & Student' :
                        shanaBet.programType === 'madricha' ? 'Madricha only' : 'Student only';
    const duration = shanaBet.duration === 'both' ? 'Full/Half year' :
                     shanaBet.duration === 'full-year' ? 'Full year' : 'Half year';
    return `${programType}, ${duration}`;
  };

  const formatShabbos = (shabbos) => {
    if (!shabbos?.pattern) return 'N/A';
    if (shabbos.details) {
      return `${shabbos.pattern} (${shabbos.details})`;
    }
    return shabbos.pattern;
  };

  // Get rating from reviews cache
  const getSchoolRatingInfo = () => {
    const reviews = reviewsCache[school.id];
    if (!reviews || reviews.length === 0) {
      return { hasReviews: false, rating: 0, reviewCount: 0 };
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avg = (sum / reviews.length).toFixed(1);
    return { hasReviews: true, rating: parseFloat(avg), reviewCount: reviews.length };
  };

  const ratingInfo = getSchoolRatingInfo();

  const handleCardClick = (e) => {
    // Don't trigger if clicking on buttons or checkboxes
    if (
      e.target.closest('.favorite-btn') ||
      e.target.closest('.compare-checkbox') ||
      e.target.type === 'checkbox'
    ) {
      return;
    }
    onViewDetails(school.id);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(school.id);
  };

  const handleCompareChange = (e) => {
    e.stopPropagation();
    if (onCompareToggle) {
      onCompareToggle(school.id);
    }
  };

  return (
    <div
      className={`school-card ${isSelected ? 'selected' : ''}`}
      data-school-id={school.id}
      onClick={handleCardClick}
    >
      <div className="school-card-header">
        <div>
          <h3 className="school-name">{school.name}</h3>
          <span className="school-type">{school.type}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div className="school-actions">
            <button
              className={`icon-btn favorite-btn ${isFavorite ? 'active' : ''}`}
              data-school-id={school.id}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={handleFavoriteClick}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
            {showCompare && (
              <input
                type="checkbox"
                className="compare-checkbox"
                data-school-id={school.id}
                checked={isSelected}
                onChange={handleCompareChange}
                title="Compare this school"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
          {school.matchPercentage && (
            <div style={{
              background: 'var(--gradient-1)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap'
            }}>
              {school.matchPercentage}% Match
            </div>
          )}
        </div>
      </div>

      {ratingInfo.hasReviews ? (
        <div className="school-rating">
          <span className="stars">{'⭐'.repeat(Math.floor(ratingInfo.rating))}</span>
          <span className="rating-count">
            {ratingInfo.rating} ({ratingInfo.reviewCount} {ratingInfo.reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      ) : (
        <div className="school-rating">
          <span className="rating-count" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            No reviews yet
          </span>
        </div>
      )}

      <div className="school-info">
        <div className="info-row">
          <span className="info-label">Location</span>
          <span className="info-value">{formatLocation(school.location)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Hashkafa</span>
          <span className="info-value">{formatHashkafa(school.hashkafa)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Students</span>
          <span className="info-value">{school.studentCount}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Annual Cost</span>
          <span className="info-value">${school.cost.toLocaleString()}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Meals</span>
          <span className="info-value">
            {school.meals?.perDay && school.meals?.included?.length > 0
              ? `${school.meals.perDay} (${school.meals.included.join(', ')})`
              : 'N/A'}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Shabbos</span>
          <span className="info-value">{formatShabbos(school.shabbos)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Distance to Kotel</span>
          <span className="info-value">{school.distances?.kotel || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Shana Bet</span>
          <span className="info-value">{formatShanaBet(school.shanaBet)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Chessed Day</span>
          <span className="info-value">{school.chessed?.day || 'N/A'}</span>
        </div>
      </div>

      <div className="school-tags">
        {school.tags && school.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}
