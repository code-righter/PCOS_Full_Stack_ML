import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
// FIX 1: Use default import (remove curly braces) if your service uses 'export default'
import {doctorService} from '../services/DoctorService'; 
import { useAuth } from './AuthContext'; // We need auth to know when to fetch

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const { doctor } = useAuth(); // Access the logged-in user state

  // --- State for the Data ---
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [pendingPatients, setPendingPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [patientTimeline, setPatientTimeline] = useState(null);

  // --- UI State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Actions (Fetching Data) ---

  const refreshDashboard = useCallback(async () => {
    // Safety check: Don't fetch if not logged in
    if (!doctor || !doctor.isAuthenticated) return;

    setLoading(true);
    try {
      // Fetch Dashboard Cards & Pending Table in parallel
      const [metricsRes, pendingRes] = await Promise.all([
        doctorService.getDocDashboardMetric(),
        doctorService.getPendingPatientsData()
      ]);

      setDashboardMetrics(metricsRes.data);
      setPendingPatients(pendingRes.data);
      setError(null);
    } catch (err) {
      console.error("Error refreshing dashboard:", err);
      // Optional: Check if error is 401 (Unauthorized) and logout?
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [doctor]); // dependency on 'doctor' ensures we have the latest token

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

  const fetchPatientTimeline = useCallback(async (patientId) => {
    try {
      const response = await doctorService.getPatientTimeline(patientId);
      setPatientTimeline(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching timeline:", err);
      throw err;
    }
  }, []);

  // --- NEW: Automatic Fetch on Mount/Login ---
  useEffect(() => {
    if (doctor?.isAuthenticated) {
      refreshDashboard();
    }
  }, [doctor, refreshDashboard]);

  // --- Context Value ---
  const value = {
    dashboardMetrics,
    pendingPatients,
    allPatients,
    patientTimeline,
    loading,
    error,
    refreshDashboard,
    fetchAllPatients,
    fetchPatientTimeline,
    clearTimeline: () => setPatientTimeline(null),
    clearError: () => setError(null)
  };

  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
};

export default DoctorContext;