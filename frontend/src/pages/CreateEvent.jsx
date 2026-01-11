import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Type, AlignLeft, Image, Loader2, Users } from 'lucide-react';
import { createEvent } from '../services/eventService';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: '',
    totalSeats: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        totalSeats: Number(formData.totalSeats),
        availableSeats: Number(formData.totalSeats) 
      };

      // 1. Send data to backend
      await createEvent(payload);
      toast.success("Event Published Successfully! 🚀");
      navigate('/'); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to create event. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
        <p className="text-gray-400">Publish a concert, workshop, or meetup.</p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Event Title</label>
            <div className="relative">
              <Type className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <input 
                type="text" 
                name="title" 
                required
                className="w-full bg-[#0f0f0f] border border-[#333] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                placeholder="e.g. Neon City Concert"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <textarea 
                name="description" 
                required
                rows="4"
                className="w-full bg-[#0f0f0f] border border-[#333] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Tell people what this event is about..."
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DATE */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 text-gray-500" size={18} />
                <input 
                  type="datetime-local" 
                  name="date" 
                  required
                  className="w-full bg-[#0f0f0f] border border-[#333] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors [color-scheme:dark]"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* LOCATION */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Venue Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-gray-500" size={18} />
                <input 
                  type="text" 
                  name="location" 
                  required
                  className="w-full bg-[#0f0f0f] border border-[#333] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g. Mumbai Arena"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PRICE */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Ticket Price (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-gray-500" size={18} />
                <input 
                  type="number" 
                  name="price" 
                  required
                  min="0"
                  className="w-full bg-[#0f0f0f] border border-[#333] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="499"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* SEATS */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Total Seats</label>
              <div className="relative">
                <Users className="absolute left-3 top-3.5 text-gray-500" size={18} />
                <input 
                  type="number" 
                  name="totalSeats" 
                  required
                  min="1"
                  className="w-full bg-[#0f0f0f] border border-[#333] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="100"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Publish Event"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateEvent;