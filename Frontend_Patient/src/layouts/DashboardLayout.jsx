import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        {/* Topbar will come here later */}
        <div className="h-16 bg-white border-b border-slate-300 flex items-center px-6">
          <h1 className="text-lg font-semibold text-slate-800">
            Patient Dashboard
          </h1>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
