// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/dashboard/Home";
import Test from "./pages/dashboard/Test";
import UpdateInfo from "./pages/dashboard/UpdateInfo";
import PatientHistory from "./pages/dashboard/PatientHistory";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import { useAuth } from "./contexts/AuthContext";
import { PatientProvider } from "./contexts/PatientContext";

import { ToastProvider } from "./contexts/ToastContext";
import Toast from "./components/Toast";
import { useToast } from "./contexts/ToastContext";


const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function AppWrapper() {
  const { toast } = useToast();
  return <Toast toast={toast} />;
}

function App() {
  return (
    <ToastProvider>
      <AppWrapper />
        <PatientProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="test" element={<Test />} />
              <Route path="update-info" element={<UpdateInfo />} />
              <Route path="history" element={<PatientHistory />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Root */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </PatientProvider>
      </ToastProvider>

  );
}

export default App;
