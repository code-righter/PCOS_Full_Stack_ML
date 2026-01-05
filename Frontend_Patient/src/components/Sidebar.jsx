import { NavLink } from "react-router-dom";
import {
  Home,
  ClipboardCheck,
  Edit,
  CalendarClock,
  LogOut,
  Heart,
  PhoneCall,
  
} from "lucide-react";
import { usePatient } from "../contexts/PatientContext";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ onLogout }) => {
  const { patientData, loading } = usePatient();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition
     ${
       isActive
         ? "bg-indigo-50 text-indigo-600"
         : "text-slate-600 hover:bg-slate-100"
     }`;

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">HealthCare+</p>
          <p className="text-xs text-slate-500">Patient Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/dashboard" end className={navItemClass}>
          <Home size={18} />
          Home
        </NavLink>

        <NavLink to="/dashboard/update-info" className={navItemClass}>
          <Edit size={18} />
          Update Data
        </NavLink>

        <NavLink to="/dashboard/test" className={navItemClass}>
          <ClipboardCheck size={18} />
          Test
        </NavLink>

        <NavLink to="/dashboard/history" className={navItemClass}>
          <CalendarClock size={18} />
          Treatment Timeline
        </NavLink>
      </nav>

      {/* User Info */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
            {loading
              ? "P"
              : patientData?.data?.name?.charAt(0).toUpperCase() || "P"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {patientData?.data?.name || "Patient"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {patientData?.data?.phoneNumber || "—"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium text-red-600 border border-red-200 rounded-md py-2 hover:bg-red-50"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
