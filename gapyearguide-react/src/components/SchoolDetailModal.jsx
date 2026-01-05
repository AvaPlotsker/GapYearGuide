import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { reviewManager } from '../services/firebase';

export default function SchoolDetailModal({ school, onClose }) {
  const { trackSchoolView, updateReviewsCache, reviewsCache } = useApp();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (school) {
      trackSchoolView(school.id);
      loadReviews();
    }
  }, [school]);

  const loadReviews = async () => {
    setLoading(true);
    const result = await reviewManager.getReviewsForSchool(school.id);
    if (result.success) {
      setReviews(result.reviews);
      updateReviewsCache(school.id, result.reviews);
    }
    setLoading(false);
  };

  const formatType = (type) => {
    if (type === 'seminary') return 'Seminary';
    if (type === 'yeshiva') return 'Yeshiva';
    return 'Gap Year Program';
  };

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

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>★</span>
      );
    }
    return stars;
  };

  if (!school) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{school.name}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="detail-content">
            {/* Basic Information */}
            <div className="detail-section">
              <h3>Basic Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Type</div>
                  <div className="detail-value">{formatType(school.type)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Location</div>
                  <div className="detail-value">{formatLocation(school.location)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Hashkafa</div>
                  <div className="detail-value">{formatHashkafa(school.hashkafa)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Student Count</div>
                  <div className="detail-value">{school.studentCount} students</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Annual Cost</div>
                  <div className="detail-value">${school.cost.toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Application Deadline</div>
                  <div className="detail-value">{school.applicationDeadline}</div>
                </div>
              </div>
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{school.description}</p>
            </div>

            {/* Contact Information */}
            <div className="detail-section">
              <h3>Contact Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Address</div>
                  <div className="detail-value">{school.address}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Phone</div>
                  <div className="detail-value">{school.phone}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{school.email}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Website</div>
                  <div className="detail-value">
                    <a href={school.website} target="_blank" rel="noopener noreferrer">
                      {school.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Meals */}
            <div className="detail-section">
              <h3>Meals</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Meals Provided</div>
                  <div className="detail-value">
                    {school.meals?.perDay && school.meals?.included?.length > 0
                      ? `${school.meals.perDay} (${school.meals.included.join(', ')})`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Shabbos */}
            <div className="detail-section">
              <h3>Shabbos</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Shabbos Arrangements</div>
                  <div className="detail-value">
                    {school.shabbos?.pattern && school.shabbos?.details
                      ? `${school.shabbos.pattern} (${school.shabbos.details})`
                      : school.shabbos?.pattern || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="detail-section">
              <h3>User Reviews</h3>
              <div id="schoolReviews" className="reviews-list">
                {loading ? (
                  <p className="loading-reviews">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="no-reviews">No reviews yet. Be the first to share your experience!</p>
                ) : (
                  <>
                    <div className="rating-summary">
                      <div className="average-rating">
                        <span className="rating-number">{calculateAverageRating()}</span>
                        <div className="stars">{renderStars(Math.round(calculateAverageRating()))}</div>
                        <span className="review-count">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                      </div>
                    </div>
                    {reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="stars">{renderStars(review.rating)}</div>
                          <span className="review-date">
                            {review.createdAt?.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="review-text">{review.reviewText}</p>
                        <div className="review-meta">
                          <span className="reviewer-name">
                            {review.reviewerName || 'Anonymous'}
                          </span>
                          <span className="year-attended">Class of {review.yearAttended}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <Link to="/reviews" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Write a Review
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
