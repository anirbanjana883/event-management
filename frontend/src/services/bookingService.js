import api from './api';

export const initiateCheckout = async (eventId, quantity = 1) => { 
  const response = await api.post('/bookings/checkout', { eventId, quantity }); 
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  // paymentData = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  const response = await api.post('/bookings/verify', paymentData);
  return response.data;
};

export const getMyTickets = async () => {
  const response = await api.get('/bookings/my-tickets');
  return response.data; 
};

export const getTicketDetails = async (ticketId) => {
  const response = await api.get(`/bookings/${ticketId}`);
  return response.data;
};

export const scanTicket = async (ticketId) => {
  const response = await api.post('/bookings/scan', { ticketId });
  return response.data;
};


export const cancelBooking = async (orderId) => {
  const response = await api.post('/bookings/cancel', { orderId });
  return response.data;
};

const bookingService = {
  initiateCheckout,
  verifyPayment,
  getMyTickets,
  getTicketDetails,
  scanTicket,
  cancelBooking
};

export default bookingService;