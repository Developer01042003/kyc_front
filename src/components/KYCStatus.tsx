import React from 'react';

const KYCStatus: React.FC = () => {
  return (
    <div className="text-center p-8 bg-yellow-50 rounded-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        KYC Verification In Progress
      </h3>
      <p className="text-gray-600">
        We've received your KYC submission. Please check your email for the verification result.
      </p>
    </div>
  );
};

export default KYCStatus;