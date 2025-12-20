import api from "./api";

export const authService = {
  // Step 1: Send User Data -> Backend checks email -> Sends OTP
  registerInit: async (userData) => {
    // Endpoint: /sign-up
    const response = await api.post('/auth/patient/sign-up', userData);
    return response.data;
  },

  // Step 2: Send User Data + OTP -> Backend creates account
  verifyEmail: async (payload) => {
    // Endpoint: /verifyEmail
    // Payload includes: { name, email, password, phoneNumber, otp }
    const response = await api.post('/auth/patient/verifyEmail', payload);
    return response.data;
  },

  login: async (credentials) => {
    // 1. API Call

    const response = await api.post('/auth/patient/sign-in', credentials);
    console.log(`Login route reached authService`)
    // 2. Extract Data (Based on your screenshot)
    const { sessionId, message } = response.data;
    
    console.log(`Session Id received`)
    // 3. Save to Session Storage
    if (sessionId) {
      sessionStorage.setItem('sessionId', sessionId);
    }
    
    return response.data;
  },

  logout: () => {
    sessionStorage.removeItem('sessionId');
    // Optional: Call backend logout endpoint here
  }
};