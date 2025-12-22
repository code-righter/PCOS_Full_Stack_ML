import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  Search, 
  Moon, 
  Sun, 
  Clock, 
  Activity, 
  Calendar, 
  Users 
} from 'lucide-react';

const Overview = () => {
  // --- Dark Mode Logic ---
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // --- Mock Data ---
  const stats = [
    { 
      title: 'Pending Requests', 
      value: '8', 
      change: '↑ 3 new today', 
      icon: Clock, 
      color: 'bg-red-100 text-red-600', 
      darkColor: 'dark:bg-red-900/20 dark:text-red-400' 
    },
    { 
      title: 'Analyzed Today', 
      value: '12', 
      change: '↑ 20% from yesterday', 
      icon: Activity, 
      color: 'bg-blue-100 text-blue-600', 
      darkColor: 'dark:bg-blue-900/20 dark:text-blue-400' 
    },
    { 
      title: 'Follow-ups Due', 
      value: '5', 
      change: '2 urgent', 
      icon: Calendar, 
      color: 'bg-yellow-100 text-yellow-600', 
      darkColor: 'dark:bg-yellow-900/20 dark:text-yellow-400' 
    },
    { 
      title: 'Total Patients', 
      value: '247', 
      change: '↑ 15 this month', 
      icon: Users, 
      color: 'bg-emerald-100 text-emerald-600', 
      darkColor: 'dark:bg-emerald-900/20 dark:text-emerald-400' 
    },
  ];

  const pendingRequests = [
    { id: 1, name: 'Sarah Patel', age: 28, submitted: '2 hours ago', priority: 'Urgent', status: 'Review' },
    { id: 2, name: 'Maria Khan', age: 32, submitted: '5 hours ago', priority: 'Normal', status: 'Review' },
    { id: 3, name: 'Anita Sharma', age: 25, submitted: '1 day ago', priority: 'Normal', status: 'Review' },
    { id: 4, name: 'Priya Singh', age: 30, submitted: '1 day ago', priority: 'High', status: 'Review' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'High': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Thursday, December 18, 2025</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} ${stat.darkColor}`}>
                <stat.icon size={22} />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-4">
              <span className="text-emerald-500">{stat.change}</span>
            </p>
          </div>
        ))}
      </div>

      {/* --- Main Content: Pending Analysis Requests --- */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pending Analysis Requests</h2>
          <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Patient</th>
                <th className="p-4 font-semibold">Age</th>
                <th className="p-4 font-semibold">Submitted</th>
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {pendingRequests.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-300 font-bold">
                        {patient.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{patient.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{patient.age}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{patient.submitted}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(patient.priority)}`}>
                      {patient.priority}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-700 dark:hover:text-blue-300">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Overview;