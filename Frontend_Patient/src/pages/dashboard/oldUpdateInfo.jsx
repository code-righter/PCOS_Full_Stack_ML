import React, { useState, useEffect } from 'react';
import { Calendar, FileText, ShoppingCart, Activity, Check, RotateCcw } from 'lucide-react';
import { usePatient } from '../../context/PatientContext'; // ENSURE THIS PATH IS CORRECT

const UpdateInfo = () => {
  const { submitPatientData, patientData, loading } = usePatient(); 

  const [formData, setFormData] = useState({
    cycleLength: '',
    cycle: '',
    skinDarkening: '',
    hairGrowth: '',
    pimples: '',
    hairLoss: '',
    weightGain: '',
    fastFood: '',
    hip: '',
    waist: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIX: Robust Data Loading
  useEffect(() => {
    // 1. Check if we actually have data
    if (!patientData) return;

    // 2. Handle structure: is it inside .data or at the root?
    // This allows it to work regardless of how your backend wraps it.
    const source = patientData.data ? patientData.data : patientData;
    
    console.log("Mapping source data to form:", source); // Check console to see what keys you actually have

    // 3. Update form (safely handling nulls)
    setFormData({
      cycleLength: source.cycleLength || '',
      cycle: source.cycle || '',
      skinDarkening: source.skinDarkening || '',
      hairGrowth: source.hairGrowth || '',
      pimples: source.pimples || '',
      hairLoss: source.hairLoss || '',
      weightGain: source.weightGain || '',
      fastFood: source.fastFood || '',
      hip: source.hip || '',
      waist: source.waist || ''
    });
  }, [patientData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Now this function exists!
      const success = await submitPatientData(formData);
      if (success) {
        alert('Health records updated successfully!');
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Discard unsaved changes and revert to saved data?")) {
      if (patientData) {
        const source = patientData.data || patientData;
        setFormData({
            cycleLength: source.cycleLength || '',
            cycle: source.cycle || '',
            skinDarkening: source.skinDarkening || '',
            hairGrowth: source.hairGrowth || '',
            pimples: source.pimples || '',
            hairLoss: source.hairLoss || '',
            weightGain: source.weightGain || '',
            fastFood: source.fastFood || '',
            hip: source.hip || '',
            waist: source.waist || ''
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your health records...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-in slide-in-from-right-4 duration-500">
      <div className="mb-6 flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Update Your Health Information</h2>
            <p className="text-gray-600 text-sm">You are editing your <strong>current</strong> health records.</p>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
            Editing Mode
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Cycle Section */}
        <div className="border-b border-gray-100 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Cycle Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cycle Length (days)</label>
              <input
                type="number"
                name="cycleLength"
                value={formData.cycleLength}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cycle (R/I)</label>
              <select
                name="cycle"
                value={formData.cycle}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">Select...</option>
                <option value="R">Regular (R)</option>
                <option value="I">Irregular (I)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Symptoms Section */}
        <div className="border-b border-gray-100 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Symptoms
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Reusable Radio Helper to keep code clean */}
            {[
              { label: 'Skin Darkening', name: 'skinDarkening' },
              { label: 'Hair Growth', name: 'hairGrowth' },
              { label: 'Pimples', name: 'pimples' },
              { label: 'Hair Loss', name: 'hairLoss' },
              { label: 'Weight Gain', name: 'weightGain' }
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="Y"
                      checked={formData[field.name] === 'Y'}
                      onChange={handleChange}
                      required
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="N"
                      checked={formData[field.name] === 'N'}
                      onChange={handleChange}
                      required
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lifestyle Section */}
        <div className="border-b border-gray-100 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Lifestyle
          </h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fast Food Consumption</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="fastFood"
                  value="Y"
                  checked={formData.fastFood === 'Y'}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="fastFood"
                  value="N"
                  checked={formData.fastFood === 'N'}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>

        {/* Measurements Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Body Measurements
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hip (Inch)</label>
              <input
                type="number"
                name="hip"
                value={formData.hip}
                onChange={handleChange}
                required
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Waist (Inch)</label>
              <input
                type="number"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                required
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (
                <>
                    <Check className="w-5 h-5" />
                    Save Changes
                </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:text-red-600 transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Revert to Saved
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateInfo;