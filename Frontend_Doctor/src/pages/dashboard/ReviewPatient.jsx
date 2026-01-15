import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDoctor } from "../../context/DoctorContext";
import { doctorService } from "../../services/DoctorService";
import {
  ArrowLeft,
  FileText,
  Activity,
  Brain,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  Thermometer,
  User,
  Clock
} from "lucide-react";

const ReviewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pendingPatients } = useDoctor();

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [report, setReport] = useState({
    verdict: "",
    prescription: "",
    status: "Followup"
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    const pendingRequest = pendingPatients?.find(p => p.id === id);
    console.log(pendingPatients)
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getPatientInfoByEmail(id, report);
        setResponse(res.data || res);
      } catch (err) {
        console.error(err);
        showToast("Failed to load patient data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await doctorService.updatePatientReport(email, report);
      showToast("Report submitted successfully", "success");
      setTimeout(() => navigate("/review"), 1000);
    } catch(err) {
      console.log(err)
      showToast("Submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500 gap-2">
        <Loader2 className="animate-spin" /> Loading Patient Data...
      </div>
    );
  }

  if (!response) {
    return (
      <div className="p-20 text-center text-slate-500">
        Patient record not found.
      </div>
    );
  }

  /* ================= DATA NORMALIZATION (ONLY LOGIC CHANGE) ================= */

  const { analysis, testData = {}, mlResult = {} } = response;

  const detected = mlResult.prediction !== "NO_PCOS";
  const confidencePct = mlResult.confidenceScore
    ? (mlResult.confidenceScore * 100).toFixed(2)
    : 0;

  const bmi =
    testData.weight && testData.height
      ? (testData.weight / ((testData.height / 100) ** 2)).toFixed(1)
      : "N/A";

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6 pb-20 relative font-sans text-white">

      {/* TOAST */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-lg shadow-xl border flex items-center gap-3 ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Review Patient Analysis
          </h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            ID: {analysis.analysisId.slice(0, 8)} • Doctor:{" "}
            {analysis.doctorName || "—"}
          </p>
        </div>
      </div>

      {/* SNAPSHOT */}
      <div className="bg-slate-800 text-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 text-base uppercase tracking-wider">
            <Activity className="w-4 h-4 text-blue-600" /> Clinical Data Snapshot
          </h3>
        </div>

        <div className="overflow-x-auto">
          <div className="flex p-6 gap-6 min-w-max justify-between">

            <SubsectionCard title="Cycle Information" icon={<Clock size={16} />}>
              <DataRow label="Cycle Type" value={testData.cycleType} />
              <DataRow
                label="Cycle Length"
                value={`${testData.cycleLength || "--"} days`}
              />
            </SubsectionCard>

            <Divider />

            <SubsectionCard title="Vitals & Body" icon={<Thermometer size={16} />}>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <DataRow label="Heart Rate" value={`${testData.heartRate || "--"} bpm`} />
                <DataRow label="SpO₂" value={`${testData.spo2 || "--"}%`} />
                <DataRow label="Temp" value={`${testData.temperature || "--"}°C`} />
                <DataRow label="BMI" value={bmi} />
                <DataRow label="Height" value={`${testData.height || "--"} cm`} />
                <DataRow label="Weight" value={`${testData.weight || "--"} kg`} />
              </div>
            </SubsectionCard>

            <Divider />

            <SubsectionCard title="Lifestyle Indicators" icon={<User size={16} />}>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <DataRow label="Weight Gain" value={testData.weightGain ? "Yes" : "No"} highlight={testData.weightGain} />
                <DataRow label="Hair Growth" value={testData.hairGrowth ? "Yes" : "No"} highlight={testData.hairGrowth} />
                <DataRow label="Skin Darkening" value={testData.skinDarkening ? "Yes" : "No"} highlight={testData.skinDarkening} />
                <DataRow label="Fast Food" value={testData.fastFood ? "Yes" : "No"} warning={testData.fastFood} />
              </div>
            </SubsectionCard>

          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* DIAGNOSIS */}
        <div className="bg-slate-800 rounded-xl shadow-sm border p-6">
          <h3 className="text-base font-bold mb-4 uppercase tracking-wide">
            <CheckCircle className="inline w-4 h-4 mr-2 text-blue-600" />
            Diagnosis
          </h3>
          <textarea
            className="w-full h-40 p-4 rounded-lg border bg-slate-800 resize-none"
            value={report.verdict}
            onChange={(e) =>
              setReport({ ...report, verdict: e.target.value })
            }
          />
        </div>

        {/* AI */}
        <div className="bg-slate-800 rounded-xl shadow-sm border p-6">
          <h3 className="text-base font-bold mb-4 uppercase tracking-wide flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            AI Diagnostic Assistant
          </h3>

          <div
            className={`p-4 rounded-lg border-l-4 ${
              detected
                ? "bg-slate-700 border-red-500"
                : "bg-slate-700 border-green-500"
            }`}
          >
            <div className="flex items-center gap-3 mb-1">
              {detected ? (
                <AlertCircle className="text-red-600" size={24} />
              ) : (
                <CheckCircle className="text-green-600" size={24} />
              )}
              <span className="text-lg font-bold">
                {detected ? "High Likelihood of PCOS" : "Low Risk Detected"}
              </span>
            </div>

            <div className="text-3xl font-bold mt-2">
              {confidencePct}
              <span className="text-base font-normal text-slate-400">%</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Confidence Score
            </div>
          </div>
        </div>

        {/* MEDICATION */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl shadow-sm border p-6">
          <h3 className="text-base font-bold mb-4 uppercase tracking-wide">
            <FileText className="inline w-4 h-4 mr-2 text-teal-600" />
            Medication & Advice
          </h3>
          <textarea
            className="w-full h-48 p-4 rounded-lg border bg-slate-800 resize-none"
            value={report.prescription}
            onChange={(e) =>
              setReport({ ...report, prescription: e.target.value })
            }
          />
        </div>

        {/* SUBMIT */}
        <div className="lg:col-span-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 font-bold text-sm transition-all bg-blue-600 hover:bg-blue-700 text-white"
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

/* ========== UI SUB COMPONENTS (UNCHANGED) ========== */

const Divider = () => (
  <div className="w-px bg-slate-100 h-auto" />
);

const SubsectionCard = ({ title, icon, children }) => (
  <div className="min-w-[280px]">
    <h4 className="flex items-center text-white gap-2 text-xs font-bold  uppercase tracking-wider mb-4">
      {icon} {title}
    </h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const DataRow = ({ label, value, highlight, warning }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-white">{label}</span>
    <span
      className={`font-medium ${
        highlight
          ? "text-white"
          : warning
          ? "text-white"
          : "text-white"
      }`}
    >
      {value}
    </span>
  </div>
);

export default ReviewPatient;
