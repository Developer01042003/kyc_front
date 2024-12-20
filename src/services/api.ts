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
  const response = await api.post('auth/signup/', data);
  return response.data;
};

export const login = async (data: LoginData) => {
  try {
    const response = await api.post('auth/login/', data);
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
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = imageSrc.split(',')[1] || imageSrc;
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: 'image/jpeg' });
    const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

    // Create FormData
    const formData = new FormData();
    formData.append('selfie', file);

    // Log for debugging
    console.log('Sending KYC image:', {
      fileSize: file.size,
      fileType: file.type
    });

    const response = await api.post('/kyc/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    console.log('KYC Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('KYC Error:', {
      message: error.message,
      response: error.response?.data
    });
    throw error;
  }
};
export default api;
