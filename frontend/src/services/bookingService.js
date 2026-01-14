import api from './api';


export const initiateCheckout = async (eventId, quantity = 1) => {
  // ⚠️ FIX: Matches backend route '/tickets/book'
  const response = await api.post('/tickets/book', { eventId, quantity });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await api.post('/tickets/verify', paymentData);
  return response.data;
};

export const getMyTickets = async () => {
  const response = await api.get('/tickets/my-tickets');
  return response.data;
};

export const cancelMyTicket = async (ticketId) => {
  const response = await api.post('/tickets/cancel-ticket', { ticketId });
  return response.data;
};

export const scanTicket = async (qrDataRaw) => {
  const response = await api.post('/organizer/scan', { qrData: qrDataRaw });
  return response.data;
};

export const cancelBooking = async (orderId) => {
  return { success: true };
};

export const getTicketDetails = async (ticketId) => {
  const response = await api.get('/tickets/my-tickets');
  const ticket = response.data.data.tickets.find((t) => t._id === ticketId);
  return { data: { ticket } };
};

export const checkInManually = async (ticketId) => {
  const response = await api.post('/organizer/manual-checkin', { ticketId });
  return response.data;
};