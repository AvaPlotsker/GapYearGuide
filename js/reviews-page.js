// Reviews Page Logic
class ReviewsPage {
    constructor() {
        this.schools = getSchools();
        this.selectedType = null;
        this.selectedSchoolId = null;
        this.allReviews = [];
        this.lastSelectedType = null; // Track last selected type for unchecking
        this.lastSelectedRating = null; // Track last selected rating for unchecking

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAllReviews();
        this.populateSchoolFilter();
    }

    setupEventListeners() {
        // Step 1: Type selection with toggle ability
        document.querySelectorAll('input[name="reviewTypeFilter"]').forEach(radio => {
            radio.addEventListener('click', (e) => {
                // If clicking the already selected radio, uncheck it
                if (this.lastSelectedType === e.target.value) {
                    e.target.checked = false;
                    this.selectedType = null;
                    this.lastSelectedType = null;
                    this.hideStep2();
                    this.hideStep3();
                } else {
                    this.selectedType = e.target.value;
                    this.lastSelectedType = e.target.value;
                    this.showStep2();
                    this.populateSchoolDropdown();
                }
            });
        });

        // Star rating with toggle ability
        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.addEventListener('click', (e) => {
                // If clicking the already selected star, uncheck it
                if (this.lastSelectedRating === e.target.value) {
                    e.target.checked = false;
                    this.lastSelectedRating = null;
                } else {
                    this.lastSelectedRating = e.target.value;
                }
            });
        });

        // Step 2: School selection
        document.getElementById('schoolSelector').addEventListener('change', (e) => {
            this.selectedSchoolId = parseInt(e.target.value);
            if (this.selectedSchoolId) {
                this.showStep3();
            } else {
                this.hideStep3();
            }
        });

        // Step 3: Form submission
        document.getElementById('reviewSubmitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview();
        });

        // Cancel button
        document.getElementById('cancelReviewPage').addEventListener('click', () => {
            this.resetForm();
        });

        // Filter and sort controls
        document.getElementById('filterBySchool').addEventListener('change', () => {
            this.renderReviews();
        });

        document.getElementById('sortReviews').addEventListener('change', () => {
            this.renderReviews();
        });
    }

    showStep2() {
        document.getElementById('step2').classList.remove('hidden');
        document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideStep2() {
        document.getElementById('step2').classList.add('hidden');
    }

    showStep3() {
        document.getElementById('step3').classList.remove('hidden');
        document.getElementById('step3').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideStep3() {
        document.getElementById('step3').classList.add('hidden');
    }

    populateSchoolDropdown() {
        const dropdown = document.getElementById('schoolSelector');
        dropdown.innerHTML = '<option value="">-- Choose a school --</option>';

        const filteredSchools = this.schools.filter(school => school.type === this.selectedType);

        filteredSchools.forEach(school => {
            const option = document.createElement('option');
            option.value = school.id;
            option.textContent = school.name;
            dropdown.appendChild(option);
        });
    }

    populateSchoolFilter() {
        const filterDropdown = document.getElementById('filterBySchool');

        // Add all schools as options
        this.schools.forEach(school => {
            const option = document.createElement('option');
            option.value = school.id;
            option.textContent = school.name;
            filterDropdown.appendChild(option);
        });
    }

    async submitReview() {
        if (!window.reviewManager) {
            alert('Review system is still loading. Please try again in a moment.');
            return;
        }

        const form = document.getElementById('reviewSubmitForm');
        const formData = new FormData(form);

        // Validate required fields with helpful messages
        const rating = formData.get('rating');
        const reviewText = formData.get('reviewText');
        const yearAttended = formData.get('yearAttended');

        if (!rating) {
            alert('⭐ Please select a star rating (1-5 stars) for your review.');
            return;
        }

        if (!reviewText || reviewText.trim() === '') {
            alert('📝 Please write your review in the "Your Review" field.');
            return;
        }

        if (!yearAttended || yearAttended.trim() === '') {
            alert('📅 Please enter the year you attended (e.g., 2023-2024).');
            return;
        }

        const reviewData = {
            rating: parseInt(rating),
            reviewText: reviewText.trim(),
            reviewerName: formData.get('reviewerName') || '',
            yearAttended: yearAttended.trim()
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const result = await window.reviewManager.addReview(this.selectedSchoolId, reviewData);

            if (result.success) {
                // Show success message
                alert('Thank you for your review! It has been submitted successfully.');

                // Reset the submit button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Review';

                // Clear the form while keeping the school type and school selection
                form.reset();

                // Reload reviews to show the new one
                this.loadAllReviews();

                // Scroll back to Step 2 so user can easily select another school
                document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                alert('There was an error submitting your review: ' + (result.error || 'Unknown error'));
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Review';
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('There was an error submitting your review. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Review';
        }
    }

    resetForm() {
        // Clear form
        document.getElementById('reviewSubmitForm').reset();

        // Clear selections
        document.querySelectorAll('input[name="reviewTypeFilter"]').forEach(radio => {
            radio.checked = false;
        });
        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.checked = false;
        });
        document.getElementById('schoolSelector').value = '';

        // Hide steps
        this.hideStep2();
        this.hideStep3();

        // Reset state
        this.selectedType = null;
        this.selectedSchoolId = null;
        this.lastSelectedType = null;
        this.lastSelectedRating = null;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async loadAllReviews() {
        const container = document.getElementById('allReviewsList');

        if (!window.reviewManager) {
            container.innerHTML = '<p class="loading-reviews">Loading review system...</p>';
            setTimeout(() => this.loadAllReviews(), 1000);
            return;
        }

        container.innerHTML = '<p class="loading-reviews">Loading reviews...</p>';

        try {
            const result = await window.reviewManager.getAllReviews();

            if (result.success) {
                this.allReviews = result.reviews;
                this.renderReviews();
            } else {
                container.innerHTML = '<p class="no-reviews">Error loading reviews. Please refresh the page.</p>';
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            container.innerHTML = '<p class="no-reviews">Error loading reviews. Please refresh the page.</p>';
        }
    }

    renderReviews() {
        const container = document.getElementById('allReviewsList');
        const filterValue = document.getElementById('filterBySchool').value;
        const sortValue = document.getElementById('sortReviews').value;

        // Filter reviews
        let filteredReviews = [...this.allReviews];

        if (filterValue !== 'all') {
            const schoolId = parseInt(filterValue);
            filteredReviews = filteredReviews.filter(review => review.schoolId === schoolId);
        }

        // Sort reviews
        filteredReviews.sort((a, b) => {
            switch (sortValue) {
                case 'newest':
                    return (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0);
                case 'oldest':
                    return (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0);
                case 'highest':
                    return b.rating - a.rating;
                case 'lowest':
                    return a.rating - b.rating;
                default:
                    return 0;
            }
        });

        // Render
        if (filteredReviews.length === 0) {
            container.innerHTML = '<p class="no-reviews">No reviews found. Be the first to submit one!</p>';
            return;
        }

        container.innerHTML = filteredReviews.map(review => this.createReviewHTML(review)).join('');
    }

    createReviewHTML(review) {
        const school = this.schools.find(s => s.id === review.schoolId);
        const schoolName = school ? school.name : 'Unknown School';

        const date = review.timestamp?.toDate ? review.timestamp.toDate() : new Date();
        const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const authorName = review.reviewerName || 'Anonymous';
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        return `
            <div class="review-item review-item-page">
                <div class="review-school-badge">
                    <a href="index.html" class="school-link">${schoolName}</a>
                </div>
                <div class="review-header">
                    <span class="${review.reviewerName ? 'review-author' : 'review-anonymous'}">${authorName}</span>
                    <span class="review-date">${dateStr}</span>
                </div>
                <div class="review-rating">${stars}</div>
                <div class="review-year">Attended: ${review.yearAttended}</div>
                <div class="review-text">${review.reviewText}</div>
            </div>
        `;
    }
}

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const reviewsPage = new ReviewsPage();
});
