import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { DoctorProvider } from './context/DoctorContext';

// Layouts & Components
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoutes' 

// Pages
import Login from './pages/auth/Login';
import Overview from './pages/dashboard/Overview';
import Patient from './pages/dashboard/Patient';
import PendingPatients from './pages/dashboard/PendingPatients'


function App() {
  return (
    <Router>
      <AuthProvider>
        <DoctorProvider>
          <Routes>
            {/* --- Public Route --- */}
            <Route path="/login" element={<Login />} />

            {/* --- Protected Routes --- */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="pending" element={<PendingPatients />} />
              <Route path="all-patients" element={<Patient />} />
            </Route>

            {/* --- Catch All --- */}
            {/* If user goes to unknown link, send to login (or dashboard if auth) */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            
          </Routes>
        </DoctorProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;