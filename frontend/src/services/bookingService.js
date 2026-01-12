import api from './api';

// 1. Initiate Checkout
export const initiateCheckout = async (eventId, quantity = 1) => {
  const response = await api.post('/bookings/checkout', { eventId, quantity });
  return response.data;
};

// 2. Verify Payment
export const verifyPayment = async (paymentData) => {
  const response = await api.post('/bookings/verify', paymentData);
  return response.data;
};

// 3. Rollback (When Payment Popup is Closed)
export const cancelBooking = async (orderId) => {
  const response = await api.post('/bookings/cancel', { orderId });
  return response.data;
};

// 4. NEW: Cancel Confirmed Ticket (User Dashboard)
export const cancelMyTicket = async (ticketId) => {
  const response = await api.post('/bookings/cancel-ticket', { ticketId });
  return response.data;
};

export const getMyTickets = async () => {
  const response = await api.get('/bookings/my-tickets');
  return response.data;
};

export const getTicketDetails = async (ticketId) => {
  const response = await api.get(`/bookings/ticket/${ticketId}`);
  return response.data;
};

export const scanTicket = async (ticketId) => {
  const response = await api.post('/bookings/scan', { ticketId });
  return response.data;
};