import axios from 'axios';

const API_URL = 'https://kyc-back-rmgs.onrender.com/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Modified interceptor to only add token for protected routes
api.interceptors.request.use((config) => {
  // Skip adding token for login and signup routes
  if (config.url && (config.url.includes('auth/login/') || config.url.includes('auth/signup/'))) {
    return config;
  }
  
  // Add token for all other routes
  const accessToken = localStorage.getItem('access');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const startLivenessSession = async () => {
  try {
    const response = await api.post('kyc/start-liveness-session/', {});
    return response.data;
  } catch (error) {
    console.error('Error starting liveness session:', error);
    throw error;
  }
};

export const checkLiveness = async (sessionId: string) => {
  try {
    const response = await api.post('kyc/check-liveness/', {
      sessionId
    });
    return response.data;
  } catch (error) {
    console.error('Error checking liveness:', error);
    throw error;
  }
};

export const processLiveness = async (sessionId: string, frames: string[]) => {
  try {
    const response = await api.post('kyc/process-liveness/', {
      sessionId,
      frames
    });
    return response.data;
  } catch (error) {
    console.error('Error processing liveness:', error);
    throw error;
  }
};

export const signup = async (data: any) => {
  const response = await api.post('auth/signup/', data);
  return response.data;
};

export const login = async (data: any) => {
  try {
    const loginResponse = await api.post('auth/login/', data);
    if (loginResponse.data.access) {
      localStorage.setItem('access', loginResponse.data.access);
      localStorage.setItem('refresh', loginResponse.data.refresh);
    }
    return loginResponse.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const submitKYC = async (imageSrc: string) => {
  try {
    // Convert base64/dataURL to blob
    const fetchResponse = await fetch(imageSrc);
    const blob = await fetchResponse.blob();
    
    // Create file from blob
    const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
    
    // Create FormData
    const formData = new FormData();
    formData.append('selfie', file);

    const kycResponse = await api.post('kyc/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return kycResponse.data;
  } catch (error) {
    console.error('KYC submission error:', error);
    throw error;
  }
};

export default api;
