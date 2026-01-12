import { useEffect, useState } from 'react';
// Added Trash2 for the delete button
import { Calendar, MapPin, QrCode, Ticket, Trash2 } from 'lucide-react'; 
import TicketModal from '../../components/tickets/TicketModal'; 
import { getMyTickets, cancelMyTicket } from '../../services/bookingService'; // Import the new function
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Helper function to load data
  const fetchBookings = async () => {
    try {
      const data = await getMyTickets();
      setBookings(data.data.tickets);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- NEW: HANDLE TICKET CANCELLATION ---
  const handleCancel = async (e, ticketId) => {
    e.stopPropagation(); // Prevent opening the QR modal when clicking delete
    
    if(!window.confirm("Are you sure you want to cancel this ticket? Only 50% refund will be processed.")) return;

    try {
        toast.loading("Cancelling ticket...");
        await cancelMyTicket(ticketId);
        
        toast.dismiss();
        toast.success("Ticket Cancelled Successfully");
        
        // Refresh the list to show the "Cancelled" status
        fetchBookings(); 
    } catch (error) {
        toast.dismiss();
        toast.error(error.response?.data?.message || "Cancellation failed");
    }
  };

  if (loading) return <div className="text-center text-white mt-20 animate-pulse">Loading Tickets...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        My Tickets <span className="text-sm font-normal text-gray-500 bg-[#222] px-3 py-1 rounded-full">{bookings.length} Total</span>
      </h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a] rounded-2xl border border-dashed border-[#333]">
          <div className="bg-[#222] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="text-gray-500" />
          </div>
          <p className="text-gray-500 mb-4">You haven't booked any events yet.</p>
          <a href="/events" className="text-red-500 hover:underline font-bold">Browse Events</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div 
              key={booking._id} 
              // Disable click if cancelled
              onClick={() => booking.status !== 'cancelled' && setSelectedTicketId(booking._id)}
              className={`border rounded-2xl p-6 flex flex-col sm:flex-row gap-6 transition-all relative overflow-hidden group 
                ${booking.status === 'cancelled' 
                    ? 'bg-[#111] border-[#222] opacity-60 cursor-not-allowed' 
                    : 'bg-[#1a1a1a] border-[#333] hover:border-red-500/50 hover:bg-[#222] cursor-pointer'
                }`}
            >
              {/* Colored Side Strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${booking.status === 'cancelled' ? 'bg-gray-700' : 'bg-gradient-to-b from-red-600 to-red-900 group-hover:w-2'}`}></div>

              {/* QR Section */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[#111] border border-[#333] p-2 rounded-xl w-24 h-24 sm:w-32 sm:h-32 mx-auto sm:mx-0 shadow-lg">
                {booking.status === 'cancelled' ? (
                    <span className="text-gray-600 font-bold text-xs uppercase">Cancelled</span>
                ) : (
                    <>
                        <QrCode className="text-red-500 w-10 h-10 mb-2 opacity-80" />
                        <span className="text-[10px] uppercase font-bold text-gray-500">Tap to View</span>
                    </>
                )}
              </div>

              {/* Details */}
              <div className="flex-grow text-center sm:text-left flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                        {booking.event?.title || "Unknown Event"}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <Calendar size={14} className="text-red-500" />
                        {booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : "TBA"}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <MapPin size={14} className="text-red-500" />
                        <span className="line-clamp-1">{booking.event?.location || "Online"}</span>
                    </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                        <div className={`inline-block px-3 py-1 text-xs font-bold rounded-full border 
                            ${booking.status === 'cancelled' 
                                ? 'bg-gray-800 text-gray-400 border-gray-700' 
                                : 'bg-green-900/20 text-green-400 border-green-500/20'}`}>
                            {booking.status.toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600 font-mono">
                            #{booking._id.slice(-6).toUpperCase()}
                        </span>
                    </div>

                    {/* NEW: CANCEL BUTTON */}
                    {booking.status !== 'cancelled' && (
                        <button 
                            onClick={(e) => handleCancel(e, booking._id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors z-20"
                            title="Cancel Ticket"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicketId && (
        <TicketModal 
            ticketId={selectedTicketId} 
            onClose={() => setSelectedTicketId(null)} 
        />
      )}
    </div>
  );
};

export default UserDashboard;