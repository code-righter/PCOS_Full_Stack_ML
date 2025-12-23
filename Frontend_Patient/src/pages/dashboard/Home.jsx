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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* --- 1. WELCOME CARD --- */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-center min-h-62.5">
          {!firstName ? (
            // Loading State: Skeleton
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-slate-200 rounded-lg w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          ) : (
            // Loaded State
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                Welcome back, {firstName}
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed">
                Your health dashboard is ready. You can track your recent tests and view requests below.
              </p>
            </div>
          )}
        </div>

        {/* --- 2. CLEAN CALENDAR --- */}
        <div className="bg-purple-50/30 rounded-3xl p-6 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-800">Calendar</h3>
            <div className="flex gap-2 bg-white rounded-full p-1 shadow-xs border border-purple-100">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 rounded-full transition text-slate-500">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-slate-700 w-24 text-center flex items-center justify-center">
                {monthNames[currentDate.getMonth()].slice(0,3)} {currentDate.getFullYear()}
              </span>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 rounded-full transition text-slate-500">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-y-2 justify-items-center">
            {renderCalendarDays()}
          </div>
        </div>
      </div>

      {/* --- 3. REQUEST TABLE --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-xl text-slate-800">Previous Doctor Requests</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-4 w-24">Sr No</th>
                <th className="px-6 py-4">Day – Date</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loadingDashboard ? (
                 // Loading Skeletons
                 [1, 2, 3].map(i => (
                   <tr key={i} className="animate-pulse">
                     <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-8"></div></td>
                     <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                     <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                     <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                     <td className="px-6 py-5"></td>
                   </tr>
                 ))
              ) : requests.length > 0 ? (
                requests.map((req, index) => (
                  <tr key={req.id || index} className="hover:bg-blue-50/30 transition duration-150">
                    {/* Sr No is Index + 1 */}
                    <td className="px-6 py-5 font-semibold text-slate-500">
                      {index + 1}
                    </td>
                    
                    {/* Day - Date */}
                    <td className="px-6 py-5 font-medium text-slate-900">
                      {formatDate(req.createdAt)}
                    </td>
                    
                    {/* Submitted Time Ago */}
                    <td className="px-6 py-5 flex items-center gap-2 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo(req.createdAt)}
                    </td>
                    
                    {/* Status Badge */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                        req.status === 'PENDING' 
                          ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    
                    {/* Action */}
                    <td className="px-6 py-5 text-right">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline">
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center opacity-60">
                       <FileText className="w-12 h-12 text-slate-300 mb-3" />
                       <p className="text-lg font-medium">No requests found</p>
                       <p className="text-sm">Your history is currently empty.</p>
                    </div>
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