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
import jsPDF from "jspdf"
import { patientService } from "../../services/patientService";

/* --------------------------------
   LEFT TIMELINE ITEM
--------------------------------- */

  const generatePDF = ({ patient, report }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // ===== HELPER FUNCTIONS =====
  const addSection = (title) => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 51, 102); // Dark blue
    doc.text(title, margin, y);
    y += 1;
    doc.setDrawColor(79, 129, 189); // Blue line
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  const addField = (label, value, isItalic = false) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", isItalic ? "italic" : "normal");
    doc.setTextColor(0, 0, 0);
    const fieldText = `${label}: `;
    const valueText = value ?? "—";
    
    doc.text(fieldText, margin + 5, y);
    doc.setFont("helvetica", "bold");
    doc.text(valueText, margin + 50, y);
    y += 6;
  };

  const addWrappedText = (text, isTitle = false) => {
    doc.setFontSize(isTitle ? 11 : 10);
    doc.setFont("helvetica", isTitle ? "bold" : "normal");
    doc.setTextColor(isTitle ? 0 : 40, isTitle ? 0 : 40, isTitle ? 0 : 40);
    
    const lines = doc.splitTextToSize(text, contentWidth - 10);
    lines.forEach((line, index) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + 5, y);
      y += isTitle ? 7 : 5;
    });
  };

  // ===== PAGE BREAK CHECK =====
  const checkPageBreak = (neededSpace = 15) => {
    if (y + neededSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ===== HEADER WITH LOGO AREA =====
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 51, 102);
  doc.text("PCOS DIAGNOSTIC REPORT", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.text(`Time: ${new Date().toLocaleTimeString('en-IN')}`, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setLineWidth(1);
  doc.setDrawColor(79, 129, 189);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ===== PATIENT DEMOGRAPHICS =====
  addSection("PATIENT INFORMATION");
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  // Two column layout for patient info
  doc.text(`Name: ${patient?.name || "—"}`, margin + 5, y);
  doc.text(`Age: ${patient?.age || "—"} years`, pageWidth / 2 + 10, y);
  y += 6;
  
  doc.text(`Phone: ${patient?.phoneNumber || "—"}`, margin + 5, y);
  doc.text(`Email: ${patient?.email || "—"}`, pageWidth / 2 + 10, y);
  y += 6;
  
  doc.text(`Cycle Type: ${patient?.cycleType || "—"}`, margin + 5, y);
  y += 10;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ===== VITAL SIGNS & SENSOR DATA =====
  checkPageBreak(50);
  addSection("VITAL SIGNS & SENSOR DATA");

  const sensors = report.sensorData || {};
  const vitalData = [
    ["Height", `${sensors.height || "—"} cm`],
    ["Weight", `${sensors.weight || "—"} kg`],
    ["Heart Rate", `${sensors.heartRate || "—"} bpm`],
    ["Blood Oxygen (SpO₂)", `${sensors.spo2 || "—"} %`],
    ["Body Temperature", `${sensors.temperature || "—"} °C`],
  ];

  // Create a nice grid for vital signs
  const vitalWidth = contentWidth / 2 - 5;
  let vitalY = y;
  let colIndex = 0;

  vitalData.forEach(([label, value], index) => {
    const xPos = margin + 5 + (colIndex * (vitalWidth + 10));
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 129, 189);
    doc.text(label, xPos, vitalY);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(value, xPos, vitalY + 6);
    
    colIndex++;
    if (colIndex === 2) {
      colIndex = 0;
      vitalY += 15;
    }
  });

  y = vitalY + 15;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ===== DOCTOR'S ASSESSMENT =====
  checkPageBreak(50);
  addSection("CLINICAL ASSESSMENT");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  const doctorReportText = report.doctorReport || "Clinical assessment pending.";
  const doctorLines = doc.splitTextToSize(doctorReportText, contentWidth - 10);
  
  doctorLines.forEach((line) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin + 5, y);
    y += 5;
  });

  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ===== ML MODEL ANALYSIS =====
  checkPageBreak(40);
  addSection("MACHINE LEARNING ANALYSIS");

  const mlPrediction = report.mlResult?.prediction || "ML analysis pending";
  const modelVersion = report.mlResult?.modelVersion || "Model version unavailable";
  const mlConfidence = report.mlResult?.confidence || null;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 51, 102);
  doc.text("Prediction:", margin + 5, y);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const predictionLines = doc.splitTextToSize(mlPrediction, contentWidth - 20);
  
  predictionLines.forEach((line) => {
    doc.text(line, margin + 25, y);
    y += 5;
  });

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 51, 102);
  doc.setFontSize(9);
  doc.text("Model Details:", margin + 5, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(`Version: ${modelVersion}`, margin + 10, y);
  
  if (mlConfidence) {
    y += 5;
    doc.text(`Confidence: ${mlConfidence}%`, margin + 10, y);
  }

  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ===== PRESCRIPTION & RECOMMENDATIONS =====
  checkPageBreak(40);
  addSection("PRESCRIPTION & RECOMMENDATIONS");

  const prescriptionText = report.doctorReport?.prescription || "No prescription issued at this time.";
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  const prescriptionLines = doc.splitTextToSize(prescriptionText, contentWidth - 10);
  
  prescriptionLines.forEach((line) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin + 5, y);
    y += 5;
  });

  y += 10;

  // ===== FOOTER =====
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.text("This report is generated by the PCOS Detection System and should be reviewed by a qualified healthcare professional.", pageWidth / 2, footerY, { align: "center" });

  // ===== SAVE PDF =====
  const fileName = `PCOS_Report_${patient?.name || "Patient"}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};


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
              ML Model Analysis
            </h2>
            {ml ? (
              <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 font-bold text-indigo-700 mb-1">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Prediction: {ml.prediction}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
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
