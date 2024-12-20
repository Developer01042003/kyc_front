import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { startLivenessSession, processLiveness } from '../services/api';
import { toast } from 'react-hot-toast';

interface KYCCameraProps {
  onCapture: (imageSrc: string) => void;
}

const KYCCamera: React.FC<KYCCameraProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'processing' | 'success' | 'error'>('idle');

  const startSession = useCallback(async () => {
    try {
      const response = await startLivenessSession();
      setSessionId(response.sessionId);
      toast.success('Camera session initialized');
    } catch (error) {
      console.error('Failed to start liveness session:', error);
      toast.error('Failed to initialize camera session');
    }
  }, []);

  useEffect(() => {
    startSession();
  }, [startSession]);

  const captureFrames = useCallback(async (): Promise<string[]> => {
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
  }, []);

  const checkLivenessAndCapture = useCallback(async (frames: string[]) => {
    try {
      // Use processLiveness instead of checkLiveness
      const livenessResult = await processLiveness(sessionId, frames);
      
      console.log('Liveness Result:', livenessResult);

      // Adjust the condition based on your backend response
      if (livenessResult.status === 'success' && livenessResult.isLive) {
        const bestFrame = frames[Math.floor(frames.length / 2)];
        setCaptureStatus('success');
        onCapture(bestFrame);
        toast.success('Photo captured successfully!');
        return true;
      } else {
        setCaptureStatus('error');
        toast.error('Liveness check failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Liveness check error:', error);
      setCaptureStatus('error');
      toast.error('Failed to verify liveness. Please try again.');
      return false;
    }
  }, [sessionId, onCapture]);

  const startAutomaticCapture = useCallback(async () => {
    try {
      setCaptureStatus('capturing');
      const frames = await captureFrames();
      
      setCaptureStatus('processing');
      const livenessVerified = await checkLivenessAndCapture(frames);
      
      if (!livenessVerified) {
        // If liveness check fails, reset and try again
        setTimeout(startAutomaticCapture, 2000);
      }
    } catch (error) {
      console.error('Automatic capture error:', error);
      setCaptureStatus('error');
      toast.error('Capture process failed. Please try again.');
      
      // Retry after a short delay
      setTimeout(startAutomaticCapture, 2000);
    }
  }, [captureFrames, checkLivenessAndCapture]);

  // Start automatic capture when camera is ready and session is initialized
  useEffect(() => {
    if (isCameraReady && sessionId) {
      startAutomaticCapture();
    }
  }, [isCameraReady, sessionId, startAutomaticCapture]);

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
            <li>• Wait for automatic capture and verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default KYCCamera;
