import { createContext, useContext, useState, useEffect } from "react";
import { patientService } from "../services/patientService";
import { useAuth } from './AuthContext';

const PatientContext = createContext(null);

const CACHE_KEY = 'patient_profile_cache'; // Key for storage

export const PatientProvider = ({ children }) => {
    const { user } = useAuth();
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPatientData = async (forceRefresh = false) => {
        setLoading(true);
        try {
            // 1. OPTIMIZATION: Check Cache first (unless forcing a refresh)
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (!forceRefresh && cached) {
                console.log("Serving Patient Data from Cache");
                setPatientData(JSON.parse(cached));
                setLoading(false);
                return; // Stop here, no API call needed!
            }

            // 2. If no cache or forced, call API
            console.log("Fetching Patient Data from API...");
            const data = await patientService.getPersonalInfo();
            
            // 3. Save to Cache and State
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
            setPatientData(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch patient data", err);
            setError("Could not load patient information");
        } finally {
            setLoading(false);
        }
    };

    const submitPatientData = async (updatedData) => {
        try {
            setLoading(true);
            // 1. Send update to Backend
            const data = await patientService.setPersonalInfo(updatedData);
            
            // 2. Update Cache immediately with the NEW data
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
            
            // 3. Update State
            setPatientData(data);
            return true;
        } catch (err) {
            console.error('Failed to update new data', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Clear cache on unmount or logout if needed (Optional but cleaner)
    useEffect(() => {
        if (!user) {
            setPatientData(null);
            sessionStorage.removeItem(CACHE_KEY);
        } else {
            fetchPatientData();
        }
    }, [user]);

    return (
        <PatientContext.Provider value={{ 
            patientData, 
            loading, 
            error, 
            // Allow components to force a refresh if they really need fresh data
            refetch: () => fetchPatientData(true), 
            submitPatientData 
        }}>
            {children}
        </PatientContext.Provider>
    );
};

export const usePatient = () => useContext(PatientContext);