import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. FIX: Retrieve the FULL user object, not just the token
        const storedData = localStorage.getItem('doctor_data');
        
        if (storedData) {
            try {
                // Parse the JSON string back into an object
                const parsedUser = JSON.parse(storedData);
                setDoctor(parsedUser);
            } catch (error) {
                console.error("Failed to parse stored user data:", error);
                localStorage.removeItem('doctor_data'); // Clean up corrupt data
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {

        try{            
            const data = await authService.login({ email, password });
            
            // 2. FIX: Construct the user object properly
            // We use optional chaining (?.) on data.doctor just in case it's nested differently
            const userData = { 
                isAuthenticated: true, 
                token: data.token || data.accessToken, 
                // Spread the doctor details (name, email, id) so they are at the top level
                ...(data.doctor || data) 
            };
            
            // 3. FIX: Save the ENTIRE object to localStorage
            // This ensures name/email persists on refresh
            localStorage.setItem('doctor_data', JSON.stringify(userData));
            
            // 4. Update React State
            setDoctor(userData);
            return userData;
        } catch (err) {
            console.error("Login Context Error:", err);
            throw err;
        }
    };

    const logout = () => {
        authService.logout();
        setDoctor(null); // Using the correct state setter
    };

    return (
        // Fixed: Using AuthContext.Provider instead of AuthProvider.Provider
        <AuthContext.Provider value={{ doctor, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;