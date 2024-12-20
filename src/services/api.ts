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
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = async (data: SignupData) => {
  const response = await api.post('/auth/signup/', data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await api.post('/auth/login/', data);
  return response.data;
};

export const submitKYC = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('selfie', file);

    const token = localStorage.getItem('token'); // Keep 'token' if that's what you're using
    
    const response = await axios.post(`${API_URL}kyc/`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
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
