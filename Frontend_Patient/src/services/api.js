import axios from 'axios';

// 1. Create the Axios instance
const api = axios.create({
  baseURL: 'https://pcosdetect.onrender.com/api/v1', 
  headers: {
    'Content-Type': 'application/json',
    // REMOVE the session header from here. 
    // It is "stale" logic. We rely 100% on the interceptor below.
  },
});

// 2. Interceptor (The Fix)
api.interceptors.request.use(
  (config) => {
    // BUG FIX 1: Use the correct key 'sessionId' (matches AuthContext)
    const sessionId = sessionStorage.getItem('sessionId'); 
    
    if (sessionId) {
      // BUG FIX 2 & 3: Set the custom header key expected by your backend
      // Do not use 'Authorization' unless your backend specifically checks for "Bearer ..."
      config.headers['x-session-id'] = sessionId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;