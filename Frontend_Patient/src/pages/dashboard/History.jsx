import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Activity, FileText, User, Weight, 
  Ruler, Brain, Thermometer, Heart, Droplet, Wind, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { usePatient } from '../../contexts/PatientContext'; // Check path
import { patientService } from '../../services/patientService';

const History = () => {
  const { patientData } = usePatient();
  const [history, setHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Mocking the API response structure based on your requirements
        // In real app: const data = await patientService.getHistory();
        
        // MOCK DATA FOR DEMO
        const mockData = [
          {
            id: '1',
            date: '2025-12-23T09:30:00',
            status: 'Completed',
            vitals: { heartRate: 72, spo2: 98, temp: 98.6, bp: '118/76', resp: 16, sugar: 92 },
            mlResult: { prediction: 'Normal', confidence: 98.5, riskLevel: 'Low' },
            diagnosis: 'Patient presents with stable vital signs. Physiological parameters within healthy range.',
            notes: 'Regular menstrual cycle observed. Advised to maintain current diet and exercise routine.'
          },
          {
            id: '2',
            date: '2025-12-15T14:15:00',
            status: 'Review Needed',
            vitals: { heartRate: 88, spo2: 96, temp: 99.1, bp: '130/85', resp: 18, sugar: 110 },
            mlResult: { prediction: 'PCOS Risk Detected', confidence: 82.4, riskLevel: 'Medium' },
            diagnosis: 'Slight elevation in BP and heart rate. ML model indicates potential hormonal imbalance markers.',
            notes: 'Patient reported irregular cycle length (34 days). Recommended follow-up bloodwork.'
          },
          {
            id: '3',
            date: '2025-11-28T10:00:00',
            status: 'Completed',
            vitals: { heartRate: 70, spo2: 99, temp: 98.4, bp: '120/80', resp: 16, sugar: 95 },
            mlResult: { prediction: 'Normal', confidence: 96.0, riskLevel: 'Low' },
            diagnosis: 'Routine checkup. No concerns identified.',
            notes: 'Weight gain of 1kg noted since last visit.'
          }
        ];
        
        setHistory(mockData);
        if (mockData.length > 0) setSelectedReport(mockData[0]);
        
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // --- HELPER FUNCTIONS ---
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const getDaysAgo = (dateString) => {
    const diff = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'Today' : `${diff} days ago`;
  };

  if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading patient history...</div>;

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* --- LEFT SIDEBAR: TIMELINE --- */}
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-y-auto h-full">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Patient History
        </h2>
        
        <div className="space-y-0 relative">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>

          {history.map((item) => {
            const isSelected = selectedReport?.id === item.id;
            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedReport(item)}
                className={`relative z-10 flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                  isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                {/* Timeline Dot */}
                <div className={`w-3 h-3 mt-1.5 rounded-full border-2 shrink-0 transition-colors ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-200' 
                    : 'bg-slate-300 border-white group-hover:bg-blue-400'
                }`}></div>

                {/* Content */}
                <div>
                  <h4 className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                    {formatDate(item.date)}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getDaysAgo(item.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- RIGHT SIDE: REPORT DETAILS --- */}
      <div className="lg:col-span-9 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
        {selectedReport ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Medical Report</h1>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedReport.date)} at {formatTime(selectedReport.date)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                selectedReport.status === 'Completed' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {selectedReport.status}
              </span>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              
              {/* 1. PATIENT DEMOGRAPHICS (Read-only from current context usually, or snapshot) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <InfoItem icon={User} label="Age" value="24 Years" />
                <InfoItem icon={Weight} label="Weight" value={selectedReport.vitals.weight || "68 kg"} />
                <InfoItem icon={Ruler} label="Height" value={selectedReport.vitals.height || "165 cm"} />
                <InfoItem icon={Activity} label="Cycle Length" value="28 Days" />
              </div>

              {/* 2. ML MODEL RESULT CARD (New Requirement) */}
              <div className={`rounded-2xl p-6 border flex items-center gap-6 shadow-sm relative overflow-hidden ${
                selectedReport.mlResult.riskLevel === 'Low' 
                  ? 'bg-linear-to-br from-emerald-50 to-teal-50 border-emerald-100' 
                  : 'bg-linear-to-br from-amber-50 to-orange-50 border-amber-100'
              }`}>
                {/* Background Decor */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 ${
                   selectedReport.mlResult.riskLevel === 'Low' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></div>

                {/* Icon Box */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                   selectedReport.mlResult.riskLevel === 'Low' 
                     ? 'bg-white text-emerald-600' 
                     : 'bg-white text-amber-600'
                }`}>
                  <Brain className="w-8 h-8" />
                </div>

                {/* Text Content */}
                <div className="flex-1 z-10">
                  <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${
                     selectedReport.mlResult.riskLevel === 'Low' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    AI Analysis Result
                  </h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-extrabold text-slate-800">
                      {selectedReport.mlResult.prediction}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      Confidence: {selectedReport.mlResult.confidence}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedReport.mlResult.riskLevel === 'Low' 
                      ? 'No significant anomalies detected in physiological patterns.'
                      : 'Patterns suggest potential hormonal irregularities. Clinical correlation advised.'}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="z-10 hidden sm:block">
                   {selectedReport.mlResult.riskLevel === 'Low' 
                     ? <CheckCircle2 className="w-10 h-10 text-emerald-400 opacity-50" />
                     : <AlertCircle className="w-10 h-10 text-amber-400 opacity-50" />
                   }
                </div>
              </div>

              {/* 3. VITAL SIGNS GRID */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Vital Signs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <VitalCard 
                    label="Heart Rate" 
                    value={`${selectedReport.vitals.heartRate} bpm`} 
                    icon={Heart} color="text-rose-500" bg="bg-rose-50" 
                  />
                  <VitalCard 
                    label="SpO2" 
                    value={`${selectedReport.vitals.spo2}%`} 
                    icon={Wind} color="text-sky-500" bg="bg-sky-50" 
                  />
                  <VitalCard 
                    label="Temperature" 
                    value={`${selectedReport.vitals.temp}°F`} 
                    icon={Thermometer} color="text-orange-500" bg="bg-orange-50" 
                  />
                  <VitalCard 
                    label="Blood Pressure" 
                    value={selectedReport.vitals.bp} 
                    icon={Activity} color="text-indigo-500" bg="bg-indigo-50" 
                  />
                  <VitalCard 
                    label="Respiration" 
                    value={`${selectedReport.vitals.resp}/min`} 
                    icon={Wind} color="text-teal-500" bg="bg-teal-50" 
                  />
                  <VitalCard 
                    label="Blood Sugar" 
                    value={`${selectedReport.vitals.sugar} mg/dL`} 
                    icon={Droplet} color="text-purple-500" bg="bg-purple-50" 
                  />
                </div>
              </div>

              {/* 4. DIAGNOSIS & NOTES */}
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                   <h3 className="text-blue-800 font-bold mb-3 flex items-center gap-2">
                     <FileText className="w-4 h-4" /> Diagnosis
                   </h3>
                   <p className="text-slate-700 text-sm leading-relaxed">
                     {selectedReport.diagnosis}
                   </p>
                 </div>
                 
                 <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100">
                   <h3 className="text-amber-800 font-bold mb-3 flex items-center gap-2">
                     <FileText className="w-4 h-4" /> Clinical Notes
                   </h3>
                   <p className="text-slate-700 text-sm leading-relaxed">
                     {selectedReport.notes}
                   </p>
                 </div>
              </div>

            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Calendar className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a date from the timeline to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const VitalCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default History;