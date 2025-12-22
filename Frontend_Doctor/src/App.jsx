import { useState } from 'react'
import './App.css'
import DoctorSignIn from './pages/auth/Login'

function App() {
return (
    <Router>
      
      <AuthProvider>
        
        <DoctorProvider>
          
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/login" element={<Login />} />

            {/* --- Protected Dashboard Routes --- */}
            {/* The Layout wraps these routes. Ensure DashboardLayout has an <Outlet /> */}
            <Route path="/" element={<DashboardLayout />}>
              
              {/* Tab 1: Dashboard (Home) */}
              <Route index element={<Overview />} /> 

              {/* Tab 2: Pending Requests */}
              {/* You can point this to a specific Pending component later */}
              <Route path="pending" element={<PendingPatients />} />

              {/* Tab 3: All Patients */}
              <Route path="all-patients" element={<Patient />} />

            </Route>

            {/* --- Fallback Route --- */}
            {/* Redirects unknown URLs back to home/login */}
            <Route path="*" element={<Navigate to="/" replace />} />
            
          </Routes>

        </DoctorProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;