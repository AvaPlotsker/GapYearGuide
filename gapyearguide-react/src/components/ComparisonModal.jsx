import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { reviewManager } from '../services/firebase';

export default function ComparisonModal({ schools, onClose }) {
  const { reviewsCache, updateReviewsCache } = useApp();
  const [schoolReviews, setSchoolReviews] = useState({});

  useEffect(() => {
    // Load reviews for all compared schools
    const loadReviews = async () => {
      const reviewsData = {};

      for (const school of schools) {
        // Check cache first
        if (reviewsCache[school.id]) {
          reviewsData[school.id] = reviewsCache[school.id];
        } else {
          // Fetch from Firebase
          const result = await reviewManager.getReviewsForSchool(school.id);
          if (result.success) {
            reviewsData[school.id] = result.reviews;
            updateReviewsCache(school.id, result.reviews);
          }
        }
      }

      setSchoolReviews(reviewsData);
    };

    loadReviews();
  }, [schools]);

  const calculateAverageRating = (schoolId) => {
    const reviews = schoolReviews[schoolId] || [];
    if (reviews.length === 0) return null;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getReviewCount = (schoolId) => {
    const reviews = schoolReviews[schoolId] || [];
    return reviews.length;
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const comparisonFields = [
    { label: 'School Name', key: 'name', class: 'comparison-header' },
    { label: 'Type', key: 'type' },
    { label: 'Location', key: 'location' },
    { label: 'Hashkafa', key: 'hashkafa' },
    { label: 'Student Count', key: 'studentCount' },
    {
      label: 'Annual Cost',
      key: 'cost',
      format: (val) => `$${val.toLocaleString()}`
    },
    { label: 'Program Focus', key: 'programFocus' },
    {
      label: 'Rating',
      key: 'id',
      format: (_val, school) => {
        const avgRating = calculateAverageRating(school.id);
        const count = getReviewCount(school.id);

        if (!avgRating) {
          return `No reviews yet`;
        }

        return `${avgRating} ⭐ (${count} ${count === 1 ? 'review' : 'reviews'})`;
      }
    },
    {
      label: 'Meals',
      key: 'meals',
      format: (val) => {
        if (!val?.perDay || !val?.included?.length) return 'N/A';
        return `${val.perDay} (${val.included.join(', ')})`;
      }
    },
    {
      label: 'Shabbos',
      key: 'shabbos',
      format: (val) => {
        if (!val?.pattern) return 'N/A';
        if (val.details) {
          return `${val.pattern} (${val.details})`;
        }
        return val.pattern;
      }
    },
    {
      label: 'Shana Bet Offered',
      key: 'shanaBet.offered',
      format: (val) => (val ? 'Yes' : 'No')
    },
    {
      label: 'Shana Bet Type',
      key: 'shanaBet',
      format: (val) => {
        if (!val?.offered) return 'N/A';
        return val.programType === 'both'
          ? 'Madricha & Student'
          : val.programType === 'madricha'
          ? 'Madricha Only'
          : 'Student Only';
      }
    },
    {
      label: 'Shana Bet Duration',
      key: 'shanaBet',
      format: (val) => {
        if (!val?.offered) return 'N/A';
        return val.duration === 'both'
          ? 'Full/Half Year'
          : val.duration === 'full-year'
          ? 'Full Year'
          : 'Half Year';
      }
    },
    { label: 'Chessed Day', key: 'chessed.day' },
    { label: 'Distance to Kotel', key: 'distances.kotel' },
    { label: 'Distance to Center', key: 'distances.centerCity' },
    { label: 'Distance to Shopping', key: 'distances.shopping' },
    {
      label: 'Bus Lines',
      key: 'transportation.buses',
      format: (val) => (Array.isArray(val) ? val.join(', ') : val)
    },
    { label: 'Taxi Availability', key: 'transportation.taxiAvailability' },
    { label: 'Walkability', key: 'transportation.walkability' },
    {
      label: 'Food Delivery',
      key: 'delivery.food',
      format: (val) => (val ? 'Yes' : 'No')
    },
    {
      label: 'Delivery Services',
      key: 'delivery.services',
      format: (val) => (Array.isArray(val) ? val.join(', ') : val)
    },
    { label: 'Phone', key: 'phone' },
    { label: 'Email', key: 'email' },
    {
      label: 'Website',
      key: 'website',
      format: (val) => val ? (
        <a href={val} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>
          {val}
        </a>
      ) : 'N/A'
    },
    { label: 'Application Deadline', key: 'applicationDeadline' }
  ];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (schools.length === 0) {
    return (
      <div className="modal" onClick={handleBackdropClick}>
        <div className="modal-content comparison-modal">
          <div className="modal-header">
            <h2>Compare Schools</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="empty-state">
              <h3>No schools selected for comparison</h3>
              <p>Select schools from the main list to compare them here.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal-content comparison-modal">
        <div className="modal-header">
          <h2>Compare Schools</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="comparison-table" data-school-count={schools.length}>
            {comparisonFields.map((field, index) => (
              <div key={index} className="comparison-row">
                <div className="comparison-label">{field.label}</div>
                {schools.map((school) => {
                  const value = getNestedValue(school, field.key);
                  const displayValue = field.format
                    ? field.format(value, school)
                    : value;
                  const cellClass = field.class
                    ? `comparison-cell ${field.class}`
                    : 'comparison-cell';

                  return (
                    <div key={school.id} className={cellClass}>
                      {displayValue || 'N/A'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
