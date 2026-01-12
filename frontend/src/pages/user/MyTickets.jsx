import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TicketCard from '../../components/tickets/TicketCard';
import TicketModal from '../../components/tickets/TicketModal';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get('/api/v1/tickets/my-tickets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTickets(res.data.data.tickets);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Tickets</h1>

      {loading ? (
        <div className="text-center text-gray-500 mt-10">Loading your tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center mt-10">
            <p className="text-xl text-gray-600">You haven't booked any events yet.</p>
            <a href="/events" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">Browse Events</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard 
              key={ticket._id} 
              ticket={ticket} 
              onClick={() => setSelectedTicketId(ticket._id)} 
            />
          ))}
        </div>
      )}

      {/* The Secure Modal */}
      {selectedTicketId && (
        <TicketModal 
          ticketId={selectedTicketId} 
          onClose={() => setSelectedTicketId(null)} 
        />
      )}
    </div>
  );
};

export default MyTickets;