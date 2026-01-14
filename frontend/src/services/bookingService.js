import api from './api';

// 1. Initiate Checkout
export const initiateCheckout = async (eventId, quantity = 1) => {
  // ⚠️ FIX: Matches backend route '/tickets/book'
  const response = await api.post('/tickets/book', { eventId, quantity });
  return response.data;
};

// 2. Verify Payment
export const verifyPayment = async (paymentData) => {
  // ⚠️ FIX: Matches backend route '/tickets/verify'
  const response = await api.post('/tickets/verify', paymentData);
  return response.data;
};

// 3. Get My Tickets
export const getMyTickets = async () => {
  // ⚠️ FIX: Matches backend route '/tickets/my-tickets'
  const response = await api.get('/tickets/my-tickets');
  return response.data;
};

// 4. Cancel Ticket
export const cancelMyTicket = async (ticketId) => {
  const response = await api.post('/tickets/cancel-ticket', { ticketId });
  return response.data;
};

// 5. Scan Ticket (Organizer)
export const scanTicket = async (qrDataRaw) => {
  const response = await api.post('/organizer/scan', { qrData: qrDataRaw });
  return response.data;
};

export const cancelBooking = async (orderId) => {
  return { success: true };
};

export const getTicketDetails = async (ticketId) => {
  // Temporary workaround: fetch all and find the specific one
  const response = await api.get('/tickets/my-tickets');
  const ticket = response.data.data.tickets.find((t) => t._id === ticketId);
  return { data: { ticket } };
};