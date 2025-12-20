import React, { useState, useEffect } from 'react';
import { Calendar, FileText, ShoppingCart, Activity, Check, RotateCcw } from 'lucide-react';
import { usePatient } from '../../contexts/PatientContext'; // ENSURE THIS PATH IS CORRECT

const UpdateInfo = () => {
  const { submitPatientData, patientData, loading } = usePatient(); 

  const [formData, setFormData] = useState({
    cycleLength: 0,
    cycle: 0,
    skinDarkening: false,
    hairGrowth: false,
    pimples: false,
    hairLoss: false,
    weightGain: false,
    fastFood: false,
    hip: 0.0,
    waist: 0.0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to convert 'Y'/'N' strings to boolean
  const stringToBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (value === 'Y' || value === 'true' || value === true) return true;
    if (value === 'N' || value === 'false' || value === false) return false;
    return false;
  };

  // Helper function to convert 'R'/'I' strings to integer (0/1)
  const cycleToInt = (value) => {
    if (typeof value === 'number') return value;
    if (value === 'R') return 0;
    if (value === 'I') return 1;
    return 0;
  };

  // FIX: Robust Data Loading with Type Conversion
  useEffect(() => {
    // 1. Check if we actually have data
    if (!patientData) return;

    // 2. Handle structure: is it inside .data or at the root?
    const source = patientData.data ? patientData.data : patientData;
    
    console.log("Mapping source data to form:", source);

    // 3. Update form with proper type conversions
    setFormData({
      cycleLength: parseInt(source.cycleLength) || 0,
      cycle: cycleToInt(source.cycle),
      skinDarkening: stringToBoolean(source.skinDarkening),
      hairGrowth: stringToBoolean(source.hairGrowth),
      pimples: stringToBoolean(source.pimples),
      hairLoss: stringToBoolean(source.hairLoss),
      weightGain: stringToBoolean(source.weightGain),
      fastFood: stringToBoolean(source.fastFood),
      hip: parseFloat(source.hip) || 0.0,
      waist: parseFloat(source.waist) || 0.0
    });
  }, [patientData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      // Handle different input types with proper conversions
      if (type === 'radio') {
        // Convert radio button values to boolean
        if (['skinDarkening', 'hairGrowth', 'pimples', 'hairLoss', 'weightGain', 'fastFood'].includes(name)) {
          return { ...prev, [name]: value === 'true' };
        }
        // Handle cycle as integer
        if (name === 'cycle') {
          return { ...prev, [name]: parseInt(value) };
        }
      }
      
      // Handle number inputs
      if (type === 'number') {
        if (name === 'cycleLength') {
          return { ...prev, [name]: parseInt(value) || 0 };
        }
        if (name === 'hip' || name === 'waist') {
          return { ...prev, [name]: parseFloat(value) || 0.0 };
        }
      }
      
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Data is already in correct types
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
          cycleLength: parseInt(source.cycleLength) || 0,
          cycle: cycleToInt(source.cycle),
          skinDarkening: stringToBoolean(source.skinDarkening),
          hairGrowth: stringToBoolean(source.hairGrowth),
          pimples: stringToBoolean(source.pimples),
          hairLoss: stringToBoolean(source.hairLoss),
          weightGain: stringToBoolean(source.weightGain),
          fastFood: stringToBoolean(source.fastFood),
          hip: parseFloat(source.hip) || 0.0,
          waist: parseFloat(source.waist) || 0.0
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
                <option value="0">Regular (R)</option>
                <option value="1">Irregular (I)</option>
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
                      value="true"
                      checked={formData[field.name] === true}
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
                      value="false"
                      checked={formData[field.name] === false}
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
                  value="true"
                  checked={formData.fastFood === true}
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
                  value="false"
                  checked={formData.fastFood === false}
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
