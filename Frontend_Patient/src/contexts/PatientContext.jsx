import { createContext, useContext, useState, useEffect } from "react";
import { patientService } from "../services/patientService";
import { useAuth } from './AuthContext';

// creating a patient context
const PatientContext = createContext(null);

// creating context provider
export const PatientProvider = ({ children }) => {
    const { user } = useAuth();
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            const data = await patientService.getPersonalInfo();
            setPatientData(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch patient data");
            setError("Could not load patient information");
        } finally {
            setLoading(false);
        }
    };

    // The function to update data
    const submitPatientData = async (updatedData) => {
        try {
            setLoading(true);
            const data = await patientService.setPersonalInfo(updatedData);
            
            setPatientData(data); 
            setError(null);
            
            return true; 
        } catch (err) {
            console.error('Failed to update new data', err);
            setError(err.response?.data?.message || "Failed to update data");
            return false; 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPatientData();
        }
    }, [user]);

    return (
        <PatientContext.Provider value={{ 
            patientData, 
            loading, 
            error, 
            refetch: fetchPatientData,
            submitPatientData // <--- EXPOSED HERE
        }}>
            {children}
        </PatientContext.Provider>
    );
};

export const usePatient = () => useContext(PatientContext);

        