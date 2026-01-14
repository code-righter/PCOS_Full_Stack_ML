import axios from 'axios';

const api = axios.create({
  // Make sure this matches your backend URL exactly
  baseURL: 'https://pcosdetect.onrender.com/api/v1', 
});

// The Interceptor: This injects the token into every request
api.interceptors.request.use(
  (config) => {
    const storedData = localStorage.getItem('doctor_data');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // If your token is inside parsedData.token
        if (parsedData.token) {
            console.log(parsedData.token)
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

export default api;