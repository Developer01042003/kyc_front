import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Amplify } from 'aws-amplify';
import App from './App.tsx';
import './index.css';

// Log environment variables (for debugging)
console.log('Environment Variables:', {
  region: import.meta.env.VITE_AWS_REGION,
  userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
  clientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID,
  apiUrl: import.meta.env.VITE_API_URL
});

// Configure AWS Amplify with fallbacks
const awsConfig = {
  Auth: {
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: import.meta.env.VITE_API_URL || 'https://kyc-back-rmgs.onrender.com',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
      }
    ]
  }
};

console.log('AWS Config:', awsConfig);

try {
  Amplify.configure(awsConfig);
  console.log('Amplify configured successfully');
} catch (error) {
  console.error('Error configuring Amplify:', error);
}

const root = createRoot(document.getElementById('root')!);

try {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <Toaster />
        <App />
      </BrowserRouter>
    </StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
}
