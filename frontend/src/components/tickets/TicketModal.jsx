import React, { useEffect, useState } from 'react';
import { X, Clock, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getTicketDetails } from '../../services/bookingService';
import toast from 'react-hot-toast';

const TicketModal = ({ ticketId, onClose }) => {
  const [ticketDetail, setTicketDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // New Error State
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setLoading(true);
        const data = await getTicketDetails(ticketId);
        setTicketDetail(data.data.ticket);
      } catch (error) {
        console.error("Error fetching ticket details:", error);
        setError(true);
        toast.error("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };
    if (ticketId) fetchTicketDetails();
  }, [ticketId]);

  // Don't render anything if there's no ID
  if (!ticketId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-[#1a1a1a] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-[#333] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-[#1a1a1a] p-6 text-white text-center border-b border-[#333] relative">
            {/* Safe Access to Title */}
            <h2 className="text-xl font-bold truncate">
                {loading ? "Loading Event..." : ticketDetail?.event?.title || "Ticket Details"}
            </h2>
            <p className="text-red-200 text-xs mt-1 tracking-wider uppercase">General Admission</p>
            
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[350px] bg-[#111]">
          
          {loading ? (
             /* 1. LOADING STATE */
             <div className="animate-pulse flex flex-col items-center gap-6 w-full">
                <div className="h-48 w-48 bg-[#222] rounded-xl border border-[#333]"></div>
                <div className="h-4 w-32 bg-[#222] rounded-full"></div>
                <div className="h-8 w-24 bg-[#222] rounded-full"></div>
             </div>
          ) : error || !ticketDetail ? (
             /* 2. ERROR STATE */
             <div className="text-center text-red-400">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Could not load ticket details.</p>
                <button onClick={onClose} className="mt-4 text-sm text-gray-500 underline">Close</button>
             </div>
          ) : !isRevealed ? (
            /* 3. PRIVACY CURTAIN STATE */
            <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-6 mx-auto bg-[#222] rounded-full h-24 w-24 flex items-center justify-center border border-[#333] shadow-inner">
                    <EyeOff className="h-10 w-10 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-6 px-4 text-sm">
                    Tap below to reveal your secure QR code for entry.
                </p>
                <button 
                    onClick={() => setIsRevealed(true)}
                    className="flex items-center gap-2 mx-auto bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:bg-red-500 hover:scale-105 transition-all"
                >
                    <Eye size={18} /> Reveal Ticket
                </button>
            </div>
          ) : (
            /* 4. REVEALED STATE (Live Ticket) */
            <div className="relative group animate-in fade-in zoom-in duration-500">
                {/* LIVE ANIMATION: Anti-Screenshot Pulse */}
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-xl blur opacity-75 animate-pulse"></div>
                
                <div className="relative bg-white p-3 rounded-xl">
                    <img 
                        src={ticketDetail.qrCode} 
                        alt="Entry QR Code" 
                        className="w-56 h-56 object-contain"
                    />
                </div>
                
                <p className="text-center text-xs text-gray-500 mt-4 font-mono tracking-widest">
                    ID: {ticketDetail._id.slice(-6).toUpperCase()}
                </p>
                
                <LiveClock />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#1a1a1a] p-4 text-center border-t border-[#333]">
             <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-green-500" />
                Secure Ticket • Do not share
             </div>
        </div>
      </div>
    </div>
  );
};

// Helper: Live Clock
const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="mt-3 text-center bg-[#222] py-1 px-3 rounded-full inline-block border border-[#333] shadow-lg">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-xs font-mono text-gray-300 font-bold">
                    {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                </span>
            </div>
        </div>
    );
};

export default TicketModal;