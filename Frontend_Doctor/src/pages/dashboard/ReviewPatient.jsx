import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import {doctorService} from '../../services/DoctorService'; 
import { 
  ArrowLeft, FileText, Stethoscope, Send, Calendar, X, 
  Activity, Brain, HeartPulse, CheckCircle, AlertTriangle 
} from 'lucide-react';

const ReviewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get global context data
  const { pendingPatients } = useDoctor();

  // --- Local State ---
  const [fullPatientData, setFullPatientData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [selectedPastReport, setSelectedPastReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestDetails, setRequestDetails] = useState(null); // Local copy of the basic request info

  // --- Form State ---
  const [report, setReport] = useState({
    verdict: '',
    prescription: '',
    status: 'Followup',
  });

  // --- EFFECT: Handle Data Fetching Robustly ---
  useEffect(() => {
    const initData = async () => {
      // 1. Try to find the patient in the global list
      // We check pendingPatients.data safely
      const foundRequest = pendingPatients?.data?.find(p => p.id === id);

      if (foundRequest) {
        setRequestDetails(foundRequest); // Save basic info (Name, Age) for the UI
        const email = foundRequest.patient?.email;

        if (email) {
          try {
            setLoading(true);
            // 2. Call the API with the email
            const response = await doctorService.getPatientInfoByEmail(email);
            
            // 3. Update State
            setFullPatientData(response.data);
            setTimeline(response.data.history || []);
          } catch (err) {
            console.error("Failed to fetch detailed patient info:", err);
          } finally {
            setLoading(false);
          }
        }
      } else {
        // If pendingPatients is loaded but ID is not found, or list is empty
        if (pendingPatients?.data?.length > 0) {
            setLoading(false); // Stop loading if we know it's not in the list
        }
      }
    };

    initData();

  }, [id, pendingPatients]); // <--- CRITICAL CHANGE: Re-run when Context updates

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Report:", { requestId: id, ...report });
    alert("Report Sent Successfully!");
    navigate('/pending');
  };

  // --- Safe Access Helper ---
  // If we are loading, show spinner. 
  // If not loading and no data found, show error.
  if (loading && !fullPatientData) {
    return <div className="p-20 text-center text-slate-500 animate-pulse">Loading Patient Data...</div>;
  }

  if (!requestDetails && !loading) {
    return (
        <div className="p-20 text-center">
            <h2 className="text-xl font-bold text-slate-700">Patient Request Not Found</h2>
            <button onClick={() => navigate('/pending')} className="mt-4 text-blue-600 hover:underline">
                Go back to list
            </button>
        </div>
    );
  }

  // Use the data we found (either from full fetch or fallback to list data)
  const patientName = requestDetails?.patient?.name || "Unknown Patient";
  const patientAge = requestDetails?.patient?.age || "N/A";
  const displayEmail = requestDetails?.patient?.email || "";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 relative">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{patientName}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {displayEmail} • Age: {patientAge}
          </p>
        </div>
      </div>

      {/* Timeline Bar */}
      {timeline.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar size={14} /> Previous Consultations
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {timeline.map((visit, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedPastReport(visit)}
                        className="flex flex-col items-center min-w-[100px] p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-slate-700 transition-all group"
                    >
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600">
                            {new Date(visit.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">{new Date(visit.date).getFullYear()}</span>
                    </button>
                ))}
            </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Patient Data & ML */}
        <div className="lg:col-span-2 space-y-6">
           {/* 1. Health Data */}
           <HealthDataCard data={fullPatientData?.latestHealthData || {}} />

           {/* 2. ML Analysis */}
           <MLAnalysisCard prediction={fullPatientData?.latestPrediction || {}} />
           
           {/* 3. Prescription Input */}
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-teal-600" /> New Prescription
            </h3>
            <textarea
              className="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Enter medication and advice..."
              value={report.prescription}
              onChange={(e) => setReport({...report, prescription: e.target.value})}
            />
          </div>
        </div>

        {/* Right Col: Verdict & Submit */}
        <div className="space-y-6">
            {/* 4. Verdict */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-blue-600" /> Final Verdict
                </h3>
                <textarea
                className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Doctor's diagnosis..."
                value={report.verdict}
                onChange={(e) => setReport({...report, verdict: e.target.value})}
                />
            </div>

            {/* 5. Status Enum */}
            <StatusSelector currentStatus={report.status} setStatus={(s) => setReport({...report, status: s})} />

            <button 
                onClick={handleSubmit}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
                <Send size={20} /> Submit Report
            </button>
        </div>
      </div>

      {/* --- PAST REPORT MODAL --- */}
      {selectedPastReport && (
        <PastReportModal report={selectedPastReport} onClose={() => setSelectedPastReport(null)} />
      )}
    </div>
  );
};

// --- Reusable Sub-Components (Paste these at the bottom of the file) ---

const HealthDataCard = ({ data, readOnly }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 ${readOnly ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" /> {readOnly ? 'Recorded Health Data' : 'Current Health Data'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoBlock label="Cycle Type" value={data.cycleType || 'Regular'} />
            <InfoBlock label="BMI" value={data.bmi || 'N/A'} />
            <InfoBlock label="Heart Rate" value={data.heartRate ? `${data.heartRate} BPM` : 'N/A'} />
            <InfoBlock label="Sleep" value={data.sleepHours ? `${data.sleepHours} hrs` : 'N/A'} />
            <InfoBlock label="Activity" value={data.activityLevel || 'N/A'} />
        </div>
    </div>
);

const MLAnalysisCard = ({ prediction, readOnly }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 ${readOnly ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-600" /> {readOnly ? 'Recorded AI Analysis' : 'AI Analysis Result'}
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-center">
             <div className={`px-4 py-3 w-full md:w-auto text-center rounded-lg font-bold flex items-center justify-center gap-2 border ${prediction.detected ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                {prediction.detected ? <AlertTriangle size={20}/> : <CheckCircle size={20}/>}
                {prediction.detected ? 'PCOS DETECTED' : 'LOW RISK'}
            </div>
            <div className="text-sm text-slate-500">
                Confidence: <span className="font-bold text-slate-900 dark:text-white">{prediction.confidence || 0}%</span>
            </div>
            {prediction.version && (
                 <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded ml-auto">
                    v{prediction.version}
                </div>
            )}
        </div>
    </div>
);

const InfoBlock = ({ label, value }) => (
    <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
        <span className="text-xs text-slate-500 block uppercase">{label}</span>
        <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
);

const StatusSelector = ({ currentStatus, setStatus }) => {
    const options = [
        { value: 'Critical', color: 'text-red-600 bg-red-50 border-red-200 ring-red-200' },
        { value: 'Mild', color: 'text-orange-600 bg-orange-50 border-orange-200 ring-orange-200' },
        { value: 'Followup', color: 'text-blue-600 bg-blue-50 border-blue-200 ring-blue-200' },
        { value: 'Healthy', color: 'text-green-600 bg-green-50 border-green-200 ring-green-200' },
    ];
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <HeartPulse className="w-5 h-5 text-pink-600" /> Patient Status
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setStatus(opt.value)}
                        className={`p-3 rounded-lg text-sm font-bold border transition-all ${
                            currentStatus === opt.value 
                            ? `${opt.color} ring-2` 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                        }`}
                    >
                        {opt.value}
                    </button>
                ))}
            </div>
        </div>
    );
};

const PastReportModal = ({ report, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center z-10">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Past Report</h2>
                    <p className="text-sm text-slate-500">
                        Date: {new Date(report.date).toLocaleDateString()}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X size={24} className="text-slate-500" />
                </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                    <HealthDataCard data={report.healthData || {}} readOnly />
                </div>
                <div className="col-span-full">
                        <MLAnalysisCard prediction={report.prediction || {}} readOnly />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <Stethoscope size={16} /> Doctor's Verdict
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {report.verdict || "No verdict recorded."}
                    </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Prescription
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {report.prescription || "No prescription recorded."}
                    </p>
                </div>
                <div className="col-span-full bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-1 flex items-center gap-2">
                        <HeartPulse size={16} /> Clinical Status: {report.status}
                    </h4>
                </div>
            </div>
        </div>
    </div>
);

export default ReviewPatient;