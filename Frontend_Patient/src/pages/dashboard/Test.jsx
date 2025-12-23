import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, Activity, Lock, Wifi } from 'lucide-react';
import { testService } from '../../services/testService'; // Import the new service

const Test = () => {

  // Form State
  const [formData, setFormData] = useState({
    height: '', weight: '', heartRate: '', spo2: '', temperature: ''
  });

  // Hardware Sync State
  const [securityCode, setSecurityCode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle | waiting | connected | error
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref to manage polling interval
  const pollingRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  // --- 1. GENERATE CODE & START POLLING ---
  const handleGenerateCode = async () => {
    setIsLoading(true);
    setConnectionStatus('waiting');
    setFormData({ height: '', weight: '', heartRate: '', spo2: '', temperature: ''}); // Clear old data

    try {
      const data = await testService.generateCode();
      setSecurityCode(data.code); // Store the code (e.g., "829301")
      
      // Start polling immediately
      startPolling(data.code);
    } catch (error) {
      console.error("Failed to generate code", error);
      setConnectionStatus('error');
      alert("Failed to generate code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. POLLING LOGIC ---
  const startPolling = (code) => {
    stopPolling(); // Clear existing if any

    // Check every 3 seconds
    pollingRef.current = setInterval(async () => {
      try {
        console.log(`Checking status for code: ${code}...`);
        const result = await testService.checkStatus(code);

        console.log(result)

        if (result.data) {
          // STOP Polling - We got the data!
          stopPolling();
          setConnectionStatus('connected');
          
          // Auto-fill form (Mapping backend keys to frontend keys)
          setFormData({
            height: result.data.height || '',
            weight: result.data.weight || '',
            heartRate: result.data.heartRate || '',
            spo2: result.data.spo2 || '',
            temperature: result.data.temperature || '',
          });
          
        }
      } catch (error) {
        // Silent fail on polling errors (keep trying)
        console.warn("Polling check failed", error);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // --- 3. FINAL SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (connectionStatus !== 'connected') {
      alert("Please wait for hardware data before submitting.");
      return;
    }

    const fullPayload = {
      code : securityCode
    };

    try {
      await testService.submitFullReport(fullPayload);
      alert('Report sent to doctor successfully!');
      // Reset flow
      setSecurityCode(null);
      setConnectionStatus('idle');
      setFormData({ height: '', weight: '', pulse: '', spo2: '', temp: '', additional: '' });
    } catch (error) {
      alert("Failed to send report.");
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Submit Health Test Data</h2>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
            <h3 className='text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide'>Instructions:</h3>
            <ul className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
               <li>Turn on the hardware kit and connect to WiFi.</li>
               <li>Take all the readings using the sensors.</li>
               <li>Click <b>"Generate Security Code"</b> below.</li>
               <li>Enter the 6-digit code into your hardware kit </li>
               <li>Send the data & wait for confirmation on hardware screen.</li>
               <li>Wait for the data to appear on this screen automatically.</li>
            </ul>
          </div>
        </div>

        {/* --- SECURITY CODE SECTION --- */}
        <div className='flex flex-col items-center justify-center py-6 mb-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300'>
          
          {!securityCode ? (
            <button 
              onClick={handleGenerateCode}
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? <RefreshCw className="animate-spin w-5 h-5"/> : <Lock className="w-5 h-5" />}
              Generate Security Code
            </button>
          ) : (
            <div className="text-center animate-in zoom-in duration-300">
               <p className="text-sm text-gray-500 mb-2 font-medium">Enter this code on your device:</p>
               <div className="text-5xl font-mono font-bold text-indigo-600 tracking-widest bg-white px-8 py-4 rounded-xl shadow-sm border border-indigo-100">
                 {securityCode}
               </div>
               
               {/* Status Indicator */}
               <div className="mt-4 flex items-center justify-center gap-2">
                 {connectionStatus === 'waiting' && (
                   <>
                     <span className="relative flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                     </span>
                     <span className="text-sm text-sky-600 font-medium animate-pulse">Waiting for device connection...</span>
                   </>
                 )}
                 {connectionStatus === 'connected' && (
                   <>
                     <Wifi className="w-5 h-5 text-emerald-500" />
                     <span className="text-sm text-emerald-600 font-bold">Data Received & Verified!</span>
                   </>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* --- FORM SECTION --- */}
        <form onSubmit={handleSubmit} className={`space-y-6 transition-opacity duration-500 ${connectionStatus === 'idle' ? 'opacity-50 pointer-events-none filter blur-[1px]' : 'opacity-100'}`}>
           
           <div className="grid md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                <input 
                  readOnly
                  type="number" 
                  value={formData.height} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
                  placeholder="Waiting for data..."
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (KG)</label>
                <input 
                  readOnly
                  type="number" 
                  value={formData.weight} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
                  placeholder="Waiting for data..."
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pulse Rate (bpm)</label>
                <div className="relative">
                  <Activity className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input 
                    readOnly
                    type="number" 
                    value={formData.heartRate} 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
                    placeholder="---"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">SpO2 (%)</label>
                <input 
                  readOnly
                  type="number" 
                  value={formData.spo2} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
                  placeholder="---"
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Temperature (°C)</label>
                <input 
                  readOnly
                  type="number" 
                  value={formData.temperature} 
                  className="w-full px-4 py-3 font-bold bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
                  placeholder="---"
                />
             </div>
           </div>
           
           {/* Additional Info is typically manual, but you requested readOnly for all "info it has got". 
               I'll leave this editable in case the patient wants to add notes manually? 
               If strictly readOnly, add the prop. */}
           <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.additional}
              onChange={(e) => setFormData({...formData, additional: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              placeholder="You can add manual notes here before submitting..."
            />
           </div>

           <button 
            type="submit" 
            disabled={connectionStatus !== 'connected'}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Send className="w-5 h-5" />
             Submit Full Report
           </button>
        </form>
    </div>
  );
};

export default Test;