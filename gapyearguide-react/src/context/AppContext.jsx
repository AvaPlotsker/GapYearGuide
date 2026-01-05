import { createContext, useContext, useState, useEffect } from 'react';
import { userManager, favoritesManager } from '../services/firebase';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [viewedSchools, setViewedSchools] = useState([]);
  const [reviewsCache, setReviewsCache] = useState({});
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = userManager.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, load their profile from Firestore
        const result = await userManager.getUserProfile(firebaseUser.uid);
        if (result.success) {
          setUser(result.user);

          // Load user's favorites
          const favResult = await favoritesManager.getUserFavorites(firebaseUser.uid);
          if (favResult.success) {
            setFavorites(favResult.favorites);
          }
        }
      } else {
        // User is signed out
        setUser(null);
        setFavorites([]);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Load viewed schools from localStorage (keeping this local for now)
  useEffect(() => {
    const storedViewed = localStorage.getItem('gapyear_viewed_schools');
    if (storedViewed) {
      setViewedSchools(JSON.parse(storedViewed));
    }
  }, []);

  // Save viewed schools to localStorage
  useEffect(() => {
    localStorage.setItem('gapyear_viewed_schools', JSON.stringify(viewedSchools));
  }, [viewedSchools]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    await userManager.signOut();
    setUser(null);
    setFavorites([]);
  };

  const updateUser = async (updates) => {
    if (!user || !user.id) return;

    // Update local state immediately
    setUser(prev => ({ ...prev, ...updates }));

    // Update in Firestore
    await userManager.updateUserProfile(user.id, updates);
  };

  const toggleFavorite = async (schoolId) => {
    if (!user || !user.id) return;

    const isFavorite = favorites.includes(schoolId);

    if (isFavorite) {
      // Remove from favorites
      setFavorites(prev => prev.filter(id => id !== schoolId));
      await favoritesManager.removeFavorite(user.id, schoolId);
    } else {
      // Add to favorites
      setFavorites(prev => [...prev, schoolId]);
      await favoritesManager.addFavorite(user.id, schoolId);
    }
  };

  const trackSchoolView = (schoolId) => {
    setViewedSchools(prev => {
      if (!prev.includes(schoolId)) {
        return [...prev, schoolId];
      }
      return prev;
    });
  };

  const updateReviewsCache = (schoolId, reviews) => {
    setReviewsCache(prev => ({
      ...prev,
      [schoolId]: reviews
    }));
  };

  const value = {
    user,
    favorites,
    viewedSchools,
    reviewsCache,
    loading,
    login,
    logout,
    updateUser,
    toggleFavorite,
    trackSchoolView,
    updateReviewsCache
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
