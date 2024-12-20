import React, { useState, useEffect, useCallback } from 'react';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import { ThemeProvider } from '@aws-amplify/ui-react';
import { startLivenessSession, submitKYC } from '../services/api';
import { toast } from 'react-hot-toast';
import Webcam from 'react-webcam';

interface KYCCameraProps {
  onSuccess?: (selfieUrl: string) => void;
  onError?: (error: any) => void;
}

const KYCCamera: React.FC<KYCCameraProps> = ({ onSuccess, onError }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const webcamRef = React.useRef<Webcam>(null);

  // Capture frames during liveness detection
  const captureFrameDuringLiveness = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedFrames(prev => [...prev, imageSrc]);
      }
    }
  }, []);

  // Select the best frame (middle frame or highest quality)
  const selectBestFrame = useCallback((frames: string[]) => {
    if (frames.length === 0) return null;
    
    // Select middle frame as a simple selection strategy
    const middleIndex = Math.floor(frames.length / 2);
    return frames[middleIndex];
  }, []);

  // Initialize liveness session
  useEffect(() => {
    const initializeLivenessSession = async () => {
      try {
        const response = await startLivenessSession();
        setSessionId(response.sessionId);
        setLoading(false);
        toast.success('Liveness session initialized');
      } catch (error) {
        console.error('Failed to start liveness session:', error);
        toast.error('Failed to initialize liveness session');
        setLoading(false);
        
        if (onError) {
          onError(error);
        }
      }
    };

    initializeLivenessSession();
  }, [onError]);

  // Handle analysis complete
  const handleAnalysisComplete = useCallback(async () => {
    try {
      // Select the best frame
      const bestFrame = selectBestFrame(capturedFrames);
      
      if (!bestFrame) {
        throw new Error('No frames captured');
      }

      // Submit KYC with the best frame
      const kycResponse = await submitKYC(bestFrame);
      
      toast.success('KYC submission successful');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(kycResponse.selfieUrl || bestFrame);
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      toast.error('KYC submission failed');
      
      if (onError) {
        onError(error);
      }
    }
  }, [capturedFrames, selectBestFrame, onSuccess, onError]);

  // Error handler
  const handleError = (error: any) => {
    console.error('Liveness detection error:', error);
    toast.error('Liveness detection failed');
    
    if (onError) {
      onError(error);
    }
  };

  if (loading || !sessionId) {
    return <div>Initializing liveness session...</div>;
  }

  return (
    <div className="relative">
      {/* Hidden webcam for frame capture */}
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 1280,
          height: 720,
          facingMode: "user"
        }}
        className="hidden"
      />

      <ThemeProvider>
        <FaceLivenessDetector
          sessionId={sessionId}
          region="us-east-1" // Replace with your AWS region
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
          // Capture frames during liveness detection
          config={{
            onFrame: captureFrameDuringLiveness
          }}
          components={{
            PhotosensitiveWarning: () => (
              <div className="bg-yellow-100 p-4 rounded">
                <p>This verification involves color changes. Please be cautious if you are photosensitive.</p>
              </div>
            ),
          }}
          displayText={{
            startScreenBeginCheckText: 'Start Verification',
            hintCenterFaceText: 'Position your face in the oval',
          }}
        />
      </ThemeProvider>
    </div>
  );
};

export default KYCCamera;
