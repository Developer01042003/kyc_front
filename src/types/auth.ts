export interface SignupData {
  full_name: string;
  username: string;
  email: string;
  password: string;
  whatsapp: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  country: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  kycStatus: 'pending' | 'verified' | 'not_submitted';
}