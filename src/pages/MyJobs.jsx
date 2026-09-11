import React from 'react';
import { Navbar } from '@/components/layout/navbar';

const MyJobs = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="pt-24 pb-12">
      <div className="container-custom">
        <div className="bg-white rounded-2xl shadow-elegant p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes Offres d'Emploi</h1>
          <p className="text-gray-600">Page en construction...</p>
        </div>
      </div>
    </div>
  </div>
);

export default MyJobs;