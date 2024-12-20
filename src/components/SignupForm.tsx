import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { signup } from '../services/api';
import { SignupData } from '../types/auth';
import FormField from './FormField';

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupData>({
    full_name: '',
    username: '',
    email: '',
    password: '',
    whatsapp: '',
    gender: 'male',
    address: '',
    country: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(formData);
      toast.success('Signup successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    }
  };

  const handleChange = (field: keyof SignupData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Full Name"
        type="text"
        required
        onChange={handleChange('full_name')}
      />
      <FormField
        label="Username"
        type="text"
        required
        onChange={handleChange('username')}
      />
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
      <FormField
        label="WhatsApp"
        type="tel"
        required
        onChange={handleChange('whatsapp')}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          onChange={handleChange('gender')}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <FormField
        label="Address"
        type="text"
        required
        onChange={handleChange('address')}
      />
      <FormField
        label="Country"
        type="text"
        required
        onChange={handleChange('country')}
      />
      <button
        type="submit"
        className="w-full bg-green-600 text-white rounded-md py-2 hover:bg-green-700 transition-colors"
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignupForm;