import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pcosdetect.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Your existing code)
api.interceptors.request.use(
  (config) => {
    const sessionId = sessionStorage.getItem('sessionId');
    if (sessionId) {
      config.headers['x-session-id'] = sessionId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- NEW: Response Interceptor (The Logout Logic) ---
api.interceptors.response.use(
  (response) => {
    // If response is good, just pass it through
    return response;
  },
  (error) => {
    // If backend returns 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out...");
      
      // 1. Clear the storage
      sessionStorage.removeItem('sessionId');
      sessionStorage.removeItem('patient_profile_cache'); // Clear your cache too!
      
      // 2. Force Redirect to Login
      // We use window.location to ensure a full state reset
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;