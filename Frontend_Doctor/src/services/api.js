import axios from 'axios';

const api = axios.create({
  // Make sure this matches your backend URL exactly
  baseURL: 'http://localhost:8080/api/v1', 
});

// --- 1. REQUEST INTERCEPTOR (Injects Token) ---
api.interceptors.request.use(
  (config) => {
    const storedData = localStorage.getItem('doctor_data');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.token) {
          // Debugging log (optional, remove in production)
          // console.log("Attaching Token:", parsedData.token);
          config.headers.Authorization = `Bearer ${parsedData.token}`;
        }
      } catch (error) {
        console.error("Token parsing error:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 2. RESPONSE INTERCEPTOR (Handles Expiration) ---
api.interceptors.response.use(
  (response) => {
    // If the response is good, just return it
    return response;
  },
  (error) => {
    // Check if the error is a 401 (Unauthorized) or 403 (Forbidden)
    // This usually means the token has expired or is invalid
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Session expired or unauthorized. Redirecting to login...");
      
      // 1. Clear the local storage so the App knows the user is logged out
      localStorage.removeItem('doctor_data');
      
      // 2. Force redirect to the login page
      // We use window.location because we can't easily use useNavigate outside a React component
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;