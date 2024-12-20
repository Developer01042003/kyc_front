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
  if (config.url && (config.url.includes('/auth/login/') || config.url.includes('/auth/signup/'))) {
    return config;
  }
  
  // Add token for all other routes
   const accessToken = localStorage.getItem('access');  // Changed from 'token' to 'access'
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const signup = async (data: SignupData) => {
  const response = await api.post('/auth/signup/', data);
  return response.data;
};

export const login = async (data: LoginData) => {
  try {
    const response = await api.post('/auth/login/', data);
    console.log('Login Response:', response.data);

    // Save with the correct key 'access' instead of 'token'
    if (response.data.access) {
      localStorage.setItem('access', response.data.access);  // Changed from 'token' to 'access'
      localStorage.setItem('refresh', response.data.refresh);
      console.log('Saved access token:', localStorage.getItem('access')); // Verify saved token
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const submitKYC = async (imageSrc: string) => {
  try {
    // Convert base64/dataURL to blob
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    
    // Create file from blob
    const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
    
    // Create FormData
    const formData = new FormData();
    formData.append('selfie', file);

    // Log for debugging
    console.log('Sending file:', file);

    const response = await api.post('/kyc/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error('KYC submission error:', error);
    throw error;
  }
};
export default api;
