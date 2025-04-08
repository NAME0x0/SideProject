import axios from 'axios';
import { showToast } from '../utils/ToastConfig';
import { API_URL } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

// Error handler function
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with an error status code
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        showToast.validationError(data.message || 'Invalid request data');
        break;
      case 401:
        showToast.authError();
        break;
      case 403:
        showToast.error('Access Denied', 'You do not have permission to perform this action');
        break;
      case 404:
        showToast.error('Not Found', 'The requested resource was not found');
        break;
      case 422:
        showToast.validationError(data.message || 'Validation error');
        break;
      case 429:
        showToast.warning('Too Many Requests', 'Please try again later');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        showToast.serverError();
        break;
      default:
        showToast.error('Error', data.message || 'An unexpected error occurred');
    }
  } else if (error.request) {
    // Request was made but no response received
    showToast.networkError();
  } else {
    // Error in setting up the request
    showToast.error('Request Error', error.message);
  }
};

// API service functions
const ApiService = {
  // Authentication
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      showToast.success('Registration Successful', 'Your account has been created');
      return response.data;
    } catch (error) {
      // Error is handled by interceptor
      throw error;
    }
  },
  
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      showToast.success('Login Successful', 'Welcome back!');
      return response.data;
    } catch (error) {
      // Error is handled by interceptor
      throw error;
    }
  },
  
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      showToast.success('Profile Updated', 'Your profile has been updated successfully');
      return response.data;
    } catch (error) {
      // Error is handled by interceptor
      throw error;
    }
  },
  
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      showToast.success('Password Changed', 'Your password has been updated successfully');
      return response.data;
    } catch (error) {
      // Error is handled by interceptor
      throw error;
    }
  },
  
  // Article scraping
  scrapeArticle: async (url) => {
    try {
      const response = await api.post('/scraper/scrape-article', { url });
      return response.data;
    } catch (error) {
      // Show specific error for scraping
      showToast.error('Scraping Failed', 'Unable to extract content from this URL');
      throw error;
    }
  },
  
  scrapeBatch: async (urls) => {
    try {
      const response = await api.post('/scraper/scrape-batch', { urls });
      return response.data;
    } catch (error) {
      // Show specific error for batch scraping
      showToast.error('Batch Scraping Failed', 'Unable to process multiple URLs');
      throw error;
    }
  },
  
  // Credibility checking
  checkCredibility: async (articleData) => {
    try {
      const response = await api.post('/check-credibility', articleData);
      return response.data;
    } catch (error) {
      // Show specific error for credibility checking
      showToast.error('Verification Failed', 'Unable to verify the credibility of this article');
      throw error;
    }
  },
  
  checkUrl: async (url) => {
    try {
      const response = await api.post('/check-url', { url });
      return response.data;
    } catch (error) {
      // Show specific error for URL checking
      showToast.error('URL Verification Failed', 'Unable to verify this URL');
      throw error;
    }
  },
  
  // Saved articles
  getSavedArticles: async () => {
    try {
      const response = await api.get('/saved-articles');
      return response.data;
    } catch (error) {
      // Error is handled by interceptor
      throw error;
    }
  },
  
  saveArticle: async (articleData) => {
    try {
      const response = await api.post('/saved-articles', articleData);
      showToast.success('Article Saved', 'Article has been added to your saved list');
      return response.data;
    } catch (error) {
      // Error is handled by interceptor
      throw error;
    }
  },
  
  removeSavedArticle: async (articleId) => {
    try {
      const response = await api.delete(`/saved-articles/${articleId}`);
      showToast.info('Article Removed', 'Article has been removed from your saved list');
      return response.data;
    } catch (error) {
      // Error is handled by interceptor
      throw error;
    }
  },
  
  // Trending news
  getTrendingNews: async () => {
    try {
      const response = await api.get('/trending-news');
      return response.data;
    } catch (error) {
      // Show specific error for trending news
      showToast.error('Loading Failed', 'Unable to load trending news');
      throw error;
    }
  },
  
  // Notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      // Error is handled by interceptor
      throw error;
    }
  },
  
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      // Error is handled by interceptor
      throw error;
    }
  },
  
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      // Error is handled by interceptor
      throw error;
    }
  }
};

export default ApiService;
