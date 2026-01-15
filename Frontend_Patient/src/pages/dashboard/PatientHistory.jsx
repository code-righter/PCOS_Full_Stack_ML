import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  HeartPulse,
  Thermometer,
  Activity,
  Wind,
  Brain,
  AlertCircle
} from "lucide-react";
import jsPDF from "jspdf";
import { patientService } from "../../services/patientService";

/* ======================================================
   PDF GENERATOR (UI-QUALITY RESTORED + DATA FIXED)
====================================================== */
const generatePDF = ({ patient, report }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ==================== HELPER FUNCTIONS ====================

  const checkPageBreak = (neededSpace = 30) => {
    if (y > pageHeight - neededSpace) {
      doc.addPage();
      y = margin;
      addFooter();
    }
  };

  const section = (title) => {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(25, 51, 102); // Dark blue
    doc.text(title, margin, y);
    y += 2;
    
    // Underline
    doc.setDrawColor(79, 129, 189); // Light blue
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  const field = (label, value, bold = false) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    
    const labelWidth = 55;
    const wrappedLabel = doc.splitTextToSize(`${label}:`, labelWidth - 5);
    doc.text(wrappedLabel, margin + 5, y);
    
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(40, 40, 40);
    const displayValue = String(value ?? "—");
    const wrappedValue = doc.splitTextToSize(displayValue, contentWidth - labelWidth - 10);
    doc.text(wrappedValue, margin + labelWidth, y);
    
    y += 6;
  };

  const twoColumnField = (label1, value1, label2, value2) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    
    const colWidth = (contentWidth - 5) / 2;
    
    // Column 1
    doc.text(`${label1}:`, margin + 5, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(String(value1 ?? "—"), margin + 35, y);
    
    // Column 2
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(`${label2}:`, margin + colWidth + 10, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(String(value2 ?? "—"), margin + colWidth + 40, y);
    y += 6;
  };

  const addFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | PCOS Diagnostic Report`,
      margin,
      pageHeight - 10
    );
  };

  const addHeader = () => {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 51, 102);
    doc.text("PCOS DIAGNOSTIC REPORT", pageWidth / 2, y, { align: "center" });
    y += 2;
    doc.setDrawColor(79, 129, 189);
    y += 8;
  };

  // ==================== DOCUMENT START ====================
  
  addHeader();

  // ---------- PATIENT INFORMATION ----------
  section("PATIENT INFORMATION");
  twoColumnField("Name", patient?.name, "Age", patient?.age);
  field("Date of Report", new Date().toLocaleDateString());
  
  const t = report.testData || {};
  y += 2;

  // ---------- CLINICAL PRESENTATION ----------
  section("CLINICAL PRESENTATION");
  twoColumnField(
    "Menstrual Cycle Type",
    t.cycleType || "Not specified",
    "Cycle Length",
    t.cycleLength ? `${t.cycleLength} days` : "Not specified"
  );
  twoColumnField(
    "Excessive Hair Growth",
    t.hairGrowth ? "Yes" : "No",
    "Skin Darkening",
    t.skinDarkening ? "Yes" : "No"
  );
  twoColumnField(
    "Weight Gain",
    t.weightGain ? "Yes" : "No",
    "Fast Food Consumption",
    t.fastFood ? "Yes" : "No"
  );
  y += 2;

  // ---------- VITAL SIGNS ----------
  section("VITAL SIGNS & ANTHROPOMETRIC MEASUREMENTS");
  twoColumnField("Height", t.height ? `${t.height} cm` : "—", "Weight", t.weight ? `${t.weight} kg` : "—");
  
  const bmi = t.height && t.weight 
    ? (t.weight / ((t.height / 100) ** 2)).toFixed(2)
    : "—";
  twoColumnField(
    "BMI",
    bmi !== "—" ? `${bmi} kg/m²` : "—",
    "Heart Rate",
    t.heartRate ? `${t.heartRate} bpm` : "—"
  );
  twoColumnField(
    "Blood Oxygen (SpO₂)",
    t.spo2 ? `${t.spo2}%` : "—",
    "Temperature",
    t.temperature ? `${t.temperature}°C` : "—"
  );
  y += 2;

  // ---------- MACHINE LEARNING ANALYSIS ----------
  checkPageBreak(35);
  section("MACHINE LEARNING ANALYSIS");
  
  const prediction = report.mlResult?.prediction;
  const confidenceScore = report.mlResult?.confidenceScore;
  
  // Prediction badge styling
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  
  const predictionText = prediction || "Pending";
  const predictionColor = prediction === "PCOS Detected" 
    ? [220, 53, 69] // Red
    : prediction === "No PCOS"
    ? [40, 167, 69]  // Green
    : [253, 193, 7]; // Yellow for pending
  
  doc.setTextColor(...predictionColor);
  doc.text(`Prediction: ${predictionText}`, margin + 5, y);
  y += 8;
  
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  if (confidenceScore !== undefined) {
    field(
      "Confidence Level",
      `${(confidenceScore * 100).toFixed(2)}%`,
      true
    );
  }
  field("Model Version", report.mlResult?.modelVersion || "v1.0");
  y += 2;

  // ---------- DOCTOR ASSESSMENT ----------
  section("PHYSICIAN ASSESSMENT & RECOMMENDATIONS");
  
  if (report.doctorReport) {
    field("Clinical Diagnosis", report.doctorReport.diagnosis, true);
    y += 4;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text("Prescribed Treatment Plan:", margin + 5, y);
    y += 5;
    
    const prescriptionLines = doc.splitTextToSize(
      report.doctorReport.prescription || "Not specified",
      contentWidth - 10
    );
    doc.text(prescriptionLines, margin + 8, y);
    y += prescriptionLines.length * 5 + 5;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 100, 100);
    doc.text("⚠ Doctor review pending - Report incomplete", margin + 5, y);
    y += 8;
  }

  // ---------- DISCLAIMER ----------
  checkPageBreak(20);
  section("IMPORTANT DISCLAIMER");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  
  const disclaimerText = doc.splitTextToSize(
    "This report is generated for informational purposes and should not be considered as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical decisions.",
    contentWidth
  );
  doc.text(disclaimerText, margin + 5, y);

  // ---------- FOOTER ----------
  addFooter();

  // Save PDF
  const fileName = `PCOS_Report_${patient?.name?.replace(/\s+/g, "_") || "Patient"}_${Date.now()}.pdf`;
  doc.save(fileName);
};

/* ======================================================
   UI COMPONENTS (UNCHANGED)
====================================================== */

const TimelineItem = ({ item, active, onClick }) => {
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

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-800">
      {value || "—"}
    </span>
  </div>
);

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

/* ======================================================
   MAIN COMPONENT (LOGIC FIXED, UI SAME)
====================================================== */

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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div className="p-12 text-center">Loading medical records…</div>;
  }

  if (!selected) {
    return <div className="p-12 text-center">No records available.</div>;
  }

  const sensors = selected.testData || {};
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
              key={item.analysisId}
              item={item}
              active={item.analysisId === selected.analysisId}
              onClick={() => setSelected(item)}
            />
          ))}
        </div>
      </div>

      {/* RIGHT REPORT */}
      <div className="flex-1">
        <div className="bg-white border border-slate-200 rounded-lg p-8 space-y-10">

          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Medical Examination Report
            </h1>

            <button
              onClick={() => generatePDF({ patient, report: selected })}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Download PDF
            </button>

            <div className="flex gap-4 text-sm text-slate-500 mt-2">
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

          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Patient Summary
            </h2>
            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <InfoRow label="Name" value={patient?.name} />
              <InfoRow label="Age" value={patient?.age && `${patient.age} yrs`} />
              <InfoRow label="Cycle Type" value={sensors.cycleType} />
            </div>
          </section>

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

          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              ML Model Analysis
            </h2>
            {ml ? (
              <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 font-bold text-indigo-700 mb-1">
                  <Brain className="w-4 h-4" />
                  Prediction: {ml.prediction} (
                  {(ml.confidenceScore * 100).toFixed(2)}%)
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-slate-500">
                AI analysis not available.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Doctor’s Verdict
            </h2>
            <div className="border border-slate-200 rounded-lg p-4">
              {doctor ? (
                <p className="text-sm text-slate-700">
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
                <p className="text-sm italic text-slate-500">
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
