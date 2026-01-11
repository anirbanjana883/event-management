import { useEffect, useState } from 'react';
import { Calendar, MapPin, Ticket, QrCode } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Assuming you have a backend route GET /bookings/my-bookings
        // If not, we might need to create it in backend, or this will fail.
        const response = await api.get('/bookings/my-bookings');
        setBookings(response.data.data.bookings);
      } catch (error) {
        console.error("Fetch error:", error);
        // toast.error("Could not load your tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="text-center text-white mt-20">Loading Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Tickets 🎟️</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a] rounded-2xl border border-dashed border-[#333]">
          <p className="text-gray-500 mb-4">You haven't booked any events yet.</p>
          <a href="/" className="text-red-500 hover:underline">Browse Events</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 flex flex-col sm:flex-row gap-6 hover:border-red-500/30 transition-colors relative overflow-hidden">
              
              {/* Decorative side strip */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-900"></div>

              {/* QR Code Section (Mock Visual) */}
              <div className="flex-shrink-0 flex items-center justify-center bg-white p-2 rounded-xl w-24 h-24 sm:w-32 sm:h-32 mx-auto sm:mx-0">
                <QrCode className="text-black w-full h-full opacity-80" />
              </div>

              {/* Ticket Details */}
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-bold text-white mb-2">{booking.event.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Calendar size={14} className="text-red-500" />
                    {new Date(booking.event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin size={14} className="text-red-500" />
                    {booking.event.location}
                  </div>
                </div>

                <div className="inline-block px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">
                  CONFIRMED • 1 Seat
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;