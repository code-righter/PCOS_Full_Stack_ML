import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import { doctorService } from '../../services/DoctorService'; 
import { 
  ArrowLeft, FileText, Activity, Brain, CheckCircle, 
  AlertCircle, ChevronRight, Loader2, Thermometer, 
  Heart, User, Scale, Clock, Utensils
} from 'lucide-react';

const ReviewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pendingPatients } = useDoctor();

  // --- Local State ---
  const [fullResponse, setFullResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // --- Form State ---
  const [report, setReport] = useState({
    verdict: '',
    prescription: '',
    status: 'Followup',
  });

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      const pendingRequest = pendingPatients?.find(p => p.id === id);
      const email = pendingRequest?.patient?.email;
      console.log(email)

      if (email) {
        try {
          setLoading(true);
          const response = await doctorService.getPatientInfoByEmail(email);
          setFullResponse(response);
        } catch (err) {
          console.error("Fetch error:", err);
          showToast("Failed to load patient data.", "error");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, pendingPatients]);

  // --- Helper: Toast Notification ---
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call delay or use actual service
      // await doctorService.submitReport(id, report); 
      await new Promise(resolve => setTimeout(resolve, 1500)); // Fake buffer for UX
      
      showToast("Report submitted successfully!", "success");
      
      // Navigate after short delay to let user see the success message
      setTimeout(() => {
        navigate('/review'); 
      }, 1000);
      
    } catch (error) {
      console.error(error);
      showToast("Submission failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading / Error States ---
  if (loading) return (
    <div className="flex h-screen items-center justify-center text-slate-500 gap-2">
      <Loader2 className="animate-spin" /> Loading Patient Data...
    </div>
  );
  
  if (!fullResponse) return <div className="p-20 text-center text-slate-500">Patient record not found.</div>;

  console.log(` Full Response `, fullResponse.data)

  const { patient, timeline } = fullResponse.data;
  // Get the specific analysis record matching the ID
  const currentAnalysis = timeline?.find(t => t.analysisId === id) || timeline?.[0];
  const { sensorData, mlResult } = currentAnalysis || {};

  // BMI Calculation
  const bmi = (sensorData?.weight && sensorData?.height) 
    ? (sensorData.weight / ((sensorData.height/100) ** 2)).toFixed(1) 
    : 'N/A';

    // console.log(`Patient Name `, patient.name)

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6 pb-20 relative font-sans text-slate-800 dark:text-slate-100">
      
      {/* Toast Notification Component */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-lg shadow-xl border flex items-center gap-3 animate-fade-in ${
          toast.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200' 
            : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/50 dark:border-green-800 dark:text-green-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{patient?.name || 'Unknown Patient'}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
             ID: {id?.slice(0,8)} • Age: {patient?.age || 'N/A'}
          </p>
        </div>
      </div>

      {/* --- SCROLLABLE DATA SECTION --- */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Static Title Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
           <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-base uppercase tracking-wider">
              <Activity className="w-4 h-4 text-blue-600" /> Clinical Data Snapshot
           </h3>
           
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-x-auto custom-scrollbar justify-center">
          <div className="flex p-6 gap-6 min-w-max justify-between">
            
            {/* 1. Cycle Information */}
            <SubsectionCard title="Cycle Information" icon={<Clock size={16}/>}>
                <DataRow label="Cycle Type" value={patient?.data?.cycleType || 'Regular'} />
                <DataRow label="Cycle Length" value={`${patient?.cycleLength || '--'} days`} />
            </SubsectionCard>

            <div className="w-px bg-slate-100 dark:bg-slate-700 h-auto" />

            {/* 2. Sensor Data */}
            <SubsectionCard title="Vitals & Body" icon={<Thermometer size={16}/>}>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    <DataRow label="Heart Rate" value={`${sensorData?.heartRate || '--'} bpm`} />
                    <DataRow label="SpO2" value={`${sensorData?.spo2 || '--'}%`} />
                    <DataRow label="Temp" value={`${sensorData?.temperature || '--'}°C`} />
                    <DataRow label="BMI" value={bmi} />
                    <DataRow label="Height" value={`${sensorData?.height || '--'} cm`} />
                    <DataRow label="Weight" value={`${sensorData?.weight || '--'} kg`} />
                </div>
            </SubsectionCard>

            <div className="w-px bg-slate-100 dark:bg-slate-700 h-auto" />

            {/* 3. Lifestyle Data */}
            <SubsectionCard title="Lifestyle Indicators" icon={<User size={16}/>}>
               <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {/* Using optional chaining defaults assuming these keys exist in data */}
                  <DataRow label="Weight Gain" value={patient?.data?.weightGain ? 'Yes' : 'No'} highlight={patient?.data?.weightGain} />
                  <DataRow label="Hair Growth" value={patient?.data?.hairGrowth ? 'Yes' : 'No'} highlight={patient?.data?.hairGrowth} />
                  <DataRow label="Skin Darkening" value={patient?.data?.skinDarkening ? 'Yes' : 'No'} highlight={patient?.data?.skinDarkening} />
                  <DataRow label="Fast Food" value={patient?.data?.fastFood ? 'Yes' : 'No'} warning={patient?.data?.fastFood} />
               </div>
            </SubsectionCard>

          </div>
        </div>
      </div>

      {/* --- MAIN INTERACTIVE GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN — Diagnosis + Status */}
        <div className="order-1">
            {/* Final Verdict */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wide">
                <CheckCircle className="w-4 h-4 text-blue-600" /> Diagnosis
            </h3>

            <textarea
                className="w-full h-40 p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-base transition-all mb-4"
                placeholder="Enter final diagnosis..."
                value={report.verdict}
                onChange={(e) => setReport({ ...report, verdict: e.target.value })}
            />

            {/* Patient Status — UNCHANGED */}

            </div>
        </div>

        {/* RIGHT COLUMN — AI Diagnostic Assistant */}
        <div className="order-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wide">
                <Brain className="w-4 h-4 text-purple-600" /> AI Diagnostic Assistant
            </h3>

            {!mlResult ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center text-slate-400 text-base">
                AI Analysis not available.
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className={`flex-1 w-full p-4 rounded-lg border-l-4 ${
                        mlResult.detected 
                        ? 'bg-red-50/50 border-red-500 dark:bg-red-900/10' 
                        : 'bg-green-50/50 border-green-500 dark:bg-green-900/10'
                    }`}>
                        <div className="flex items-center gap-3 mb-1">
                            {mlResult.detected 
                                ? <AlertCircle className="text-red-600" size={24}/> 
                                : <CheckCircle className="text-green-600" size={24}/>
                            }
                            <span className={`text-lg font-bold ${
                                mlResult.detected ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                            }`}>
                                {mlResult.detected ? 'High Likelihood of PCOS' : 'Low Risk Detected'}
                            </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm ml-9">
                            Based on sensor fusion and symptom analysis.
                        </p>
                    </div>
                    <div className="text-right px-4">
                        <div className="text-3xl font-bold text-slate-800 dark:text-white">{mlResult.confidence || 0}<span className="text-base font-normal text-slate-400">%</span></div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Confidence Score</div>
                    </div>
                  </div>
            )}

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="text-sm font-semibold text-slate-500 uppercase block mb-3">
                Patient Status
                </label>

                <div className="grid grid-cols-2 gap-2">
                {['Critical', 'Mild', 'Followup', 'Healthy'].map((status) => (
                    <button
                    key={status}
                    onClick={() => setReport({ ...report, status })}
                    className={`py-2 px-3 text-sm font-bold rounded border transition-all ${
                        report.status === status
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                    }`}
                    >
                    {status}
                    </button>
                ))}
                </div>
            </div>
            </div>

            
        </div>

        {/* FULL WIDTH — Medication */}
        <div className="lg:col-span-2 order-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wide">
                <FileText className="w-4 h-4 text-teal-600" /> Medication & Advice
            </h3>

            <textarea
                className="w-full h-48 p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-base leading-relaxed"
                placeholder="Write prescription here..."
                value={report.prescription}
                onChange={(e) =>
                setReport({ ...report, prescription: e.target.value })
                }
            />
            </div>
        </div>

        {/* FULL WIDTH — Submit */}
        <div className="lg:col-span-2 order-4">
            <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                isSubmitting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            >
            {isSubmitting ? (
                <>
                <Loader2 className="animate-spin" size={18} /> Processing...
                </>
            ) : (
                <>
                Submit Final Report <ChevronRight size={16} />
                </>
            )}
            </button>
        </div>
        </div>
    </div>
  );
};

// --- Sub-Components ---

const SubsectionCard = ({ title, icon, children }) => (
    <div className="min-w-[280px]">
        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            {icon} {title}
        </h4>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const DataRow = ({ label, value, highlight, warning }) => (
    <div className="flex justify-between items-center gap-x-4 text-sm">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className={`font-medium ${
            highlight ? 'text-red-600 dark:text-red-400' : 
            warning ? 'text-orange-600 dark:text-orange-400' : 
            'text-slate-800 dark:text-slate-200'
        }`}>
            {value}
        </span>
    </div>
);

export default ReviewPatient;