import React, { useState } from 'react';
import axios from 'axios';

const BookEvent = ({ eventId, price, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null); // Stores confirmed ticket with QR
  const [error, setError] = useState('');

  const handleBooking = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Initiate Booking (Get Order ID)
      const { data: orderResponse } = await axios.post('/api/v1/tickets/book', {
        eventId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const { order, key_id } = orderResponse.data;

      // 2. Setup Razorpay Options
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "EventLoop",
        description: "Event Ticket Booking",
        order_id: order.id,
        // Handler triggered on successful payment
        handler: async function (response) {
          try {
            // 3. Verify Payment on Backend
            const verifyRes = await axios.post('/api/v1/tickets/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // 4. Success! Save ticket data (contains QR Code)
            setTicket(verifyRes.data.data);
            alert('Booking Confirmed!');
          } catch (verifyError) {
            console.error(verifyError);
            setError('Payment successful, but verification failed. Contact support.');
          }
        },
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      // Open Razorpay Modal
      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response) {
        setError(`Payment Failed: ${response.error.description}`);
        // Optional: Call backend to release the seat held during initiation
      });

      rzp1.open();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong initiating booking.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Render Confirmed Ticket View
  if (ticket) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
        <h3 className="text-2xl font-bold text-green-700 mb-4">You're Going! 🎉</h3>
        <p className="mb-4 text-gray-600">Scan this QR code at the venue entry.</p>
        
        {/* Render the Base64 QR Code */}
        <div className="flex justify-center mb-4">
          <img 
            src={ticket.qrCode} 
            alt="Ticket QR Code" 
            className="w-48 h-48 border-4 border-white shadow-lg"
          />
        </div>
        
        <p className="text-sm text-gray-500">Ticket ID: {ticket.ticketId}</p>
        <button 
          onClick={() => window.print()} 
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Print Ticket
        </button>
      </div>
    );
  }

  // Default View
  return (
    <div className="flex flex-col items-start gap-3">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <button
        onClick={handleBooking}
        disabled={loading}
        className={`px-6 py-3 rounded-full font-bold text-white shadow-lg transition-all ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
        }`}
      >
        {loading ? 'Processing...' : `Book Now for ₹${price}`}
      </button>
    </div>
  );
};

export default BookEvent;