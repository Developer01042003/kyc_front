import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import KYCCamera from '../components/KYCCamera';
import KYCStatus from '../components/KYCStatus';
import { submitKYC } from '../services/api';

const Dashboard = () => {
  const [kycStep, setKycStep] = useState<'initial' | 'camera' | 'submitted'>('initial');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCaptureImage = async (imageSrc: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      console.log('Processing captured image...');
      await submitKYC(imageSrc);
      setKycStep('submitted');
      toast.success('KYC submitted successfully! Check your email for verification.');
    } catch (error: any) {
      console.error('KYC submission failed:', error);
      toast.error(error.response?.data?.error || 'Failed to submit KYC. Please try again.');
      setKycStep('camera'); // Stay on camera to allow retry
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
        
        {kycStep === 'initial' && (
          <div className="text-center">
            <button
              onClick={() => setKycStep('camera')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start KYC Verification
            </button>
          </div>
        )}

        {kycStep === 'camera' && <KYCCamera onCapture={handleCaptureImage} />}
        {kycStep === 'submitted' && <KYCStatus />}
      </div>
    </div>
  );
};

export default Dashboard;
