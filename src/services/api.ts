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

export const submitKYC = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('selfie', file);  // Make sure the key matches backend expectation

    const accessToken = localStorage.getItem('access');
    console.log('File being sent:', file);  // Debug log
    console.log('FormData contents:', Array.from(formData.entries())); // Debug log

    const response = await axios.post(`${API_URL}kyc/`, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('KYC Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};
export default api;
