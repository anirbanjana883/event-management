import api from './api';

export const getDashboardStats = async (eventId) => {
  const response = await api.get(`/organizer/dashboard/${eventId}`);
  return response.data;
};

export const getEventStats = async (eventId) => {
  // 👇 Correct URL matching your backend route
  const response = await api.get(`/organizer/events/${eventId}/analytics`);
  return response.data;
};

export const getCheckedInAttendees = async (eventId) => {
  const response = await api.get(`/organizer/events/${eventId}/attendees`);
  return response.data;
};
