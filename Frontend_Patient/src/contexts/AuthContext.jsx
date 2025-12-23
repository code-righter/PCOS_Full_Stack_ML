import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const storedSession = sessionStorage.getItem('sessionId');
    if (storedSession) {
      setUser({ isAuthenticated: true });
    }
    setLoading(false);
  }, []);


  const login = async (email, password) => {
    console.log(`Attempt to login`)
    try {
      await authService.login({ email, password });
      setUser({ isAuthenticated: true });
      
      return true; // Success
    } catch (error) {
      throw error;
    }
  };

  const logout = async() => {
    try{
      await authService.logout();
    }
    catch(err){
      
    }
    
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);