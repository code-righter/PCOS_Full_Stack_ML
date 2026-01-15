import React from 'react';
import { useDoctor } from '../../context/DoctorContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';

const PendingRequests = () => {
  const { pendingPatients, loading } = useDoctor();
  const navigate = useNavigate();
  const patientList = pendingPatients || [];

  console.log(pendingPatients)

  const handleReview = (patientId) => {
    navigate(`/review/${patientId}`);
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Requests...</div>;

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pending Requests</h1>
          <p className="text-slate-500 dark:text-slate-400">Review and diagnose patient submissions</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Date Submitted</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {patientList.length > 0 ? (
                patientList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {item.patient?.name || 'Unknown'}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleReview(item.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Start Review <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No pending requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PendingRequests;