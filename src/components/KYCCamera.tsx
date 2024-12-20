// KYCCamera.tsx
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';
import axios from 'axios';

interface KYCCameraProps {
  onCapture: (imageSrc: string) => void;
}

const KYCCamera: React.FC<KYCCameraProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    startLivenessSession();
  }, []);

  const startLivenessSession = async () => {
    try {
      const response = await axios.post('/api/start-liveness-session');
      setSessionId(response.data.sessionId);
    } catch (error) {
      console.error('Failed to start liveness session:', error);
    }
  };

  const captureFrames = async (): Promise<string[]> => {
    const frames: string[] = [];
    for (let i = 0; i < 5; i++) {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          frames.push(imageSrc);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    return frames;
  };

  const checkLiveness = async (frames: string[]) => {
    try {
      const response = await axios.post('/api/check-liveness', {
        sessionId,
        frames
      });
      return response.data;
    } catch (error) {
      throw new Error('Liveness check failed');
    }
  };

  const handleCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    try {
      // Capture frames for liveness detection
      const frames = await captureFrames();
      
      // Perform liveness check
      const livenessResult = await checkLiveness(frames);
      
      if (livenessResult.isLive && livenessResult.confidence > 0.90) {
        // Use the middle frame as the final image for submission
        const bestFrame = frames[Math.floor(frames.length / 2)];
        await onCapture(bestFrame);
      } else {
        throw new Error('Liveness check failed or low confidence');
      }
    } catch (error) {
      console.error('Capture error:', error);
      throw error;
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
        {isCapturing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-white text-lg">Performing Liveness Check...</div>
          </div>
        )}
      </div>
      <div className="text-center">
        <button
          onClick={handleCapture}
          disabled={isCapturing || !sessionId}
          className={`bg-green-600 text-white px-6 py-3 rounded-lg transition-colors ${
            isCapturing || !sessionId
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-green-700'
          }`}
        >
          <Camera className="inline-block mr-2" />
          {isCapturing ? 'Processing...' : 'Capture & Verify'}
        </button>
      </div>
    </div>
  );
};

export default KYCCamera;
