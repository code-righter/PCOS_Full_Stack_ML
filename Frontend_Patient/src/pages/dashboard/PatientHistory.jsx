import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Ruler, Weight, Activity, 
  Heart, Thermometer, Droplet, Wind, FileText, 
  AlertCircle, Brain, Hourglass, 
  ArrowBigUp
} from 'lucide-react';
import { patientService } from '../../services/patientService';

// --- SUB-COMPONENTS ---

const SidebarItem = ({ item, isSelected, onClick }) => {
  // Calculate Time Ago
  const getTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  };

  return (
    <div className="relative pl-6 py-2">
      {/* Timeline Line */}
      <div className="absolute left-2.25 top-0 bottom-0 w-0.5 bg-gray-100"></div>
      
      {/* Timeline Dot */}
      <div 
        className={`absolute left-[4px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 z-10 transition-colors ${
          isSelected 
            ? 'bg-blue-600 border-blue-200' 
            : 'bg-gray-200 border-white'
        }`}
      ></div>

      <button
        onClick={onClick}
        className={`w-full text-left p-3 rounded-xl transition-all duration-200 border ${
          isSelected 
            ? 'bg-blue-50 border-blue-100 shadow-sm' 
            : 'hover:bg-gray-50 border-transparent'
        }`}
      >
        <h4 className={`text-sm font-bold ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </h4>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{getTimeAgo(item.createdAt)}</span>
        </div>
      </button>
    </div>
  );
};

const InfoField = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-gray-400">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-700">{value || '--'}</p>
    </div>
  </div>
);

const SensorDataCard = ({ label, value, unit, icon: Icon }) => (
  <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 border border-gray-100">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-gray-800">{value !== undefined && value !== null ? value : '--'}</span>
        <span className="text-xs text-gray-500 font-medium">{unit}</span>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const PatientHistory = () => {
  const [history, setHistory] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null); // Stores the root "patient" object
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // API Call
        const response = await patientService.getHistory();
        
        // Response Structure: { patient: {...}, timeline: [...], totalRecords: 1 }
        // Note: Check if your axios interceptor returns response.data or just response
        const data = response.data || response; 

        if (data) {
            setPatientProfile(data.patient);
            setHistory(data.timeline || []);
            
            if (data.timeline && data.timeline.length > 0) {
                setSelectedReport(data.timeline[0]);
            }
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Retrieving medical records...</p>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">No Medical History Found</h3>
        <p className="text-sm text-gray-500 mt-1">Previous test reports will appear here.</p>
      </div>
    );
  }

  // --- SAFE DATA EXTRACTION ---
  const report = selectedReport || {};
  const sensors = report.sensorData || {};
  const ml = report.mlResult; // Can be null
  const doctorReport = report.doctorReport; // Can be null

  // Format Dates
  const reportDate = new Date(report.createdAt);
  const dateStr = reportDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = reportDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* --- LEFT SIDEBAR: TIMELINE --- */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full min-h-[600px]">
          <h3 className="font-bold text-lg text-gray-800 mb-6 px-2">Patient History</h3>
          <div className="space-y-1">
            {history.map((item) => (
              <SidebarItem 
                key={item.id} 
                item={item} 
                isSelected={selectedReport?.id === item.id}
                onClick={() => setSelectedReport(item)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- RIGHT CONTENT: REPORT --- */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[800px]">
          
          {/* 1. Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical Report</h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{dateStr}</span>
                <span className="text-gray-300">•</span>
                <span>{timeStr}</span>
              </div>
            </div>
            
            {/* Status Badge */}
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
              report.status === 'COMPLETED' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-blue-50 text-blue-700 border-blue-100'
            }`}>
              {report.status}
            </span>
          </div>

          {/* 2. Patient Information */}
          <div className="mb-10">
            <h4 className="text-sm font-bold text-gray-900 mb-5">Patient Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
              {/* Static info from root profile, Dynamic info from this specific test */}
              <InfoField icon={User} label="Name" value={patientProfile?.name} />
              <InfoField icon={Calendar} label="Age" value={patientProfile?.age ? `${patientProfile.age} years` : null} />
              <InfoField icon={Weight} label="Weight" value={sensors.weight ? `${sensors.weight} kg` : null} />
              <InfoField icon={Ruler} label="Height" value={sensors.height ? `${sensors.height} cm` : null} />
              <InfoField icon={Activity} label="Cycle Type" value={patientProfile?.cycleType} />
              <InfoField icon={Calendar} label="Last Period" value="--" /> {/* Not in JSON, placeholder */}
            </div>
          </div>

          {/* 3. SensorData Signs */}
          <div className="mb-10">
            <h4 className="text-sm font-bold text-gray-900 mb-5">Sensor Data </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SensorDataCard icon={ArrowBigUp} label="Heart Rate" value={sensors.height} unit="cm" />
              <SensorDataCard icon={Weight} label="Heart Rate" value={sensors.weight} unit="cm" />
              <SensorDataCard icon={Heart} label="Heart Rate" value={sensors.heartRate} unit="bpm" />
              <SensorDataCard icon={Wind} label="SpO2" value={sensors.spo2} unit="%" />
              <SensorDataCard icon={Thermometer} label="Temperature" value={sensors.temperature} unit="°C" />
            </div>
          </div>

          {/* 4. Diagnosis & AI Analysis */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Doctor's Diagnosis</h4>
            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">
              
              {/* A. Manual Diagnosis Text */}
              {doctorReport ? (
                  <>
                    <p className="text-gray-700 text-sm leading-relaxed mb-6">
                        {doctorReport.diagnosis || "No specific diagnosis recorded."}
                    </p>
                  </>
              ) : (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                      <Hourglass className="w-4 h-4" />
                      <em>Doctor's review is pending.</em>
                  </div>
              )}

              {/* B. Embedded AI Card */}
              {ml ? (
                <div className="bg-white border border-blue-100 rounded-lg p-4 flex items-start gap-4 shadow-sm">
                  <div className={`mt-1 p-2 rounded-lg ${
                    ml.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                        AI Model Analysis
                      </h5>
                      {ml.riskLevel && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            ml.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                            Risk Level: {ml.riskLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      Prediction: {ml.prediction || "Analysis Complete"}
                    </p>
                    {ml.confidence && (
                        <p className="text-xs text-gray-500 mt-1">
                        Confidence Score: <span className="font-medium text-gray-700">{ml.confidence}%</span>
                        </p>
                    )}
                  </div>
                </div>
              ) : (
                // Empty State for ML
                <div className="bg-white border border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Brain className="w-4 h-4" />
                    <span>AI Analysis in progress or not available.</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. Clinical Notes */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">Clinical Notes</h4>
            <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-6">
               {doctorReport && doctorReport.notes ? (
                 <p className="text-sm text-gray-700 leading-relaxed">
                   {doctorReport.notes}
                 </p>
               ) : (
                 <p className="text-sm text-gray-400 italic">No additional clinical notes available.</p>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientHistory;