import { useEffect, useState } from 'react';
import { Calendar, MapPin, Ticket, ArrowRight, Loader2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllEvents } from '../services/eventService';
import toast from 'react-hot-toast';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA ON LOAD
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents();
        setEvents(data.data.events); 
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">Loading Experience...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-red-500/30 rounded-full bg-red-900/10 text-red-400 text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Live Events in Your City
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          Experience the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">Unforgettable</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          From electric concerts to tech summits. Secure your spot at the most exclusive events happening around you.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="#events" className="btn-primary flex items-center justify-center gap-2 group">
            <Ticket size={20} />
            Book Tickets
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
          {/* <Link to="/register" className="btn-secondary">
            Sign Up Free
          </Link> */}
        </div>
      </section>

      {/* EVENTS GRID SECTION */}
      <section id="events" className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Trending Events 🔥</h2>
            <p className="text-gray-400">Handpicked experiences just for you.</p>
          </div>
        </div>

        {events.length === 0 ? (
           <div className="text-center py-20 bg-[#1a1a1a] rounded-xl border border-dashed border-gray-700">
             <p className="text-gray-500 text-lg">No active events found.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event._id} className="tuf-card group flex flex-col h-full relative overflow-hidden bg-[#1a1a1a] border border-[#333] hover:border-red-500/50 transition-all duration-300 rounded-xl">
                
                {/* 1. Gradient Top Border (The "Visual Hook") */}
                <div className="h-2 w-full bg-gradient-to-r from-red-600 to-red-900"></div>

                <div className="p-6 flex flex-col flex-grow">
                  
                  {/* 2. Header: Badge & Date */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="px-3 py-1 rounded-md bg-[#262626] border border-[#404040] text-xs font-bold text-gray-300 uppercase tracking-wide">
                      {event.availableSeats > 0 ? "Open Entry" : "Full House"}
                    </div>
                    {/* Highlighted Date */}
                    <div className="text-right">
                       <span className="block text-sm font-bold text-red-500 uppercase">
                         {new Date(event.date).toLocaleString('default', { month: 'short' })}
                       </span>
                       <span className="block text-2xl font-extrabold text-white leading-none">
                         {new Date(event.date).getDate()}
                       </span>
                    </div>
                  </div>

                  {/* 3. Title (The Hero) */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors">
                    {event.title}
                  </h3>

                  {/* 4. Details */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <MapPin size={16} className="text-red-500" />
                      {event.location}
                    </div>
                    
                    {/* Dynamic Availability Text */}
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <Zap size={16} className={event.availableSeats < 10 ? "text-yellow-500" : "text-gray-600"} />
                      {event.availableSeats === 0 ? (
                        <span className="text-red-500">Sold Out</span>
                      ) : (
                        <span>{event.availableSeats} seats remaining</span>
                      )}
                    </div>
                  </div>

                  {/* 5. Footer: Price & Action */}
                  <div className="mt-auto pt-5 border-t border-[#333] flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Starting from</p>
                      <p className="text-xl font-bold text-white">₹{event.price}</p>
                    </div>
                    
                    <Link 
                      to={`/event/${event._id}`}
                      className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg ${
                        event.availableSeats > 0 
                        ? "bg-white text-black hover:bg-gray-200 hover:shadow-white/10" 
                        : "bg-[#333] text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {event.availableSeats > 0 ? "Book Now" : "Closed"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;