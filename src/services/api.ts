import axios from 'axios';

const API_URL = 'https://kyc-back-rmgs.onrender.com/'; // Replace with your actual API URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
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

export const submitKYC = async (selfieImage: string) => {
  const response = await api.post('/kyc/', { selfieImage });
  return response.data;
};

export default api;
