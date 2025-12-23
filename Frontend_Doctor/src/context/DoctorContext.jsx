import React, { createContext, useContext, useState, useCallback } from 'react';
import {doctorService} from '../services/DoctorService';

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  // --- State for the 4 Data Points ---
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [pendingPatients, setPendingPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [patientTimeline, setPatientTimeline] = useState(null);

  // --- UI State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Actions (Fetching Data) ---

  // 1. Fetch Dashboard Metrics (Cards)
  const fetchDashboardMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await doctorService.getDocDashboardMetrics();
      setDashboardMetrics(response.data); 
      setError(null);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError(err.response?.data?.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Pending Patients (For the Pending Requests Page/Table)
  const fetchPendingPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await doctorService.getPendingPatientsData();
      setPendingPatients(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending patients:", err);
      setError("Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Fetch All Patients (For the All Patients Page)
  const fetchAllPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await doctorService.getAllPatients();
      setAllPatients(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching all patients:", err);
      setError("Failed to load patient list");
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. Fetch Timeline (Specific Patient History)
  const fetchPatientTimeline = useCallback(async (patientId) => {
    // We don't set global loading here to avoid blocking the whole UI if just one component needs this
    try {
      const response = await doctorService.getPatientTimeline(patientId);
      setPatientTimeline(response.data);
      return response.data; // Return data for local handling if needed
    } catch (err) {
      console.error("Error fetching timeline:", err);
      // Optional: Don't set global error for specific component failures
      throw err; 
    }
  }, []);

  // --- Context Value ---
  const value = {
    // State
    dashboardMetrics,
    pendingPatients,
    allPatients,
    patientTimeline,
    loading,
    error,
    
    // Actions
    fetchDashboardMetrics,
    fetchPendingPatients,
    fetchAllPatients,
    fetchPatientTimeline,
    
    // Clear specific states if needed (good for unmounting)
    clearTimeline: () => setPatientTimeline(null),
    clearError: () => setError(null)
  };

  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
};

// --- Custom Hook for easy access ---
export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
};

export default DoctorContext;