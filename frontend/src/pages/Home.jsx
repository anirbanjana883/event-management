import { useEffect, useState } from 'react';
import { Loader2, Search, Calendar, MapPin } from 'lucide-react';
import { getAllEvents } from '../services/eventService';
import toast from 'react-hot-toast';

// Import New Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // FETCH DATA
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

  // Filter Logic
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
      {/* 2. Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-red-900/20 via-black to-black pointer-events-none -z-10" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />

        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live in New York, London, Mumbai
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
            Find Your Next <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">Unforgettable Moment</span>
          </h1>

          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Curated experiences for the curious. From underground gigs to massive tech conferences, secure your spot today.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-[#1a1a1a] rounded-xl border border-white/10 p-2">
              <Search className="ml-4 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search events, artists, or venues..." 
                className="w-full bg-transparent border-none text-white px-4 py-3 focus:ring-0 placeholder:text-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Event Grid */}
      <section id="events" className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
            <p className="text-gray-400">Discover what's trending in your area.</p>
          </div>
          {/* <button className="hidden md:flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors">
            View All <ArrowRight size={16} />
          </button> */}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading experiences...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
           <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
             <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
             <p className="text-gray-500">Try adjusting your search terms.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Footer */}
      <Footer />
      
    </div>
  );
};

export default Home;