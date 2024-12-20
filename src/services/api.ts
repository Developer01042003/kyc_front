import axios, { AxiosError } from 'axios';

const API_URL = 'https://kyc-back-rmgs.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interfaces for type safety
interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  whatsapp: string;
  gender: string;
  address: string;
  country: string;
}



// Error handler
const handleApiError = (error: AxiosError) => {
  if (error.response) {
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    
    // Specific error handling based on status
    switch (error.response.status) {
      case 401:
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        break;
      case 403:
        console.error('Forbidden: You do not have permission');
        break;
      case 404:
        console.error('Not Found: The requested resource does not exist');
        break;
      case 500:
        console.error('Server Error: Please try again later');
        break;
    }
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Error setting up request:', error.message);
  }
  
  throw error;
};

// Interceptor
api.interceptors.request.use((config) => {
  // Skip adding token for login and signup routes
  if (config.url && (config.url.includes('/auth/login/') || config.url.includes('/auth/signup/'))) {
    return config;
  }
  
  // Add token for all other routes
  const accessToken = localStorage.getItem('access');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Liveness-related API calls
export const startLivenessSession = async () => {
  try {
    const response = await api.post('/kyc/kyc/start-liveness-session/');
    return response.data;
  } catch (error) {
    console.error('Error starting liveness session:', error);
    throw error;
  }
};

export const processLiveness = async (sessionId: string, frames: string[]) => {
  try {
    const response = await api.post('/kyc/kyc/process-liveness/', {
      sessionId,
      frames
    });
    return response.data;
  } catch (error) {
    console.error('Error processing liveness:', error);
    throw error;
  }
};

export const getSessionResults = async (sessionId: string) => {
  try {
    const response = await api.get(`/kyc/kyc/session-results/?sessionId=${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting session results:', error);
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

    const kycResponse = await api.post('/kyc/kyc/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return {
      ...kycResponse.data,
      selfieUrl: kycResponse.data.selfie_url || imageSrc
    };
  } catch (error) {
    handleApiError(error as AxiosError);
    throw error;
  }
};

export const signup = async (data: SignupData) => {
  try {
    const response = await api.post('/auth/signup/', data);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
    throw error;
  }
};

export const login = async (data: LoginData) => {
  try {
    const loginResponse = await api.post('/auth/login/', data);
    
    if (loginResponse.data.access) {
      localStorage.setItem('access', loginResponse.data.access);
      localStorage.setItem('refresh', loginResponse.data.refresh);
    }
    
    return loginResponse.data;
  } catch (error) {
    handleApiError(error as AxiosError);
    throw error;
  }
};

export const getLivenessStatus = async () => {
  try {
    const response = await api.get('/kyc/kyc/liveness-status/');
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
    throw error;
  }
};

export default api;
