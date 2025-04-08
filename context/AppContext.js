import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

// Create context
const AppContext = createContext();

// Cache constants
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const ARTICLE_CACHE_KEY = '@article_cache';
const CREDIBILITY_CACHE_KEY = '@credibility_cache';

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [savedArticles, setSavedArticles] = useState([]);
  const [articleCache, setArticleCache] = useState({});
  const [credibilityCache, setCredibilityCache] = useState({});

  // Initialize app state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load user data
        const userData = await AsyncStorage.getItem('@user_data');
        if (userData) {
          setUser(JSON.parse(userData));
        }

        // Load theme preference
        const themePreference = await AsyncStorage.getItem('@theme_preference');
        setDarkMode(themePreference === 'dark');

        // Load saved articles
        const savedArticlesData = await AsyncStorage.getItem('@saved_articles');
        if (savedArticlesData) {
          setSavedArticles(JSON.parse(savedArticlesData));
        }

        // Load article cache
        const articleCacheData = await AsyncStorage.getItem(ARTICLE_CACHE_KEY);
        if (articleCacheData) {
          setArticleCache(JSON.parse(articleCacheData));
        }

        // Load credibility cache
        const credibilityCacheData = await AsyncStorage.getItem(CREDIBILITY_CACHE_KEY);
        if (credibilityCacheData) {
          setCredibilityCache(JSON.parse(credibilityCacheData));
        }

        // Clean expired cache entries
        cleanExpiredCache();
      } catch (error) {
        console.error('Error initializing app:', error);
        Toast.show({
          type: 'error',
          text1: 'Initialization Error',
          text2: 'Failed to load app data. Please restart the app.',
          position: 'bottom'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Clean expired cache entries
  const cleanExpiredCache = async () => {
    try {
      const now = Date.now();
      
      // Clean article cache
      const cleanedArticleCache = { ...articleCache };
      let articleCacheChanged = false;
      
      Object.keys(cleanedArticleCache).forEach(key => {
        if (now - cleanedArticleCache[key].timestamp > CACHE_EXPIRY) {
          delete cleanedArticleCache[key];
          articleCacheChanged = true;
        }
      });
      
      if (articleCacheChanged) {
        setArticleCache(cleanedArticleCache);
        await AsyncStorage.setItem(ARTICLE_CACHE_KEY, JSON.stringify(cleanedArticleCache));
      }
      
      // Clean credibility cache
      const cleanedCredibilityCache = { ...credibilityCache };
      let credibilityCacheChanged = false;
      
      Object.keys(cleanedCredibilityCache).forEach(key => {
        if (now - cleanedCredibilityCache[key].timestamp > CACHE_EXPIRY) {
          delete cleanedCredibilityCache[key];
          credibilityCacheChanged = true;
        }
      });
      
      if (credibilityCacheChanged) {
        setCredibilityCache(cleanedCredibilityCache);
        await AsyncStorage.setItem(CREDIBILITY_CACHE_KEY, JSON.stringify(cleanedCredibilityCache));
      }
    } catch (error) {
      console.error('Error cleaning cache:', error);
    }
  };

  // Update user data
  const updateUser = async (userData) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error updating user data:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update user data. Please try again.',
        position: 'bottom'
      });
    }
  };

  // Toggle dark mode
  const toggleDarkMode = async () => {
    try {
      const newMode = !darkMode;
      setDarkMode(newMode);
      await AsyncStorage.setItem('@theme_preference', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error toggling dark mode:', error);
      Toast.show({
        type: 'error',
        text1: 'Theme Change Failed',
        text2: 'Failed to update theme preference.',
        position: 'bottom'
      });
    }
  };

  // Save article
  const saveArticle = async (article) => {
    try {
      // Check if article already exists
      const exists = savedArticles.some(item => item.url === article.url);
      
      if (exists) {
        // Remove article if it exists
        const updatedArticles = savedArticles.filter(item => item.url !== article.url);
        setSavedArticles(updatedArticles);
        await AsyncStorage.setItem('@saved_articles', JSON.stringify(updatedArticles));
        
        Toast.show({
          type: 'info',
          text1: 'Article Removed',
          text2: 'Article removed from saved list',
          position: 'bottom'
        });
        
        return false; // Article was removed
      } else {
        // Add article with timestamp
        const articleWithTimestamp = {
          ...article,
          savedAt: Date.now()
        };
        
        const updatedArticles = [...savedArticles, articleWithTimestamp];
        setSavedArticles(updatedArticles);
        await AsyncStorage.setItem('@saved_articles', JSON.stringify(updatedArticles));
        
        Toast.show({
          type: 'success',
          text1: 'Article Saved',
          text2: 'Article added to your saved list',
          position: 'bottom'
        });
        
        return true; // Article was saved
      }
    } catch (error) {
      console.error('Error saving article:', error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Failed to save article. Please try again.',
        position: 'bottom'
      });
      return false;
    }
  };

  // Check if article is saved
  const isArticleSaved = (url) => {
    return savedArticles.some(item => item.url === url);
  };

  // Cache article data
  const cacheArticle = async (url, data) => {
    try {
      const cacheEntry = {
        ...data,
        timestamp: Date.now()
      };
      
      const updatedCache = {
        ...articleCache,
        [url]: cacheEntry
      };
      
      setArticleCache(updatedCache);
      await AsyncStorage.setItem(ARTICLE_CACHE_KEY, JSON.stringify(updatedCache));
    } catch (error) {
      console.error('Error caching article:', error);
    }
  };

  // Get cached article
  const getCachedArticle = (url) => {
    const cacheEntry = articleCache[url];
    
    if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_EXPIRY)) {
      return cacheEntry;
    }
    
    return null;
  };

  // Cache credibility score
  const cacheCredibilityScore = async (url, score) => {
    try {
      const cacheEntry = {
        score,
        timestamp: Date.now()
      };
      
      const updatedCache = {
        ...credibilityCache,
        [url]: cacheEntry
      };
      
      setCredibilityCache(updatedCache);
      await AsyncStorage.setItem(CREDIBILITY_CACHE_KEY, JSON.stringify(updatedCache));
    } catch (error) {
      console.error('Error caching credibility score:', error);
    }
  };

  // Get cached credibility score
  const getCachedCredibilityScore = (url) => {
    const cacheEntry = credibilityCache[url];
    
    if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_EXPIRY)) {
      return cacheEntry.score;
    }
    
    return null;
  };

  // Clear all app data
  const clearAppData = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
      setDarkMode(false);
      setSavedArticles([]);
      setArticleCache({});
      setCredibilityCache({});
      
      Toast.show({
        type: 'success',
        text1: 'Data Cleared',
        text2: 'All app data has been cleared successfully.',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Error clearing app data:', error);
      Toast.show({
        type: 'error',
        text1: 'Clear Failed',
        text2: 'Failed to clear app data. Please try again.',
        position: 'bottom'
      });
    }
  };

  // Log out user
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user_data');
      setUser(null);
      
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been successfully logged out.',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Error logging out:', error);
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Failed to log out. Please try again.',
        position: 'bottom'
      });
    }
  };

  // Context value
  const contextValue = {
    user,
    darkMode,
    savedArticles,
    isLoading,
    updateUser,
    toggleDarkMode,
    saveArticle,
    isArticleSaved,
    cacheArticle,
    getCachedArticle,
    cacheCredibilityScore,
    getCachedCredibilityScore,
    clearAppData,
    logout
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3168d8" />
      </View>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <Toast />
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c2120'
  }
});
