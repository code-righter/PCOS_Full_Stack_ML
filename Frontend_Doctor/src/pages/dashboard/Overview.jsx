import React from 'react';
import { useDoctor } from '../../context/DoctorContext';
import { Activity, Clock, Users, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Overview = () => {
  const {doctor} = useAuth();
  const { dashboardMetrics, pendingPatients, loading, error } = useDoctor();
  console.log(dashboardMetrics.data.totalPatientsCount)

  if (loading && !dashboardMetrics) {
    return <div className="p-10 text-center text-slate-500 animate-pulse">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  }

  // Define cards dynamically based on REAL data
  const stats = [
    { title: 'Pending Requests', value: 0, icon: Clock, color: 'bg-red-100 text-red-600', sub: 'Action required' },
    { title: 'Analyzed Today', value: 0, icon: Activity, color: 'bg-blue-100 text-blue-600', sub: 'Processed' },
    { title: 'Total Patients', value: 0, icon: Users, color: 'bg-emerald-100 text-emerald-600', sub: 'All time' },
  ];

  return (
    <div className="space-y-6 m-4">
      <div className=''>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, Dr.{doctor.name || '...'} </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={22} />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending Analysis Requests Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pending Analysis Requests</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Patient Name</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Age</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Date Submitted</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {pendingPatients.length > 0 ? (
                pendingPatients.map((patient) => (
                  <tr key={patient.id || patient._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{patient.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{patient.age}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {new Date(patient.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        Review Data
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400">No pending requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;