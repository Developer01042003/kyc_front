import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { login } from '../services/api';
import FormField from './FormField';
import { LoginData } from '../types/auth';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginData>({ 
    email: '', 
    password: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token } = await login(credentials);
      localStorage.setItem('token', token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const handleChange = (field: keyof LoginData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials({ ...credentials, [field]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email"
          type="email"
          required
          onChange={handleChange('email')}
        />
        <FormField
          label="Password"
          type="password"
          required
          onChange={handleChange('password')}
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white rounded-md py-2 hover:bg-green-700 transition-colors"
        >
          Login
        </button>
      </form>
      
      <div className="text-center text-sm">
        <span className="text-gray-600">Don't have an account? </span>
        <Link 
          to="/signup" 
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Sign up here
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;