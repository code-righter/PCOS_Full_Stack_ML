// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/dashboard/Home';
import Test from './pages/dashboard/Test';
import UpdateInfo from './pages/dashboard/UpdateInfo';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Optional: Protected Route Wrapper
import { useAuth } from './contexts/AuthContext';
import { PatientProvider } from './contexts/PatientContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <PatientProvider>
            <DashboardLayout /> {/* Layout renders here once */}
          </PatientProvider>
        </ProtectedRoute>
      }>
        {/* Child routes render inside the <Outlet /> of DashboardLayout */}
        <Route index element={<Home />} /> 
        <Route path="test" element={<Test />} />
        <Route path="update-info" element={<UpdateInfo />} />
        <Route path="history" element={<History />} />
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;