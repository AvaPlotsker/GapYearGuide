import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjxwrDWRew-9V42NTzTW0ASGAD0YUglmU",
  authDomain: "gapyearguide-aaf58.firebaseapp.com",
  projectId: "gapyearguide-aaf58",
  storageBucket: "gapyearguide-aaf58.firebasestorage.app",
  messagingSenderId: "581096260768",
  appId: "1:581096260768:web:9a517d6054a6a962e1f5c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// User Management
class UserManager {
  async signUp(email, password, userData) {
    try {
      // Create authentication user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        schoolType: userData.schoolType || [],
        preferences: userData.preferences || {},
        importantFeatures: userData.importantFeatures || [],
        currentSchool: userData.currentSchool || '',
        location: userData.location || '',
        graduationYear: userData.graduationYear || '',
        createdAt: Timestamp.now()
      });

      return {
        success: true,
        userId: user.uid
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        userId: userCredential.user.uid
      };
    } catch (error) {
      console.error('Error signing in:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserProfile(userId) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          user: { id: userId, ...docSnap.data() }
        };
      } else {
        return {
          success: false,
          error: 'User profile not found'
        };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

// Favorites Management
class FavoritesManager {
  async addFavorite(userId, schoolId) {
    try {
      await addDoc(collection(db, 'favorites'), {
        userId,
        schoolId,
        createdAt: Timestamp.now()
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding favorite:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async removeFavorite(userId, schoolId) {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('schoolId', '==', schoolId)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = [];

      querySnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, 'favorites', document.id)));
      });

      await Promise.all(deletePromises);

      return { success: true };
    } catch (error) {
      console.error('Error removing favorite:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserFavorites(userId) {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const favorites = [];

      querySnapshot.forEach((document) => {
        favorites.push(document.data().schoolId);
      });

      return {
        success: true,
        favorites
      };
    } catch (error) {
      console.error('Error getting favorites:', error);
      return {
        success: false,
        error: error.message,
        favorites: []
      };
    }
  }
}

// Review Management
class ReviewManager {
  async addReview(schoolId, reviewData) {
    try {
      const review = {
        schoolId,
        ...reviewData,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'reviews'), review);

      return {
        success: true,
        reviewId: docRef.id
      };
    } catch (error) {
      console.error('Error adding review:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getReviewsForSchool(schoolId) {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('schoolId', '==', schoolId)
      );

      const querySnapshot = await getDocs(q);
      const reviews = [];

      querySnapshot.forEach((document) => {
        const data = document.data();
        reviews.push({
          id: document.id,
          ...data,
          createdAt: data.createdAt?.toDate()
        });
      });

      // Sort by date (newest first)
      reviews.sort((a, b) => b.createdAt - a.createdAt);

      return {
        success: true,
        reviews
      };
    } catch (error) {
      console.error('Error getting reviews:', error);
      return {
        success: false,
        error: error.message,
        reviews: []
      };
    }
  }

  async getAllReviews() {
    try {
      const querySnapshot = await getDocs(collection(db, 'reviews'));
      const reviews = [];

      querySnapshot.forEach((document) => {
        const data = document.data();
        reviews.push({
          id: document.id,
          ...data,
          createdAt: data.createdAt?.toDate()
        });
      });

      // Sort by date (newest first)
      reviews.sort((a, b) => b.createdAt - a.createdAt);

      return {
        success: true,
        reviews
      };
    } catch (error) {
      console.error('Error getting all reviews:', error);
      return {
        success: false,
        error: error.message,
        reviews: []
      };
    }
  }

  calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }
}

// School Management
class SchoolManager {
  async addSchool(schoolData) {
    try {
      const docRef = await addDoc(collection(db, 'schools'), {
        ...schoolData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        schoolId: docRef.id
      };
    } catch (error) {
      console.error('Error adding school:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateSchool(schoolId, updates) {
    try {
      const docRef = doc(db, 'schools', schoolId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating school:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteSchool(schoolId) {
    try {
      await deleteDoc(doc(db, 'schools', schoolId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting school:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getAllSchools() {
    try {
      const querySnapshot = await getDocs(collection(db, 'schools'));
      const schools = [];

      querySnapshot.forEach((document) => {
        schools.push({
          id: document.id,
          ...document.data()
        });
      });

      return {
        success: true,
        schools
      };
    } catch (error) {
      console.error('Error getting schools:', error);
      return {
        success: false,
        error: error.message,
        schools: []
      };
    }
  }

  async getSchoolById(schoolId) {
    try {
      const docRef = doc(db, 'schools', schoolId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          school: { id: docSnap.id, ...docSnap.data() }
        };
      } else {
        return {
          success: false,
          error: 'School not found'
        };
      }
    } catch (error) {
      console.error('Error getting school:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const userManager = new UserManager();
export const favoritesManager = new FavoritesManager();
export const reviewManager = new ReviewManager();
export const schoolManager = new SchoolManager();
export { db, auth };
