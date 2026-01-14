import api from './api';

// 1. Get Global Stats (Revenue, Users, Events)
export const getSystemStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// 2. Get All Users List
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

// 3. Ban/Delete a User
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};