import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';

interface KYCCameraProps {
  onCapture: (imageSrc: string) => void;
}

const KYCCamera: React.FC<KYCCameraProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-md mx-auto">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          mirrored={false}
          className="rounded-lg"
        />
      </div>
      <div className="text-center">
        <button
          onClick={handleCapture}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Camera className="inline-block mr-2" />
          Capture & Submit
        </button>
      </div>
    </div>
  );
};

export default KYCCamera;