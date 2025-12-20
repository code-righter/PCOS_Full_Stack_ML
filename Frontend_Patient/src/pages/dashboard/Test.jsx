import React, { useState } from 'react';
import { Send } from 'lucide-react';

const Test = () => {
  const [formData, setFormData] = useState({
    height: '', weight: '', pulse: '', spo2: '', temp: '', additional: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // API logic goes here
    console.log(formData);
    alert('Sent to doctor!');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Submit Health Test Data</h2>
          <p className="text-gray-600 text-sm">Fill in your current health parameters.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           {/* ... Your exact existing form fields ... */}
           {/* (I am omitting the fields here to save space, but copy them back from your file) */}
           
           <div className="grid md:grid-cols-2 gap-6">
             {/* Example Field */}
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pulse Rate (bpm)</label>
                <input 
                  type="number" name="pulse" value={formData.pulse} onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
             </div>
             {/* ... Repeat for others ... */}
           </div>
           
           <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
             Submit Data
           </button>
        </form>
    </div>
  );
};

export default Test;