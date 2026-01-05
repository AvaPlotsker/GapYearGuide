import { useState, useEffect } from 'react';
import { getSchoolsAsync } from '../utils/data';
import { reviewManager } from '../services/firebase';

export default function Reviews() {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [schools, setSchools] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [formData, setFormData] = useState({
    rating: '',
    reviewText: '',
    reviewerName: '',
    yearAttended: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSelectedType, setLastSelectedType] = useState(null);
  const [lastSelectedRating, setLastSelectedRating] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const allSchools = await getSchoolsAsync();
      setSchools(allSchools);
      loadAllReviews();
    };
    loadData();
  }, []);

  const loadAllReviews = async () => {
    const result = await reviewManager.getAllReviews();
    if (result.success) {
      setAllReviews(result.reviews);
    }
  };

  const handleTypeClick = (type) => {
    if (lastSelectedType === type) {
      // Uncheck
      setSelectedType(null);
      setLastSelectedType(null);
      setSelectedSchoolId(null);
    } else {
      setSelectedType(type);
      setLastSelectedType(type);
    }
  };

  const handleStarClick = (rating) => {
    if (lastSelectedRating === rating.toString()) {
      // Uncheck
      setFormData(prev => ({ ...prev, rating: '' }));
      setLastSelectedRating(null);
    } else {
      setFormData(prev => ({ ...prev, rating }));
      setLastSelectedRating(rating.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.rating) {
      alert('⭐ Please select a star rating (1-5 stars) for your review.');
      return;
    }
    if (!formData.reviewText.trim()) {
      alert('📝 Please write your review in the "Your Review" field.');
      return;
    }
    if (!formData.yearAttended.trim()) {
      alert('📅 Please enter the year you attended (e.g., 2023-2024).');
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      rating: parseInt(formData.rating),
      reviewText: formData.reviewText.trim(),
      reviewerName: formData.reviewerName || '',
      yearAttended: formData.yearAttended.trim()
    };

    const result = await reviewManager.addReview(selectedSchoolId, reviewData);

    if (result.success) {
      alert('Thank you for your review! It has been submitted successfully.');
      setFormData({ rating: '', reviewText: '', reviewerName: '', yearAttended: '' });
      setLastSelectedRating(null);
      loadAllReviews();
    } else {
      alert('There was an error submitting your review: ' + (result.error || 'Unknown error'));
    }

    setIsSubmitting(false);
  };

  const filteredSchools = selectedType
    ? schools.filter(school => school.type === selectedType)
    : [];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>★</span>
      );
    }
    return stars;
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  return (
    <main className="main-content">
      <div className="container">
        <h2 className="page-title">School Reviews</h2>

        {/* Submit Review Section */}
        <section className="submit-review-section">
          <div className="card">
            <h3>Would you like to submit a review?</h3>
            <p className="section-description">Share your experience to help future students make informed decisions.</p>

            {/* Step 1: Select Institution Type */}
            <div className="review-step">
              <h4>Which type of institution did you attend?</h4>
              <div className="type-selector">
                <div className="type-options">
                  {['seminary', 'yeshiva', 'gap-year-program'].map(type => (
                    <label key={type} className="type-option">
                      <input
                        type="radio"
                        name="reviewTypeFilter"
                        value={type}
                        checked={selectedType === type}
                        onClick={() => handleTypeClick(type)}
                        readOnly
                      />
                      <span>
                        {type === 'seminary' ? 'Seminary' :
                         type === 'yeshiva' ? 'Yeshiva' : 'Gap Year Program'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Select School */}
            {selectedType && (
              <div className="review-step">
                <h4>Select the school</h4>
                <div className="form-group">
                  <select
                    id="schoolSelector"
                    className="school-dropdown"
                    value={selectedSchoolId || ''}
                    onChange={(e) => setSelectedSchoolId(parseInt(e.target.value) || null)}
                  >
                    <option value="">-- Choose a school --</option>
                    {filteredSchools.map(school => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Review Form */}
            {selectedSchoolId && (
              <div className="review-step">
                <h4>Share Your Experience</h4>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Rating *</label>
                    <div className="star-rating-input">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <span key={rating}>
                          <input
                            type="radio"
                            name="rating"
                            value={rating}
                            id={`star${rating}-page`}
                            checked={formData.rating === rating.toString()}
                            onClick={() => handleStarClick(rating.toString())}
                            readOnly
                          />
                          <label htmlFor={`star${rating}-page`}>★</label>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reviewTextPage">Your Review *</label>
                    <textarea
                      id="reviewTextPage"
                      rows="6"
                      placeholder="Share your experience with this school..."
                      value={formData.reviewText}
                      onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reviewerNamePage">Your Name</label>
                    <input
                      type="text"
                      id="reviewerNamePage"
                      placeholder="Optional - leave blank to post anonymously"
                      value={formData.reviewerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, reviewerName: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="yearAttendedPage">Year Attended *</label>
                    <input
                      type="text"
                      id="yearAttendedPage"
                      placeholder="e.g., 2023-2024"
                      value={formData.yearAttended}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearAttended: e.target.value }))}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setFormData({ rating: '', reviewText: '', reviewerName: '', yearAttended: '' });
                        setLastSelectedRating(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* All Reviews Section */}
        <section className="all-reviews-section">
          <div className="section-header">
            <h3>All Reviews</h3>
          </div>

          <div className="reviews-list">
            {allReviews.length === 0 ? (
              <p className="loading-reviews">No reviews yet.</p>
            ) : (
              allReviews.map((review) => (
                <div key={review.id} className="review-item review-item-page">
                  <div className="review-school-badge">
                    <span className="school-link">{getSchoolName(review.schoolId)}</span>
                  </div>
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
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
