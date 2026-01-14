import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// 1. Define the missing helper function
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BookEvent = ({ eventId, price, currentUser }) => {
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    // 2. Auth Check
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please login to book tickets");
      return;
    }

    try {
      setLoading(true);
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      // 3. Create Order -> Matches bookingController.js
      // ⚠️ CORRECT URL: Your app.js maps bookingRoutes to '/tickets', NOT '/bookings'
      const { data: orderRes } = await axios.post(
        'http://localhost:5000/api/v1/tickets/book', 
        { eventId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order, key } = orderRes.data;

      // 4. Configure Razorpay
      const options = {
        key: key, 
        amount: order.amount,
        currency: order.currency,
        name: "EventLoop",
        description: "Event Ticket",
        order_id: order.id,
        handler: async function (response) {
          try {
            // 5. Verify Payment -> Matches bookingController.js
            const verifyRes = await axios.post(
              'http://localhost:5000/api/v1/tickets/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Booking Confirmed! Check your email.');
            // Redirect or show ticket modal here
            
          } catch (err) {
            console.error(err);
            toast.error('Payment verified failed. Contact support.');
          }
        },
        prefill: {
          name: currentUser?.name,
          email: currentUser?.email,
        },
        theme: { color: "#E11D48" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        toast.error(response.error.description);
      });
      rzp1.open();

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBooking}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
        loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-[1.02]'
      }`}
    >
      {loading ? 'Processing...' : `Book Ticket • ₹${price}`}
    </button>
  );
};

export default BookEvent;