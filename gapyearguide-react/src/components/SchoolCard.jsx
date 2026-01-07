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
          <span className="info-label">Cost</span>
          <span className="info-value">${school.cost.toLocaleString()}/year</span>
        </div>
      </div>

      {school.tags && school.tags.length > 0 && (
        <div className="school-tags">
          {school.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
          {school.tags.length > 3 && (
            <span className="tag tag-more">+{school.tags.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  );
}
