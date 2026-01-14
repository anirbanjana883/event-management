import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, QrCode, Calendar, TrendingUp } from 'lucide-react';
import api from '../../services/api';
// 1. Import the new service and component
import { getAnalytics } from '../../services/organizerService';
import SalesChart from '../../components/dashboard/SalesChart';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  // 2. State for Analytics
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const res = await api.get('/events?sort=-createdAt'); // Assuming this returns user's events or filtered
        const myEvents = res.data.data.events;
        setEvents(myEvents);
        
        // Auto-select the first event to show stats
        if (myEvents.length > 0) {
          setSelectedEventId(myEvents[0]._id);
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  // 3. Fetch Chart Data when selectedEventId changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedEventId) return;
      try {
        const res = await getAnalytics(selectedEventId);
        setChartData(res.data.stats);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, [selectedEventId]);

  if (loading) return <div className="text-white text-center mt-20">Loading Command Center...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Organizer Dashboard</h1>
            <p className="text-gray-400">Manage your events and track performance</p>
        </div>
        <Link to="/create-event" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
            <Plus size={20} /> Create Event
        </Link>
      </div>

      {/* 4. Event Selector (If multiple events) */}
      {events.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4 mb-6">
          {events.map(event => (
            <button
              key={event._id}
              onClick={() => setSelectedEventId(event._id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                selectedEventId === event._id 
                ? 'bg-white text-black' 
                : 'bg-[#111] text-gray-400 border border-[#333] hover:border-white'
              }`}
            >
              {event.title}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Events List */}
        <div className="lg:col-span-2 space-y-6">
           {/* 5. THE NEW CHART SECTION */}
           {selectedEventId && (
              <div className="mb-8">
                <SalesChart data={chartData} />
              </div>
           )}

           {/* Existing Events List Logic */}
           <h3 className="text-xl font-bold text-white mb-4">Your Events</h3>
           {events.map((event) => (
            <div key={event._id} className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden hover:border-gray-500 transition-colors group">
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Calendar size={14} />
                                {new Date(event.date).toLocaleDateString()}
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            {event.isActive ? 'LIVE' : 'ENDED'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-[#111] p-3 rounded-lg border border-[#333]">
                            <p className="text-gray-500 text-xs uppercase">Sold</p>
                            <p className="text-white font-mono text-xl">{event.totalSeats - event.availableSeats}</p>
                        </div>
                        <div className="bg-[#111] p-3 rounded-lg border border-[#333]">
                            <p className="text-gray-500 text-xs uppercase">Revenue</p>
                            <p className="text-green-400 font-mono text-xl">₹{(event.totalSeats - event.availableSeats) * event.price}</p>
                        </div>
                    </div>

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

        {/* Right Column: Quick Actions / Summary */}
        <div className="bg-[#111] p-6 rounded-xl border border-[#333] h-fit">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="text-red-500" /> Quick Stats
            </h3>
            <div className="space-y-4">
                <div className="p-4 bg-black/50 rounded-lg">
                    <p className="text-gray-500 text-sm">Total Events</p>
                    <p className="text-2xl font-bold text-white">{events.length}</p>
                </div>
                {/* You can add more global stats here later */}
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;