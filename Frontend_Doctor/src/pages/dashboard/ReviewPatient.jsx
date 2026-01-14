import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import {doctorService} from '../../services/DoctorService'; 
import { 
  ArrowLeft, FileText, Stethoscope, Send, Calendar, X, 
  Activity, Brain, HeartPulse, CheckCircle, AlertTriangle 
} from 'lucide-react';

const ReviewPatient = () => {
  const { id } = useParams(); // This is the analysisId (e.g. "9218...")
  const navigate = useNavigate();
  const { pendingPatients } = useDoctor();

  // --- Local State ---
  const [fullResponse, setFullResponse] = useState(null); // Stores { patient, timeline }
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null); // The specific record we are viewing
  const [isHistoryView, setIsHistoryView] = useState(false); // Toggle between "Current" and "Past" views

  // --- Form State ---
  const [report, setReport] = useState({
    verdict: '',
    prescription: '',
    status: 'Followup',
  });

  // --- 1. Find Email & Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      // Find the email from the Pending List using the analysis ID
      const pendingRequest = pendingPatients?.find(p => p.id === id);
      console.log(`Pending Request Check`, pendingPatients)
      // Fallback: If page reloaded and context is empty, we might need another way or just wait
      // For now, we assume context is populated or we fail gracefully
      const email = pendingRequest?.patient?.email;
      console.log(`Email Check`, email)

      if (email) {
        try {
          setLoading(true);
          const response = await doctorService.getPatientInfoByEmail(email);
          setFullResponse(response);
    
          const current = response.data.timeline?.find(t => t.analysisId === id);
          setSelectedAnalysis(current || response.data.timeline?.[0]);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      } else if (pendingPatients?.length > 0) {
        // Only stop loading if we are sure the ID doesn't exist in the loaded list
        setLoading(false);
      }
    };

    fetchData();
  }, [id, pendingPatients]);


  // --- Helper to switch views when clicking timeline ---
  const handleTimelineClick = (analysis) => {
    setSelectedAnalysis(analysis);
    // If the clicked ID is different from the URL ID, it's history (Read Only)
    setIsHistoryView(analysis.analysisId !== id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting:", { analysisId: id, ...report });
    // await doctorService.submitReport(id, report);
    alert("Report Submitted Successfully!");
    navigate('/pending');
  };

  // --- Loading / Error States ---
  if (loading) return <div className="p-20 text-center animate-pulse">Loading Patient Data...</div>;
  if (!fullResponse || !selectedAnalysis) return <div className="p-20 text-center">Patient data not found.</div>;

  const { patient, timeline } = fullResponse;
  const { sensorData, mlResult } = selectedAnalysis;

  // Calculate BMI safely
  const bmi = (sensorData?.weight && sensorData?.height) 
    ? (sensorData.weight / ((sensorData.height/100) ** 2)).toFixed(1) 
    : 'N/A';

  return (
    <div className="max-w-6xl p-4 mx-auto space-y-6 pb-20 relative">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{patient?.data?.name || 'Patient'}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
             Age: {patient?.age || 'N/A'} • Cycle: {patient?.data?.cycleType || 'Unknown'} ({patient?.cycleLength} days)
          </p>
        </div>
      </div>

      {/* Timeline Bar */}
      {timeline?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar size={14} /> Consultation History
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {timeline.map((visit) => {
                    const isSelected = selectedAnalysis.analysisId === visit.analysisId;
                    const dateObj = new Date(visit.analysisDate);
                    return (
                        <button
                            key={visit.analysisId}
                            onClick={() => handleTimelineClick(visit)}
                            className={`flex flex-col items-center min-w-[100px] p-3 rounded-lg border transition-all ${
                                isSelected 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300' 
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <span className="text-sm font-bold">
                                {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-xs opacity-70">{dateObj.getFullYear()}</span>
                        </button>
                    )
                })}
            </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Medical Data */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Card 1: Health Data (Combines Profile + Sensor) */}
           <HealthDataCard 
              profile={patient} 
              sensor={sensorData} 
              bmi={bmi} 
              readOnly={isHistoryView} 
           />

           {/* Card 2: ML Analysis */}
           <MLAnalysisCard 
              result={mlResult} 
              readOnly={isHistoryView} 
           />
           
           {/* Card 3: Prescription (Hidden if viewing history without report) */}
           {!isHistoryView ? (
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
           ) : (
             <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Past Prescription</h3>
                <p className="text-slate-600 dark:text-slate-400 italic">
                    {selectedAnalysis.doctorReport?.prescription || "No prescription recorded for this visit."}
                </p>
             </div>
           )}
        </div>

        {/* Right Col: Verdict */}
        <div className="space-y-6">
            {!isHistoryView ? (
                <>
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

                    <StatusSelector currentStatus={report.status} setStatus={(s) => setReport({...report, status: s})} />

                    <button 
                        onClick={handleSubmit}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Send size={20} /> Submit Report
                    </button>
                </>
            ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-900/30">
                    <h3 className="font-bold text-yellow-800 dark:text-yellow-400 mb-4 flex items-center gap-2">
                        <Calendar size={18} /> Archived Report
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs font-bold text-yellow-700 uppercase">Verdict</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-1">
                                {selectedAnalysis.doctorReport?.verdict || "No verdict found."}
                            </p>
                        </div>
                        <div className="pt-4 border-t border-yellow-200 dark:border-yellow-900/30">
                             <span className="text-xs font-bold text-yellow-700 uppercase">Status</span>
                             <p className="text-slate-700 dark:text-slate-300 mt-1 font-semibold">
                                {selectedAnalysis.status}
                             </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components (Updated for new Data Structure) ---

const HealthDataCard = ({ profile, sensor, bmi, readOnly }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 ${readOnly ? 'opacity-90' : ''}`}>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" /> Vital Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoBlock label="Heart Rate" value={sensor?.heartRate ? `${sensor.heartRate} bpm` : '--'} />
            <InfoBlock label="SpO2" value={sensor?.spo2 ? `${sensor.spo2}%` : '--'} />
            <InfoBlock label="Temp" value={sensor?.temperature ? `${sensor.temperature}°C` : '--'} />
            <InfoBlock label="BMI" value={bmi} />
            <InfoBlock label="Weight" value={sensor?.weight ? `${sensor.weight} kg` : '--'} />
            <InfoBlock label="Height" value={sensor?.height ? `${sensor.height} cm` : '--'} />
            <InfoBlock label="Hip" value={profile?.hip ? `${profile.hip} in` : '--'} />
            <InfoBlock label="Waist" value={profile?.waist ? `${profile.waist} in` : '--'} />
        </div>
    </div>
);

const MLAnalysisCard = ({ result, readOnly }) => {
    // Handle case where ML hasn't run yet (null result)
    if (!result) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-slate-400" /> AI Analysis
                </h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-center text-slate-500">
                    Analysis Pending or Not Available
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 ${readOnly ? 'opacity-90' : ''}`}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-600" /> AI Prediction
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                 <div className={`px-4 py-3 w-full md:w-auto text-center rounded-lg font-bold flex items-center justify-center gap-2 border ${result.detected ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                    {result.detected ? <AlertTriangle size={20}/> : <CheckCircle size={20}/>}
                    {result.detected ? 'PCOS DETECTED' : 'LOW RISK'}
                </div>
                <div className="text-sm text-slate-500">
                    Confidence: <span className="font-bold text-slate-900 dark:text-white">{result.confidence || 0}%</span>
                </div>
            </div>
        </div>
    );
};

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

export default ReviewPatient;