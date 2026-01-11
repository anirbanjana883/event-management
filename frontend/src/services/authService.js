import api from './api';

// Register User
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login User
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Get Current User Profile (Optional, for later)
export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};