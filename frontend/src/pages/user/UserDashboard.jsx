import { useEffect, useState } from 'react';
import { Calendar, MapPin, QrCode, Ticket } from 'lucide-react';
import TicketModal from '../../components/tickets/TicketModal'; 
import { getMyTickets } from '../../services/bookingService';

// 1. RENAME to UserDashboard
const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
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
    fetchBookings();
  }, []);

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
              onClick={() => setSelectedTicketId(booking._id)}
              className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 flex flex-col sm:flex-row gap-6 hover:border-red-500/50 hover:bg-[#222] transition-all cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 to-red-900 group-hover:w-2 transition-all"></div>

              {/* QR Section */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[#111] border border-[#333] p-2 rounded-xl w-24 h-24 sm:w-32 sm:h-32 mx-auto sm:mx-0 group-hover:scale-105 transition-transform shadow-lg">
                <QrCode className="text-red-500 w-10 h-10 mb-2 opacity-80" />
                <span className="text-[10px] uppercase font-bold text-gray-500">Tap to View</span>
              </div>

              {/* Details */}
              <div className="flex-grow text-center sm:text-left">
                {/* 2. SAFETY CHECK: Ensure event exists (in case it was deleted) */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors line-clamp-1">
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

                <div className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="inline-block px-3 py-1 bg-green-900/20 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                    {booking.status.toUpperCase()}
                    </div>
                    {/* 3. NEW: Ticket ID Snippet to distinguish identical tickets */}
                    <span className="text-xs text-gray-600 font-mono">
                        #{booking._id.slice(-6).toUpperCase()}
                    </span>
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