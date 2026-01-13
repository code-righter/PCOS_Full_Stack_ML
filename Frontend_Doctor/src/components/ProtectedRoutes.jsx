import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { doctor, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Optional: Render a loading spinner while checking auth status
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!doctor?.isAuthenticated) {
    // Redirect to login, but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;