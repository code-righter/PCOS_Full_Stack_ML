import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Clock } from 'lucide-react';
import { usePatient } from '../../contexts/PatientContext'; 
import { patientService } from '../../services/patientService';

const Home = () => {
  // 1. Context Data
  const { patientData } = usePatient();
  
  // 2. Local State
  const [requests, setRequests] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- API CALLS ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);
        // Only fetching test requests now, cycle info removed
        const requestsData = await patientService.getPendingRequests();
        console.log(requestsData)
        setRequests(requestsData?.data || []); // Accessing .data array based on your JSON image
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- HELPER FUNCTIONS ---

  // robust "Time Ago" calculator
  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    if (interval === 1) return "1 day ago";
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";
    if (interval === 1) return "1 hour ago";
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " mins ago";
    
    return "Just now";
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate); 
    const days = [];
    const today = new Date();

    // Map request dates for markers
    const requestDays = requests.map(r => new Date(r.createdAt).getDate());
    const requestMonth = requests.length > 0 ? new Date(requests[0].createdAt).getMonth() : -1;

    // Empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    // Actual Days
    for (let d = 1; d <= daysInMonth; d++) {
      // Check if this day is "Today"
      const isToday = d === today.getDate() && 
                      currentDate.getMonth() === today.getMonth() && 
                      currentDate.getFullYear() === today.getFullYear();

      // Check if this day has a request
      const isRequestDay = requestDays.includes(d) && 
                           currentDate.getMonth() === requestMonth;

      days.push(
        <div key={d} className="flex flex-col items-center justify-center h-10 w-10 relative group">
          <button className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium transition
            ${isToday 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-700 hover:bg-slate-100'
            }`}>
            {d}
          </button>
          
          {/* Simple Pink Dot for Request Day */}
          {isRequestDay && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-pink-500 ring-2 ring-white"></span>
          )}
        </div>
      );
    }
    return days;
  };

  const firstName = patientData?.data?.name?.split(' ')[0];

  return (
    <div className="space-y-6">

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Card */}
        <div className="lg:col-span-2 bg-white border border-slate-300 rounded-lg p-6">
          {!firstName ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-slate-900">
                Welcome back, {firstName}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Track your recent tests and review doctor requests below.
              </p>
            </>
          )}
        </div>

        {/* Calendar */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Calendar
            </h3>

            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-medium text-slate-600 w-20 text-center">
                {monthNames[currentDate.getMonth()].slice(0,3)} {currentDate.getFullYear()}
              </span>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-slate-400 mb-2">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-y-1 justify-items-center">
            {renderCalendarDays()}
          </div>
        </div>
      </div>

      {/* REQUEST TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">
            Previous Doctor Requests
          </h2>
        </div>

        <div className="overflow-x-auto text-center">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-500 text-center">
              <tr>
                <th className="px-6 py-3 ">Sr No</th>
                <th className="px-6 py-3">Day – Date</th>
                <th className="px-6 py-3">Submitted</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loadingDashboard ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-6 bg-slate-200 rounded"/></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded"/></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded"/></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded"/></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : requests.length ? (
                requests.map((req, index) => (
                  <tr key={req.id || index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1 text-center">
                      <Clock size={12} />
                      {timeAgo(req.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[11px] font-medium rounded-full ${
                        req.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:underline text-sm">
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    <FileText className="mx-auto mb-2 text-slate-300" size={32} />
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;