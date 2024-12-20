// KYCCamera.tsx
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { startLivenessSession, checkLiveness } from '../services/api';
import { toast } from 'react-hot-toast';

interface KYCCameraProps {
  onCapture: (imageSrc: string) => void;
}

const KYCCamera: React.FC<KYCCameraProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'processing' | 'success' | 'error'>('idle');

  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    try {
      const response = await startLivenessSession();
      setSessionId(response.sessionId);
      toast.success('Camera session initialized');
    } catch (error) {
      console.error('Failed to start liveness session:', error);
      toast.error('Failed to initialize camera session');
    }
  };

  const captureFrames = async (): Promise<string[]> => {
    const frames: string[] = [];
    setCaptureStatus('capturing');
    
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

  const handleCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    try {
      const frames = await captureFrames();
      setCaptureStatus('processing');
      
      const livenessResult = await checkLiveness(sessionId, frames);
      
      if (livenessResult.isLive && livenessResult.confidence > 0.90) {
        const bestFrame = frames[Math.floor(frames.length / 2)];
        setCaptureStatus('success');
        await onCapture(bestFrame);
        toast.success('Photo captured successfully!');
      } else {
        setCaptureStatus('error');
        toast.error('Liveness check failed. Please try again.');
        throw new Error('Liveness check failed or low confidence');
      }
    } catch (error) {
      console.error('Capture error:', error);
      setCaptureStatus('error');
      toast.error('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
      setTimeout(() => setCaptureStatus('idle'), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="space-y-6">
        {/* Camera View */}
        <div className="relative">
          <div className="rounded-xl overflow-hidden shadow-inner bg-gray-100">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              mirrored={false}
              className="w-full rounded-xl"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: "user"
              }}
              onUserMedia={() => setIsCameraReady(true)}
            />
          </div>

          {/* Overlay States */}
          {captureStatus !== 'idle' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
              <div className="text-center space-y-3 p-4 bg-white bg-opacity-90 rounded-lg">
                {captureStatus === 'capturing' && (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                    <p className="text-blue-800 font-medium">Capturing...</p>
                  </>
                )}
                {captureStatus === 'processing' && (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto" />
                    <p className="text-yellow-800 font-medium">Processing...</p>
                  </>
                )}
                {captureStatus === 'success' && (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
                    <p className="text-green-800 font-medium">Success!</p>
                  </>
                )}
                {captureStatus === 'error' && (
                  <>
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                    <p className="text-red-800 font-medium">Failed. Please try again.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Camera Guidelines */}
          <div className="absolute inset-0 border-4 border-blue-400 border-opacity-50 rounded-xl pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white border-opacity-50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-blue-800 font-semibold mb-2">Instructions:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Ensure your face is well-lit and clearly visible</li>
            <li>• Look directly at the camera</li>
            <li>• Remove any sunglasses or face coverings</li>
            <li>• Keep your face centered in the frame</li>
          </ul>
        </div>

        {/* Capture Button */}
        <div className="text-center">
          <button
            onClick={handleCapture}
            disabled={isCapturing || !sessionId || !isCameraReady}
            className={`
              inline-flex items-center px-6 py-3 rounded-lg
              transition-all duration-200 ease-in-out
              ${isCapturing || !sessionId || !isCameraReady
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'}
              text-white font-medium
            `}
          >
            {isCapturing ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Camera className="w-5 h-5 mr-2" />
            )}
            {isCapturing ? 'Processing...' : 'Capture & Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCCamera;
