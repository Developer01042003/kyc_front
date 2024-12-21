import React from 'react';
import KYCCamera from '../components/KYCCamera';
import { toast } from 'react-hot-toast';

const KYCPage: React.FC = () => {
  const handleSuccess = (imageUrl: string) => {
    console.log('Verification successful:', imageUrl);
    // Handle successful verification
    toast.success('Verification completed successfully!');
  };

  const handleError = (error: any) => {
    console.error('Verification failed:', error);
    // Handle verification error
    toast.error('Verification failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Identity Verification
          </h1>
          <p className="mt-2 text-gray-600">
            Please follow the instructions to complete your verification
          </p>
        </div>

        <KYCCamera 
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default KYCPage;