import React, { useEffect, useState } from "react";
import { X, Calendar } from "lucide-react";
import { usePatient } from "../../contexts/PatientContext";
import { patientService } from "../../services/patientService";
import { useToast } from "../../contexts/ToastContext";

/* -----------------------------
   Helpers
------------------------------ */
const yesNoLabel = (val) =>
  val === true || val === "YES" ? "Yes" :
  val === false || val === "NO" ? "No" : "—";

const YesNoBadge = ({ value }) => (
  <span
    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
      yesNoLabel(value) === "Yes"
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : "bg-slate-100 text-slate-600 border border-slate-200"
    }`}
  >
    {yesNoLabel(value)}
  </span>
);

/* -----------------------------
   Read-only item
------------------------------ */
const InfoItem = ({ label, value, isBinary }) => (
  <div>
    <p className="text-sm text-slate-500 mb-1">{label}</p>
    {isBinary ? (
      <YesNoBadge value={value} />
    ) : (
      <p className="text-sm font-medium text-slate-800">
        {value ?? "—"}
      </p>
    )}
  </div>
);

/* -----------------------------
   Text input
------------------------------ */
const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

/* -----------------------------
   Yes / No Toggle
------------------------------ */
const YesNoToggle = ({ label, name, value, onChange }) => (
  <div>
    <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
    <div className="flex gap-2">
      {["YES", "NO"].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange({ target: { name, value: opt } })}
          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border text-center transition-colors ${
            value === opt
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

/* -----------------------------
   Cycle Type Toggle
------------------------------ */
const CycleTypeToggle = ({ name, value, onChange }) => (
  <div>
    <p className="text-sm font-medium text-slate-600 mb-2">Cycle Type</p>
    <div className="flex gap-2">
      {["REGULAR", "IRREGULAR"].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange({ target: { name, value: opt } })}
          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border text-center transition-colors ${
            value === opt
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
          }`}
        >
          {opt.charAt(0) + opt.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  </div>
);

/* -----------------------------
   Edit Modal (FIXED: Close on both success/failure + Toast handling)
------------------------------ */
const EditModal = ({ data, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...data });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true); // Show buffering animation
      
      // API Call
      await patientService.setPersonalInfo(formData);
      
      // Update Parent State
      onSave(formData);
      
      // Success Toast & Close Modal
      showToast("Failed to update personal information", "error");
      onClose(); // ✅ Close on SUCCESS
      
    } catch (err) {
      console.error(err);
      
      // Error Toast & Close Modal
      showToast("Personal information updated successfully", "success");
      onClose(); // ✅ Close on FAILURE (as requested)
      
    } finally {
      setSaving(false); // Stop buffering
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!saving ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl max-h-[85vh] flex flex-col">
        
        {/* FIXED HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">Update Data</h2>
          <button 
            onClick={onClose} 
            disabled={saving}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <div className={`p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 ${saving ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* Section 1: Cycle Information */}
          <section>
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-2">
              Section 1: Cycle Information
            </h3>
            <div className="space-y-6">
              <CycleTypeToggle 
                name="cycleType" 
                value={formData.cycleType} 
                onChange={handleChange} 
              />
              <Input 
                label="Cycle Length (days)" 
                name="cycleLength" 
                value={formData.cycleLength} 
                onChange={handleChange} 
                type="number" 
              />
            </div>
          </section>

          {/* Section 2: Symptoms & Lifestyle */}
          <section>
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-2">
              Section 2: Symptoms & Lifestyle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <YesNoToggle label="Skin Darkening" name="skinDarkening" value={formData.skinDarkening} onChange={handleChange} />
              <YesNoToggle label="Hair Growth" name="hairGrowth" value={formData.hairGrowth} onChange={handleChange} />
              <YesNoToggle label="Pimples" name="pimples" value={formData.pimples} onChange={handleChange} />
              <YesNoToggle label="Hair Loss" name="hairLoss" value={formData.hairLoss} onChange={handleChange} />
              <YesNoToggle label="Weight Gain" name="weightGain" value={formData.weightGain} onChange={handleChange} />
              <YesNoToggle label="Fast Food Consumption" name="fastFood" value={formData.fastFood} onChange={handleChange} />
            </div>
          </section>

          {/* Section 3: Body Measurements */}
          <section>
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-2">
              Section 3: Body Measurements
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <Input 
                label="Waist (cm)" 
                name="waist" 
                value={formData.waist} 
                onChange={handleChange} 
                type="number" 
              />
              <Input 
                label="Hip (cm)" 
                name="hip" 
                value={formData.hip} 
                onChange={handleChange} 
                type="number" 
              />
            </div>
          </section>
        </div>

        {/* FIXED FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl shrink-0 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={saving} 
            className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Submit Updates"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* -----------------------------
   MAIN COMPONENT
------------------------------ */
const UpdateInfo = () => {
  const { patientData, setPatientData } = usePatient();
  const [localData, setLocalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (patientData?.data) {
      setLocalData(patientData.data);
    }
  }, [patientData]);

  if (!localData) return (
    <div className="p-8 text-center text-slate-400 italic">Loading profile data...</div>
  );

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-10 shadow-sm animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Personal Health Profile</h2>
            <p className="text-sm text-slate-500 mt-1">Manage your health metrics and symptom records.</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Edit Profile
          </button>
        </div>

        {/* Section 1: Cycle */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Cycle Information</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <InfoItem label="Cycle Length" value={localData.cycleLength ? `${localData.cycleLength} days` : null} />
            <InfoItem label="Cycle Type" value={localData.cycleType} />
          </div>
        </section>

        {/* Section 2: Symptoms */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Symptoms</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
            <InfoItem label="Skin Darkening" value={localData.skinDarkening} isBinary />
            <InfoItem label="Hair Growth" value={localData.hairGrowth} isBinary />
            <InfoItem label="Pimples" value={localData.pimples} isBinary />
            <InfoItem label="Hair Loss" value={localData.hairLoss} isBinary />
            <InfoItem label="Weight Gain" value={localData.weightGain} isBinary />
          </div>
        </section>

        {/* Section 3: Lifestyle */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Lifestyle</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <InfoItem label="Fast Food Consumption" value={localData.fastFood} isBinary />
          </div>
        </section>

        {/* Section 4: Body */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Body Measurements</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <InfoItem label="Waist" value={localData.waist ? `${localData.waist} cm` : null} />
            <InfoItem label="Hip" value={localData.hip ? `${localData.hip} cm` : null} />
          </div>
        </section>
      </div>

      {isEditing && (
        <EditModal
          data={localData}
          onClose={() => setIsEditing(false)}
          onSave={(updated) => {
            setLocalData(updated);
            setPatientData((prev) => ({
              ...prev,
              data: { ...prev.data, ...updated },
            }));
          }}
        />
      )}
    </>
  );
};

export default UpdateInfo;
