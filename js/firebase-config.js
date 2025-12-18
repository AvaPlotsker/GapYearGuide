// Firebase configuration using compat SDK (works with file:// protocol)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjxwrDWRew-9V42NTzTW0ASGAD0YUglmU",
  authDomain: "gapyearguide-aaf58.firebaseapp.com",
  projectId: "gapyearguide-aaf58",
  storageBucket: "gapyearguide-aaf58.firebasestorage.app",
  messagingSenderId: "581096260768",
  appId: "1:581096260768:web:9a517d6054a6a962e1f5c5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log('Firebase initialized successfully');

// Review Management Class
class ReviewManager {
    constructor() {
        this.db = db;
        this.reviewsCollection = 'reviews';
    }

    // Add a new review
    async addReview(schoolId, reviewData) {
        try {
            const review = {
                schoolId: schoolId,
                rating: reviewData.rating,
                reviewText: reviewData.reviewText,
                reviewerName: reviewData.reviewerName,
                yearAttended: reviewData.yearAttended,
                timestamp: firebase.firestore.Timestamp.now(),
                helpful: 0 // For future feature: users can mark reviews as helpful
            };

            const docRef = await this.db.collection(this.reviewsCollection).add(review);
            console.log("Review added with ID: ", docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error adding review: ", error);
            return { success: false, error: error.message };
        }
    }

    // Get all reviews for a specific school
    async getReviewsForSchool(schoolId) {
        try {
            console.log('Querying reviews for schoolId:', schoolId, 'Type:', typeof schoolId);

            const querySnapshot = await this.db.collection(this.reviewsCollection)
                .where("schoolId", "==", schoolId)
                .get();

            console.log('Query completed. Docs found:', querySnapshot.size);

            const reviews = [];
            querySnapshot.forEach((doc) => {
                console.log('Review doc:', doc.id, doc.data());
                reviews.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort by timestamp in JavaScript (newest first)
            reviews.sort((a, b) => {
                const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
                const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
                return timeB - timeA;
            });

            console.log('Total reviews returned:', reviews.length);
            return { success: true, reviews: reviews };
        } catch (error) {
            console.error("Error getting reviews: ", error);
            console.error("Error details:", error.code, error.message);
            return { success: false, reviews: [], error: error.message };
        }
    }

    // Get all reviews (for reviews page)
    async getAllReviews() {
        try {
            const querySnapshot = await this.db.collection(this.reviewsCollection)
                .get();

            const reviews = [];
            querySnapshot.forEach((doc) => {
                reviews.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort by timestamp in JavaScript (newest first)
            reviews.sort((a, b) => {
                const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
                const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
                return timeB - timeA;
            });

            return { success: true, reviews: reviews };
        } catch (error) {
            console.error("Error getting all reviews: ", error);
            return { success: false, reviews: [], error: error.message };
        }
    }

    // Calculate average rating for a school
    calculateAverageRating(reviews) {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }
}

// Initialize review manager
const reviewManager = new ReviewManager();

// Export for use in other files
window.reviewManager = reviewManager;

console.log('Review manager initialized and available globally');
