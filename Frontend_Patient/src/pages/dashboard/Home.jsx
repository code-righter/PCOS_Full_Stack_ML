import React from 'react';
import { Home as HomeIcon } from 'lucide-react';
import { usePatient } from '../../contexts/PatientContext';

const Home = () => {
  const { patientData, loading } = usePatient();
  return (
   <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in duration-500">
      <div className="text-center py-16">
        <div className="inline-block p-4 bg-blue-50 rounded-full mb-4 shadow-inner">
          <HomeIcon className="w-16 h-16 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {loading ? 'Welcome Back!' : `Welcome back, ${patientData?.data?.name?.split(' ')[0]}!`}
        </h2>
        
        <p className="text-gray-600 max-w-md mx-auto">
          {loading 
            ? "Loading your dashboard..." 
            : "Access your health records, view test results, and update your profile information all in one place."}
        </p>
      </div>
    </div>
  );
};

export default Home;