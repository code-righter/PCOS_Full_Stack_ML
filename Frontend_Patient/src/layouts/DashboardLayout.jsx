import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'; // <--- CHANGED imports
import { Menu, X, Bell, Settings, Heart, Home, ClipboardCheck, Edit, LogOut } from 'lucide-react';
import { usePatient } from '../contexts/PatientContext';
import { useAuth } from '../contexts/AuthContext'; // Import Auth to handle logout

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { patientData, loading } = usePatient();
  const { logout } = useAuth(); // Use context logout
  const location = useLocation(); // <--- To get current URL
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      // No need for window.location = '/'; AuthContext updates state -> App redirects to login
    }
  };

  // Dynamic Title based on URL
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('test')) return 'Health Test';
    if (path.includes('update-info')) return 'Update Health Data';
    return 'Dashboard';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* --- Left Sidebar --- */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`}
      >
        <div className="h-full px-3 py-4 flex flex-col bg-linear-to-b from-blue-600 to-indigo-700 shadow-xl">
          
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-4 mb-8 bg-white/10 backdrop-blur-sm rounded-xl">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">HealthCare+</h2>
              <p className="text-xs text-blue-100">Patient Portal</p>
            </div>
          </div>

          {/* Navigation Menu (Use NavLink!) */}
          <ul className="space-y-2 font-medium flex-1">
            <li>
              <NavLink
                to="/dashboard"
                end // Use 'end' so it only matches exact /dashboard
                className={({ isActive }) =>
                  `flex items-center p-3 text-white rounded-lg transition group ${
                    isActive ? 'bg-white/30 shadow-lg' : 'hover:bg-white/20'
                  }`
                }
              >
                <Home className="w-5 h-5" />
                <span className="ml-3">Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/test" // Correct Path
                className={({ isActive }) =>
                  `flex items-center p-3 text-white rounded-lg transition group ${
                    isActive ? 'bg-white/30 shadow-lg' : 'hover:bg-white/20'
                  }`
                }
              >
                <ClipboardCheck className="w-5 h-5" />
                <span className="ml-3">Test</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/update-info" // Correct Path
                className={({ isActive }) =>
                  `flex items-center p-3 text-white rounded-lg transition group ${
                    isActive ? 'bg-white/30 shadow-lg' : 'hover:bg-white/20'
                  }`
                }
              >
                <Edit className="w-5 h-5" />
                <span className="ml-3">Update Data</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/history" // Correct Path
                className={({ isActive }) =>
                  `flex items-center p-3 text-white rounded-lg transition group ${
                    isActive ? 'bg-white/30 shadow-lg' : 'hover:bg-white/20'
                  }`
                }
              >
                <Edit className="w-5 h-5" />
                <span className="ml-3">History</span>
              </NavLink>
            </li>
          </ul>

          {/* Bottom User Section */}
          <div className="mt-auto p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
               {loading ? '...' : patientData?.data?.name?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="h-4 bg-blue-400/30 rounded animate-pulse w-20"></div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-white truncate">
                      {patientData?.data?.name || 'Patient'}
                    </p>
                    <p className="text-xs text-blue-100 truncate">
                      {patientData?.data?.phoneNumber || 'No Phone'}
                    </p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-white py-2 rounded-lg transition border border-red-500/30"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Top Navbar */}
      <div className="fixed top-0 left-0 sm:left-64 right-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-800">
                {getPageTitle()} {/* Dynamic Title */}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-500 rounded-lg hover:bg-gray-100">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100">
                <Settings className="w-6 h-6" />
              </button>
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                {loading ? 'P' : patientData?.data?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="p-4 sm:ml-64 mt-14">
        {/* <Outlet /> is where Home, Test, or UpdateInfo will appear */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default DashboardLayout;