import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
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
    <label className="block text-xs font-medium text-slate-600 mb-1">
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
    <p className="text-xs font-medium text-slate-600 mb-2">{label}</p>
    <div className="flex gap-2">
      {["YES", "NO"].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange({ target: { name, value: opt } })}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${
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
   Edit Modal
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
      setSaving(true);
      await patientService.setPersonalInfo(formData);
      onSave(formData);
      showToast("Personal information updated successfully", "success");
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to update personal information", "error");
      onClose(); // prevent stuck modal
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${
          saving ? "pointer-events-none" : ""
        }`}
        onClick={!saving ? onClose : undefined}
      />

      <div className="relative bg-white w-full max-w-3xl rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Update Personal Information
          </h2>
          <button onClick={onClose} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Input label="Cycle Length (days)" name="cycleLength" value={formData.cycleLength} onChange={handleChange} />
          <Input label="Waist (cm)" name="waist" value={formData.waist} onChange={handleChange} />
          <Input label="Hip (cm)" name="hip" value={formData.hip} onChange={handleChange} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <YesNoToggle label="Skin Darkening" name="skinDarkening" value={formData.skinDarkening} onChange={handleChange} />
          <YesNoToggle label="Hair Growth" name="hairGrowth" value={formData.hairGrowth} onChange={handleChange} />
          <YesNoToggle label="Pimples" name="pimples" value={formData.pimples} onChange={handleChange} />
          <YesNoToggle label="Hair Loss" name="hairLoss" value={formData.hairLoss} onChange={handleChange} />
          <YesNoToggle label="Weight Gain" name="weightGain" value={formData.weightGain} onChange={handleChange} />
          <YesNoToggle label="Fast Food Consumption" name="fastFood" value={formData.fastFood} onChange={handleChange} />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md"
          >
            {saving ? "Saving..." : "Save Changes"}
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

  if (!localData) return null;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">
            Personal Health Information
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-indigo-600 hover:underline"
          >
            Edit
          </button>
        </div>

        <section>
          <h3 className="text-lg font-semibold mb-4">Cycle Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoItem label="Cycle Length" value={localData.cycleLength} />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">Symptoms</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoItem label="Skin Darkening" value={localData.skinDarkening} isBinary />
            <InfoItem label="Hair Growth" value={localData.hairGrowth} isBinary />
            <InfoItem label="Pimples" value={localData.pimples} isBinary />
            <InfoItem label="Hair Loss" value={localData.hairLoss} isBinary />
            <InfoItem label="Weight Gain" value={localData.weightGain} isBinary />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">Lifestyle</h3>
          <InfoItem label="Fast Food Consumption" value={localData.fastFood} isBinary />
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">Body Measurements</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoItem label="Waist (cm)" value={localData.waist} />
            <InfoItem label="Hip (cm)" value={localData.hip} />
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
