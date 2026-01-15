import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  HeartPulse,
  Thermometer,
  Gauge,
  ShieldCheck,
  Wifi,
  Send,
  RefreshCw,
  Lock,
  Loader2 // Imported Loader icon
} from "lucide-react";
import { testService } from "../../services/testService";
import { useToast } from "../../contexts/ToastContext";

const ReadOnlyMetric = ({ icon: Icon, label, value, unit }) => (
  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="w-5 h-5 text-indigo-600" />
      <p className="text-xs font-medium text-slate-600">{label}</p>
    </div>
    <p className="text-xl font-semibold text-slate-900">
      {value || "—"}{" "}
      {value && <span className="text-sm text-slate-500">{unit}</span>}
    </p>
  </div>
);

const Test = () => {
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    heartRate: "",
    spo2: "",
    temperature: ""
  });
  const { showToast } = useToast();

  const [securityCode, setSecurityCode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("idle"); 
  const [isLoadingCode, setIsLoadingCode] = useState(false); // Renamed for clarity
  const [isSubmitting, setIsSubmitting] = useState(false);   // New state for full-screen loader

  const pollingRef = useRef(null);

  useEffect(() => () => stopPolling(), []);

  /* -------------------------------
     STEP 1: GENERATE CODE
  -------------------------------- */
  const handleGenerateCode = async () => {
    setIsLoadingCode(true);
    setConnectionStatus("waiting");
    setFormData({ height: "", weight: "", heartRate: "", spo2: "", temperature: "" });

    try {
      const res = await testService.generateCode();
      setSecurityCode(res.code);
      startPolling(res.code);
    } catch (err) {
      showToast("Failed to generate security code", "error");
      setConnectionStatus("idle");
    } finally {
      setIsLoadingCode(false);
    }
  };

  /* -------------------------------
     STEP 2: POLLING
  -------------------------------- */
  const startPolling = (code) => {
    stopPolling();

    pollingRef.current = setInterval(async () => {
      try {
        const result = await testService.checkStatus(code);

        if (result?.data) {
          stopPolling();
          setConnectionStatus("connected");
          setFormData({
            height: result.data.height || "",
            weight: result.data.weight || "",
            heartRate: result.data.heartRate || "",
            spo2: result.data.spo2 || "",
            temperature: result.data.temperature || ""
          });
          showToast("Device connected & data received!", "success");
        }
      } catch {
        // silent retry
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  /* -------------------------------
     STEP 3: SUBMIT VERIFIED TEST
  -------------------------------- */
  const handleSubmit = async () => {
    if (connectionStatus !== "connected") {
      showToast("Waiting for verified sensor data", "warning");
      return;
    }

    // 1. Activate Full Screen Loader
    setIsSubmitting(true);

    try {
      // 2. API Call
      await testService.submitFullReport({ code: securityCode });
      
      // 3. Success Feedback
      showToast("Test data sent to doctor successfully", "success");
      
      // 4. Reset Form
      setSecurityCode(null);
      setConnectionStatus("idle");
      setFormData({ height: "", weight: "", heartRate: "", spo2: "", temperature: "" });
      
    } catch (err) {
      // 5. Error Feedback
      console.error(err);
      showToast("Failed to submit test data. Please try again.", "error");
    } finally {
      // 6. Deactivate Loader (Always runs)
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* --- FULL SCREEN BUFFERING OVERLAY --- */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-indigo-100 animate-in zoom-in-95 duration-200">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Sending Report...</h3>
            <p className="text-sm text-slate-500 mt-1">Please do not close this window.</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h1 className="text-lg font-semibold text-slate-900">
          Clinical Health Test
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          This test collects live sensor data from the connected medical device
          and securely sends it to your doctor.
        </p>
      </div>

      {/* STEP 1: SECURITY CODE */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Device Verification
        </h2>

        {!securityCode ? (
          <button
            onClick={handleGenerateCode}
            disabled={isLoadingCode || isSubmitting}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoadingCode ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Generate Security Code
          </button>
        ) : (
          <div className="flex items-center gap-6">
            <div className="text-3xl font-mono font-bold tracking-widest text-indigo-600">
              {securityCode}
            </div>

            {connectionStatus === "waiting" && (
              <div className="flex items-center gap-2 text-sky-600">
                <Wifi className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Waiting for device…</span>
              </div>
            )}

            {connectionStatus === "connected" && (
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Device verified & data received
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STEP 2: SENSOR DATA */}
      <div className={`bg-white border border-slate-200 rounded-lg p-6 transition-opacity duration-300 ${
        connectionStatus !== "connected" ? "opacity-60 pointer-events-none" : "opacity-100"
      }`}>
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Sensor Readings (Read-only)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReadOnlyMetric icon={Gauge} label="Height" value={formData.height} unit="cm" />
          <ReadOnlyMetric icon={Gauge} label="Weight" value={formData.weight} unit="kg" />
          <ReadOnlyMetric icon={HeartPulse} label="Heart Rate" value={formData.heartRate} unit="bpm" />
          <ReadOnlyMetric icon={Activity} label="SpO₂" value={formData.spo2} unit="%" />
          <ReadOnlyMetric icon={Thermometer} label="Temperature" value={formData.temperature} unit="°C" />
        </div>
      </div>

      {/* STEP 3: SUBMIT */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <button
          onClick={handleSubmit}
          disabled={connectionStatus !== "connected" || isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
             <>
               <Loader2 className="w-4 h-4 animate-spin" />
               Processing...
             </>
          ) : (
             <>
               <Send className="w-4 h-4" />
               Submit Verified Test Report
             </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Test;