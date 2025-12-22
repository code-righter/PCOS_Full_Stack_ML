import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) =>{
    const [doctor, setDoctor] = useState(null);
    const [loading , setLoading] = useState(true);

    useEffect(()=>{
        const localStorage = localStorage.getItem('token');
        if(localStorage){
            setUser({isAuthenticated : true});
        }

        setLoading(false);
    }, [])

    const login = async (email , password) =>{
        console.log(`Attempt to login`)
        try{
            await authService.login({email, password});
        }catch(err){
            throw(err)
        }
    }

    const logout = ()=>{
        authService.logout();
        setUser(null);
    };

    return (
        <AuthProvider.Provider value = {{doctor, login, logout, loading}}>
            {!loading && children}
        </AuthProvider.Provider>
    )
}

export const useAuth = () =>useContext(AuthContext);