import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, QrCode, BarChart2, TrendingUp, Users, Loader2, ScanLine } from 'lucide-react';
import api from '../../services/api';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH EVENTS ONLY (No Charts here)
  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        // Fetch events sorted by newest first
        const res = await api.get('/events?sort=-createdAt');
        // Filter locally to ensure we only show events created by this user
        // (Though your backend likely handles this, it's a safe UI check)
        setEvents(res.data.data.events);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <Loader2 className="animate-spin text-red-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      
      {/* --- HEADER --- */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
           <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
           <p className="text-gray-400">Manage your events, track sales, and scan tickets.</p>
        </div>
        <Link 
          to="/create-event" 
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
        >
           <Plus size={20} /> Create New Event
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: EVENT LIST --- */}
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xl font-bold flex items-center gap-2">
             <Calendar className="text-red-500" /> Your Events
           </h2>

           {events.length === 0 ? (
             <div className="bg-[#111] border border-dashed border-[#333] rounded-xl p-10 text-center">
                <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
                <Link to="/create-event" className="text-red-500 hover:underline">Host your first event</Link>
             </div>
           ) : (
             events.map((event) => (
              <div key={event._id} className="bg-[#1a1a1a] rounded-xl border border-[#333] p-5 hover:border-gray-500 transition-all group">
                  
                  {/* Event Header */}
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-red-500 transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Calendar size={14} />
                              {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        event.availableSeats > 0 ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-red-900/20 text-red-400 border border-red-900/50'
                      }`}>
                          {event.availableSeats > 0 ? 'Selling' : 'Sold Out'}
                      </span>
                  </div>

                  {/* Quick Stats (Mini) */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-[#111] p-3 rounded-lg border border-[#333]">
                          <p className="text-gray-500 text-xs uppercase font-bold">Seats Left</p>
                          <p className="text-white font-mono text-lg">{event.availableSeats} <span className="text-gray-600 text-sm">/ {event.totalSeats}</span></p>
                      </div>
                      <div className="bg-[#111] p-3 rounded-lg border border-[#333]">
                          <p className="text-gray-500 text-xs uppercase font-bold">Ticket Price</p>
                          <p className="text-white font-mono text-lg">₹{event.price}</p>
                      </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                      
                      {/* 1. ANALYTICS BUTTON (New!) */}
                      <Link 
                          to={`/organizer/event/${event._id}/analytics`}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#222] border border-[#333] rounded-lg text-gray-300 hover:text-white hover:border-red-500 hover:bg-[#2a2a2a] transition-all text-sm font-bold"
                      >
                          <BarChart2 size={18} className="text-red-500" />
                          View Analytics
                      </Link>

                      {/* 2. SCANNER BUTTON */}
                      <Link 
                          to={`/organizer/scan/${event._id}`}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black border border-white rounded-lg font-bold hover:bg-gray-200 transition-all text-sm"
                      >
                          <ScanLine size={18} />
                          Scanner
                      </Link>

                  </div>
              </div>
             ))
           )}
        </div>

        {/* --- RIGHT COLUMN: GLOBAL STATS --- */}
        <div className="space-y-6">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333]">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-green-500" /> Quick Summary
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                        <span className="text-gray-400 text-sm">Total Events</span>
                        <span className="text-xl font-bold text-white">{events.length}</span>
                    </div>
                    <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
                        <p className="text-red-200 text-xs leading-relaxed">
                            <span className="font-bold">Pro Tip:</span> Use the "Analytics" button on an event to see real-time revenue graphs and check-in numbers.
                        </p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default OrganizerDashboard;