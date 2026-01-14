import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, Zap } from 'lucide-react';

const EventCard = ({ event }) => {
  // Fallback image if event has no image
  const bgImage = event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80";
  
  const dateObj = new Date(event.date);
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const day = dateObj.getDate();

  return (
    <div className="group relative w-full bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] flex flex-col h-[400px]">
      
      {/* --- IMAGE SECTION --- */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent z-10" />
        <img 
          src={bgImage} 
          alt={event.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Floating Date Badge */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-lg z-20 text-center min-w-[60px]">
          <span className="block text-xs text-red-400 font-bold uppercase tracking-wider">{month}</span>
          <span className="block text-2xl font-black text-white leading-none">{day}</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${
            event.availableSeats > 0 
              ? "bg-green-500/20 border-green-500/30 text-green-400" 
              : "bg-red-500/20 border-red-500/30 text-red-400"
          }`}>
            {event.availableSeats > 0 ? "Available" : "Sold Out"}
          </span>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-5 flex flex-col flex-grow relative z-20">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
          {event.title}
        </h3>

        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <MapPin size={14} className="text-red-500 shrink-0" />
          <span className="truncate">{event.location?.address || "Secret Location"}</span>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-auto"></div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Price</p>
            <p className="text-2xl font-bold text-white">₹{event.price}</p>
          </div>

          <Link 
            to={`/event/${event._id}`} 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              event.availableSeats > 0 
                ? "bg-white text-black hover:bg-red-600 hover:text-white hover:scale-110" 
                : "bg-[#333] text-gray-600 cursor-not-allowed"
            }`}
          >
            {event.availableSeats > 0 ? <ArrowRight size={20} /> : <Zap size={20} />}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;