import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  HeartPulse,
  Thermometer,
  Activity,
  Wind,
  Brain,
  Pill,
  Stethoscope,
  AlertCircle
} from "lucide-react";
import { patientService } from "../../services/patientService";

/* --------------------------------
   LEFT TIMELINE ITEM
--------------------------------- */
const TimelineItem = ({ item, active, onClick }) => {

  const generatePDF = ({ patient, report }) => {
  const doc = new jsPDF();
  let y = 20;

  // ===== TITLE =====
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PCOS REPORT", 105, y, { align: "center" });

  y += 10;
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  // ===== PATIENT INFO =====
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text(`Patient Name: ${patient?.name || "-"}`, 20, y);
  doc.text(`Age: ${patient?.age || "-"}`, 140, y);

  y += 7;
  doc.text(`Phone Number: ${patient?.phoneNumber || "-"}`, 20, y);

  y += 10;
  doc.line(20, y, 190, y);
  y += 8;

  // ===== SENSOR + PERSONAL DATA =====
  doc.setFont("helvetica", "bold");
  doc.text("PERSONAL & SENSOR DATA", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");

  const sensors = report.sensorData || {};

  const rows = [
    ["Height (cm)", sensors.height],
    ["Weight (kg)", sensors.weight],
    ["Heart Rate (bpm)", sensors.heartRate],
    ["SpO₂ (%)", sensors.spo2],
    ["Temperature (°C)", sensors.temperature],
    ["Cycle Type", patient?.cycleType]
  ];

  rows.forEach(([label, value]) => {
    doc.text(`${label}: ${value ?? "-"}`, 25, y);
    y += 6;
  });

  y += 4;
  doc.line(20, y, 190, y);
  y += 8;

  // ===== DOCTOR VERDICT =====
  doc.setFont("helvetica", "bold");
  doc.text("DOCTOR'S VERDICT", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  const verdict =
    report.doctorReport?.diagnosis || "Doctor review pending.";

  doc.text(verdict, 25, y, { maxWidth: 160 });
  y += 20;

  // ===== PRESCRIPTION =====
  doc.setFont("helvetica", "bold");
  doc.text("PRESCRIPTION", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  const prescription =
    report.doctorReport?.prescription || "No prescription issued.";

  doc.text(prescription, 25, y, { maxWidth: 160 });

  y += 20;
  doc.line(20, y, 190, y);
  y += 6;

  // ===== FOOTER =====
  doc.setFontSize(9);
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    105,
    y,
    { align: "center" }
  );

  // ===== SAVE =====
  doc.save(`PCOS_Report_${patient?.name || "Patient"}.pdf`);
};

  const date = new Date(item.createdAt);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg border transition ${
        active
          ? "bg-indigo-50 border-indigo-200"
          : "border-transparent hover:bg-slate-50"
      }`}
    >
      <p className="text-sm font-medium text-slate-800">
        {date.toLocaleDateString()}
      </p>
      <p className="text-xs text-slate-500">
        {date.toLocaleTimeString()}
      </p>
    </button>
  );
};

/* --------------------------------
   INFO ROW
--------------------------------- */
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-800">
      {value || "—"}
    </span>
  </div>
);

/* --------------------------------
   VITAL CARD
--------------------------------- */
const Vital = ({ icon: Icon, label, value, unit }) => (
  <div className="border border-slate-200 rounded-lg p-4">
    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <div className="text-lg font-semibold text-slate-900">
      {value ?? "—"}{" "}
      <span className="text-sm text-slate-500">{unit}</span>
    </div>
  </div>
);

/* --------------------------------
   MAIN COMPONENT
--------------------------------- */
const PatientHistory = () => {
  const [history, setHistory] = useState([]);
  const [patient, setPatient] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await patientService.getHistory();
        const data = res.data || res;
        setPatient(data.patient);
        setHistory(data.timeline || []);
        setSelected(data.timeline?.[0] || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        Loading medical records…
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="p-12 text-center text-slate-500">
        No medical reports available.
      </div>
    );
  }

  const sensors = selected.sensorData || {};
  const ml = selected.mlResult;
  const doctor = selected.doctorReport;

  return (
    <div className="flex gap-6">

      {/* LEFT TIMELINE */}
      <div className="w-72 shrink-0">
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            Test History
          </h3>
          {history.map((item) => (
            <TimelineItem
              key={item.id}
              item={item}
              active={item.id === selected.id}
              onClick={() => setSelected(item)}
            />
          ))}
        </div>
      </div>

      {/* RIGHT MEDICAL REPORT */}
      <div className="flex-1">
        <div className="bg-white border border-slate-200 rounded-lg p-8 space-y-10">

          {/* HEADER */}
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Medical Examination Report
            </h1>

            <button
              onClick={() =>
                generatePDF({ patient, report: selected })
              }
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Download PDF
            </button>

            <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(selected.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(selected.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* PATIENT SUMMARY */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Patient Summary
            </h2>
            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <InfoRow label="Name" value={patient?.name} />
              <InfoRow label="Age" value={patient?.age && `${patient.age} yrs`} />
              <InfoRow label="Cycle Type" value={patient?.cycleType} />
            </div>
          </section>

          {/* VITAL SIGNS */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Vital Signs (Sensor Data)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Vital icon={Activity} label="Height" value={sensors.height} unit="cm" />
              <Vital icon={Activity} label="Weight" value={sensors.weight} unit="kg" />
              <Vital icon={HeartPulse} label="Heart Rate" value={sensors.heartRate} unit="bpm" />
              <Vital icon={Wind} label="SpO₂" value={sensors.spo2} unit="%" />
              <Vital icon={Thermometer} label="Temperature" value={sensors.temperature} unit="°C" />
            </div>
          </section>

          {/* AI ANALYSIS */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              AI Model Analysis
            </h2>
            {ml ? (
              <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-indigo-700 mb-1">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Prediction: {ml.prediction}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Risk Level: <strong>{ml.riskLevel}</strong>  
                  {ml.confidence && ` • Confidence: ${ml.confidence}%`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                AI analysis not available.
              </p>
            )}
          </section>

          {/* DOCTOR VERDICT */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Doctor’s Verdict
            </h2>
            <div className="border border-slate-200 rounded-lg p-4">
              {doctor?.diagnosis ? (
                <p className="text-sm text-slate-700 leading-relaxed">
                  {doctor.diagnosis}
                </p>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Awaiting doctor review.
                </div>
              )}
            </div>
          </section>

          {/* PRESCRIPTION */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Prescription
            </h2>
            <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
              {doctor?.prescription ? (
                <p className="text-sm text-slate-700">
                  {doctor.prescription}
                </p>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No prescription issued.
                </p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
