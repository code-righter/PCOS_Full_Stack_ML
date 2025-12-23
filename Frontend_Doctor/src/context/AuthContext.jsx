import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// 1. Create the context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 2. Define state (you named it 'doctor')
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fix: specific variable name to avoid shadowing global 'localStorage'
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
            // Fix: Use 'setDoctor' instead of 'setUser'
            // Ideally, you might want to decode the token or fetch the user profile here
            // For now, we just set a flag or the token
            setDoctor({ isAuthenticated: true, token: storedToken });
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        console.log(`Attempt to login`);
        try {
            const data = await authService.login({ email, password });
            // Update state after successful login
            setDoctor(data); 
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        authService.logout();
        // Fix: Use 'setDoctor' instead of 'setUser'
        setDoctor(null);
    };

    // Fix: Use 'AuthContext.Provider', not 'AuthProvider.Provider'
    return (
        <AuthContext.Provider value={{ doctor, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;