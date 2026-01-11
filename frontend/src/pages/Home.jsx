import { Calendar, MapPin, Ticket, ArrowRight, Music, Code, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  // Mock Event Data
  const events = [
    {
      id: 1,
      title: "Neon City Concert",
      date: "Aug 15, 2026",
      location: "Mumbai Arena",
      price: "₹1,499",
      category: "Music",
      image: "🎵",
      seats: 120
    },
    {
      id: 2,
      title: "Tech Innovators Summit",
      date: "Sept 10, 2026",
      location: "Bangalore Convention",
      price: "₹499",
      category: "Tech",
      image: "💻",
      seats: 45
    },
    {
      id: 3,
      title: "Late Night Comedy",
      date: "Oct 05, 2026",
      location: "Delhi Laugh Club",
      price: "₹899",
      category: "Comedy",
      image: "🎙️",
      seats: 0 // Sold Out
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION - The "Premium" Look */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        {/* Background Glow Effect */}
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
          <Link to="/register" className="btn-secondary">
            Sign Up Free
          </Link>
        </div>
      </section>


      {/* STATS STRIP (TUF Style) */}
      <section className="border-y border-[#333] bg-[#0f0f0f]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold text-white">500+</h3>
            <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">Events Hosted</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">10k+</h3>
            <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">Tickets Sold</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">50+</h3>
            <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">Cities</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">4.9/5</h3>
            <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">User Rating</p>
          </div>
        </div>
      </section>


      {/* EVENTS GRID SECTION */}
      <section id="events" className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Trending Events 🔥</h2>
            <p className="text-gray-400">Handpicked experiences just for you.</p>
          </div>
          <Link to="/dashboard" className="hidden md:flex text-red-500 hover:text-red-400 font-medium items-center gap-2 transition-colors">
            View All Events <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="tuf-card group flex flex-col h-full relative">
              
              {/* Card Image / Icon Header */}
              <div className="h-48 bg-gradient-to-br from-[#1a1a1a] to-[#252525] flex items-center justify-center rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl">
                  {event.image}
                </span>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-xs font-bold text-white px-3 py-1 rounded-full border border-gray-700">
                  {event.category}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <Calendar size={16} className="text-red-500" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <MapPin size={16} className="text-red-500" />
                    {event.location}
                  </div>
                </div>

                {/* Footer (Price & Button) */}
                <div className="mt-auto pt-4 border-t border-[#333] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Starting from</p>
                    <p className="text-lg font-bold text-white">{event.price}</p>
                  </div>
                  
                  <Link 
                    to={`/event/${event.id}`}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      event.seats > 0 
                      ? "bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                      : "bg-[#333] text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {event.seats > 0 ? "Book Now" : "Sold Out"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 text-center md:hidden">
           <Link to="/dashboard" className="text-red-500 font-medium">View All Events →</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;