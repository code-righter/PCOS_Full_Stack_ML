import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider (The Wrapper Component)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const storedSession = sessionStorage.getItem('sessionId');
    if (storedSession) {
      // In a real app, you might hit an API like /me to get user details here
      // For now, we just assume they are logged in
      setUser({ isAuthenticated: true });
    }
    setLoading(false);
  }, []);

  // The Login Function exposed to the app
  const login = async (email, password) => {
    console.log(`Attempty to login`)
    try {
      await authService.login({ email, password });
      // If successful, update state
      setUser({ isAuthenticated: true });
      
      return true; // Success
    } catch (error) {
      throw error;
    }
  };

  // The Logout Function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook to use the context easily
export const useAuth = () => useContext(AuthContext);