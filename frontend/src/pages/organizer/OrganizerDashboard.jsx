import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, QrCode, Calendar } from 'lucide-react';
import api from '../../services/api';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        // Adjust endpoint based on your routes. 
        // Usually: /events?organizer=ME or a specific /my-events route
        const res = await api.get('/events?sort=-createdAt'); 
        // For now, filtering client-side if API returns all
        // In production, use a dedicated endpoint: /api/v1/organizer/my-events
        setEvents(res.data.data.events); 
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  if (loading) return <div className="text-white text-center mt-20">Loading Command Center...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Organizer Dashboard</h1>
            <p className="text-gray-400">Manage your events and entry</p>
        </div>
        <Link to="/create-event" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition">
          <Plus size={20} /> Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-hidden hover:border-gray-600 transition group">
            
            {/* Event Image / Gradient Placeholder */}
            <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 relative">
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-xl font-bold text-white leading-tight">{event.title}</h3>
                </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                 <Calendar size={14} />
                 {new Date(event.date).toLocaleDateString()}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#111] p-3 rounded-lg border border-[#333]">
                    <p className="text-gray-500 text-xs uppercase">Sold</p>
                    <p className="text-white font-mono text-xl">{event.totalSeats - event.availableSeats}</p>
                </div>
                <div className="bg-[#111] p-3 rounded-lg border border-[#333]">
                    <p className="text-gray-500 text-xs uppercase">Remaining</p>
                    <p className="text-white font-mono text-xl">{event.availableSeats}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                 <Link 
                    to={`/organizer/scan/${event._id}`}
                    className="flex-1 bg-white text-black py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                 >
                    <QrCode size={18} /> Scan Entry
                 </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizerDashboard;