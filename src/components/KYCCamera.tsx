import React, { useState, useEffect, useCallback } from 'react';
import { startLivenessSession, processLiveness, getSessionResults } from '../services/api';
import { toast } from 'react-hot-toast';
import Webcam from 'react-webcam';

interface KYCCameraProps {
  onSuccess: (imageUrl: string) => void;
  onError?: (error: any) => void;
}

const KYCCamera: React.FC<KYCCameraProps> = ({ onSuccess, onError }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const webcamRef = React.useRef<Webcam>(null);
  const [status, setStatus] = useState<'idle' | 'capturing' | 'processing' | 'success' | 'error'>('idle');

  // Initialize liveness session
  useEffect(() => {
    const initSession = async () => {
      try {
        setStatus('processing');
        const response = await startLivenessSession();
        if (response.sessionId) {
          setSessionId(response.sessionId);
          setStatus('idle');
          toast.success('Session initialized');
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
        setStatus('error');
        toast.error('Failed to initialize session');
        if (onError) onError(error);
      }
    };

    initSession();
  }, [onError]);

  // Capture frames
  const captureFrames = useCallback(async () => {
    if (!webcamRef.current || !sessionId) return;
    
    setStatus('capturing');
    const capturedFrames: string[] = [];

    for (let i = 0; i < 5; i++) {
      const frame = webcamRef.current.getScreenshot();
      if (frame) {
        capturedFrames.push(frame);
      }
      await new Promise(resolve => setTimeout(resolve, 200)); // Capture every 200ms
    }

    setFrames(capturedFrames);
    return capturedFrames;
  }, [sessionId]);

  // Process liveness
  const processLivenessCheck = useCallback(async (capturedFrames: string[]) => {
    if (!sessionId) return;

    try {
      setStatus('processing');
      const result = await processLiveness(sessionId, capturedFrames);

      if (result.isLive) {
        // Get the best frame (middle frame)
        const bestFrame = capturedFrames[Math.floor(capturedFrames.length / 2)];
        setStatus('success');
        onSuccess(bestFrame);
        toast.success('Verification successful!');
      } else {
        setStatus('error');
        toast.error('Verification failed. Please try again.');
        if (onError) onError(new Error('Liveness check failed'));
      }
    } catch (error) {
      console.error('Liveness processing failed:', error);
      setStatus('error');
      toast.error('Verification failed');
      if (onError) onError(error);
    }
  }, [sessionId, onSuccess, onError]);

  // Start capture process
  const startCapture = useCallback(async () => {
    if (isCapturing) return;

    try {
      setIsCapturing(true);
      const capturedFrames = await captureFrames();
      if (capturedFrames && capturedFrames.length > 0) {
        await processLivenessCheck(capturedFrames);
      }
    } catch (error) {
      console.error('Capture process failed:', error);
      setStatus('error');
      toast.error('Capture failed');
      if (onError) onError(error);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, captureFrames, processLivenessCheck, onError]);

  // Auto-start capture when session is ready
  useEffect(() => {
    if (sessionId && status === 'idle') {
      startCapture();
    }
  }, [sessionId, status, startCapture]);

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
            />
          </div>

          {/* Status Overlay */}
          {status !== 'idle' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
              <div className="text-center space-y-3 p-4 bg-white bg-opacity-90 rounded-lg">
                {status === 'capturing' && (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-blue-800 font-medium">Capturing...</p>
                  </>
                )}
                {status === 'processing' && (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                    <p className="text-yellow-800 font-medium">Processing...</p>
                  </>
                )}
                {status === 'success' && (
                  <>
                    <div className="text-green-500">✓</div>
                    <p className="text-green-800 font-medium">Success!</p>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <div className="text-red-500">×</div>
                    <p className="text-red-800 font-medium">Failed. Please try again.</p>
                    <button
                      onClick={() => {
                        setStatus('idle');
                        startCapture();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Face Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-blue-400 border-opacity-50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-blue-800 font-semibold mb-2">Instructions:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Ensure your face is well-lit and clearly visible</li>
            <li>• Look directly at the camera</li>
            <li>• Keep your face centered in the circle</li>
            <li>• Remove any sunglasses or face coverings</li>
            <li>• Stay still during the verification process</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default KYCCamera;