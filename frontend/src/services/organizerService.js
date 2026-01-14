import api from './api';

export const getDashboardStats = async (eventId) => {
  const response = await api.get(`/organizer/dashboard/${eventId}`);
  return response.data;
};

export const getAnalytics = async (eventId) => {
  const response = await api.get(`/organizer/analytics/${eventId}`);
  return response.data;
};

export const getCheckedInAttendees = async (eventId) => {
  const response = await api.get(`/organizer/events/${eventId}/attendees`);
  return response.data;
};
