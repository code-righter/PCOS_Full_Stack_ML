import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  LogOut,
  Stethoscope 
} from 'lucide-react';

const DashboardLayout = () => {
  
  // Navigation Items based on your request
  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/pending', label: 'Pending Requests', icon: Clock }, // Points to Pending Page
    { path: '/all-patients', label: 'All Patients', icon: Users }, // Points to Patient Page
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors duration-300">
        
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">PCOS Detect</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Doctor Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'} // Ensures 'Overview' isn't always active
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Doctor Profile / Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
              DS
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Dr. Smith</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gynecologist</p>
            </div>
            <button className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto">
        {/* The Outlet renders the child route (Overview, Pending, or Patient) */}
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;