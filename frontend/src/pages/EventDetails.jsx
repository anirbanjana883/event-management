import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// 1. NEW IMPORTS: Plus and Minus icons
import { Calendar, MapPin, ArrowLeft, Ticket, AlignLeft, Plus, Minus } from 'lucide-react';
import { getEventById } from '../services/eventService';
import { initiateCheckout, verifyPayment, cancelBooking } from '../services/bookingService'; 
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 2. NEW STATE: Track how many tickets the user wants
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(id);
        setEvent(data.data.event);
      } catch (error) {
        toast.error("Could not load event details");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  // 3. NEW FUNCTIONS: Handle Quantity Changes
  const incrementQty = () => {
    // Limit to max 5 tickets per user OR available seats
    if (quantity < 5 && quantity < event.availableSeats) {
      setQuantity(prev => prev + 1);
    } else if (quantity >= 5) {
      toast("Max 5 tickets per person", { icon: "✋" });
    }
  };
  
  const decrementQty = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleBookTicket = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please login to book tickets 🔒");
      navigate('/login');
      return;
    }

    try {
      toast.loading(`Initiating Payment for ${quantity} tickets...`);

      // 4. UPDATE: Pass 'quantity' to the backend
      const response = await initiateCheckout(id, quantity); 
      
      const { order, key_id } = response.data; 

      toast.dismiss();

      const options = {
        key: key_id,
        amount: order.amount, 
        currency: order.currency,
        name: "EventLoop",
        description: `Booking ${quantity} tickets for ${event.title}`, // Shows correct count in Razorpay
        order_id: order.id,
        
        handler: async function (paymentResponse) {
          try {
             toast.loading("Verifying Payment...");
             
             await verifyPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
             });

             toast.dismiss();
             toast.success(`${quantity} Tickets Booked Successfully! 🎉`);
             navigate('/dashboard'); 
             
          } catch (err) {
             toast.dismiss();
             toast.error("Payment Verification Failed");
             console.error(err);
          }
        },
        
        // Handle User Closing Popup (Rollback)
        modal: {
            ondismiss: async function() {
                toast.error("Payment Cancelled");
                await cancelBooking(order.id); 
            }
        },
        theme: {
          color: "#dc2626", 
        },
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', async function (response){
        toast.dismiss();
        toast.error("Payment Failed");
        await cancelBooking(order.id);
      });

      rzp1.open();

    } catch (error) {
        toast.dismiss();
        console.error("Booking Error:", error);
        toast.error(error.response?.data?.message || "Could not initiate payment.");
    }
  };

  if (loading) return <div className="text-white text-center mt-20 animate-pulse">Loading Event Details...</div>;
  if (!event) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN (Same as before) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-[#1a1a1a] via-[#222] to-[#1a1a1a] border border-[#333] p-8 md:p-10 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
               <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider rounded-full mb-6 border border-red-500/20">
                  <Ticket size={14} /> Official Event
               </span>
               <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
                 {event.title}
               </h1>
               
               <div className="flex items-start gap-4">
                 <AlignLeft className="text-gray-500 mt-1 flex-shrink-0" size={24} />
                 <p className="text-lg text-gray-300 leading-relaxed">
                   {event.description}
                 </p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#1a1a1a] rounded-2xl border border-[#333] flex items-start gap-5 group hover:border-red-500/30 transition-colors">
              <div className="p-4 bg-[#0f0f0f] border border-[#333] rounded-xl text-red-500 group-hover:text-red-400 transition-colors">
                <Calendar size={28} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Date & Time</h3>
                <p className="text-gray-400 text-base">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-gray-500 text-sm mt-1">Doors open 1 hour prior</p>
              </div>
            </div>

            <div className="p-6 bg-[#1a1a1a] rounded-2xl border border-[#333] flex items-start gap-5 group hover:border-red-500/30 transition-colors">
              <div className="p-4 bg-[#0f0f0f] border border-[#333] rounded-xl text-red-500 group-hover:text-red-400 transition-colors">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Location</h3>
                <p className="text-gray-400 text-base">{event.location}</p>
                <p className="text-gray-500 text-sm mt-1">View Venue Details</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Updated Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>

            <h3 className="text-2xl font-bold text-white mb-8 mt-2">Select Tickets</h3>
            
            {/* 5. NEW: Quantity Selector UI */}
            <div className="flex justify-between items-center mb-8 pb-8 border-b border-[#333] bg-[#0f0f0f] p-4 rounded-xl">
              <div>
                <span className="text-gray-400 block text-sm mb-1">General Admission</span>
                <span className="text-xs text-gray-500">Includes entry & access</span>
              </div>
              
              <div className="flex items-center gap-3 bg-[#222] rounded-lg p-1 border border-[#333]">
                 <button 
                   onClick={decrementQty}
                   disabled={quantity <= 1}
                   className="p-2 hover:bg-[#333] rounded-md disabled:opacity-30 transition cursor-pointer"
                 >
                   <Minus size={16} className="text-white" />
                 </button>
                 <span className="text-white font-bold w-4 text-center">{quantity}</span>
                 <button 
                   onClick={incrementQty}
                   disabled={quantity >= 5 || quantity >= event.availableSeats}
                   className="p-2 hover:bg-[#333] rounded-md disabled:opacity-30 transition cursor-pointer"
                 >
                   <Plus size={16} className="text-white" />
                 </button>
              </div>
            </div>

            {/* 6. NEW: Total Price Calculation */}
            <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400">Total Price</span>
                <span className="text-2xl font-bold text-white">₹{event.price * quantity}</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-400">Availability</span>
                <span className={event.availableSeats > 10 ? "text-green-400" : "text-red-400"}>
                  {event.availableSeats} seats left
                </span>
              </div>
              <div className="w-full bg-[#0f0f0f] h-3 rounded-full overflow-hidden border border-[#333]">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${event.availableSeats > 10 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
                ></div>
              </div>
               <p className="text-xs text-gray-500 text-right">{event.totalSeats} total capacity</p>
            </div>

            <button 
              onClick={handleBookTicket}
              disabled={event.availableSeats === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                event.availableSeats > 0
                ? "bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
                : "bg-[#333] text-gray-500 cursor-not-allowed"
              }`}
            >
              {event.availableSeats > 0 ? (
                <>
                  <Ticket size={20} /> Pay ₹{event.price * quantity}
                </>
              ) : (
                "Sold Out"
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 12c0 5.082 2.923 9.441 7.318 11.58a.75.75 0 00.664 0c4.395-2.139 7.318-6.498 7.318-11.58 0-2.118-.437-4.13-1.235-5.967a.75.75 0 00-.722-.515 11.209 11.209 0 01-7.877-3.08zM12 13.25a.75.75 0 00.75-.75V6.75a.75.75 0 00-1.5 0v5.75c0 .414.336.75.75.75zM12 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Secure 256-bit SSL Encrypted Payment
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetails;