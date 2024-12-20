import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';

interface KYCCameraProps {
  onCapture: (imageSrc: string) => void;
}

const KYCCamera: React.FC<KYCCameraProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    try {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          console.log('Image captured, size:', imageSrc.length);
          await onCapture(imageSrc);
        } else {
          throw new Error('Failed to capture image');
        }
      }
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      setIsCapturing(false);
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
          videoConstraints={{
            width: 720,
            height: 480,
            facingMode: "user"
          }}
        />
      </div>
      <div className="text-center">
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className={`bg-green-600 text-white px-6 py-3 rounded-lg transition-colors ${
            isCapturing 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-green-700'
          }`}
        >
          <Camera className="inline-block mr-2" />
          {isCapturing ? 'Processing...' : 'Capture & Submit'}
        </button>
      </div>
    </div>
  );
};

export default KYCCamera;
