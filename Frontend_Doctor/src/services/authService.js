import api from "./api";

export const authService = {

  login: async (credentials) => {
    // 1. API Call
    const response = await api.post('/auth/doctor/sign-in', credentials);
    console.log(`Login route reached authService`)
    const { token } = response.data;
    
    console.log(`Token received`)
    // 3. Save to Session Storage
    if (token) {
      localStorage.setItem('token', token);
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('doctor_data')
    // Optional: Call backend logout endpoint here
  }
};