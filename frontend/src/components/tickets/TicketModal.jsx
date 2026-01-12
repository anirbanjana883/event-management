import React, { useEffect, useState } from 'react';
import { X, Clock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { getTicketDetails } from '../../services/bookingService';

const TicketModal = ({ ticketId, onClose }) => {
  const [ticketDetail, setTicketDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false); // The Privacy Curtain

  // Fetch full details + QR Image only when modal opens
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const data = await getTicketDetails(ticketId);
        setTicketDetail(data.data.ticket);
      } catch (error) {
        console.error("Error fetching ticket details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTicketDetails();
  }, [ticketId]);

  if (!ticketDetail && loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#1a1a1a] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-[#333] relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-[#1a1a1a] p-6 text-white text-center border-b border-[#333]">
            <h2 className="text-xl font-bold truncate">{ticketDetail?.event?.title}</h2>
            <p className="text-red-200 text-xs mt-1 tracking-wider uppercase">General Admission</p>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                <X size={24} />
            </button>
        </div>

        {/* Dynamic QR Section */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[350px] bg-[#111]">
          
          {loading ? (
             <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-48 w-48 bg-[#222] rounded-xl"></div>
                <div className="h-4 w-32 bg-[#222] rounded"></div>
             </div>
          ) : !isRevealed ? (
            // 1. PRIVACY CURTAIN STATE
            <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-6 mx-auto bg-[#222] rounded-full h-24 w-24 flex items-center justify-center border border-[#333]">
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
            // 2. REVEALED STATE (Live Ticket)
            <div className="relative group animate-in fade-in zoom-in duration-500">
                {/* LIVE ANIMATION: Moving gradient border (Proof it's not a screenshot) */}
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-xl blur opacity-75 animate-pulse"></div>
                
                <div className="relative bg-white p-3 rounded-xl">
                    <img 
                        src={ticketDetail.qrCode} 
                        alt="Entry QR Code" 
                        className="w-56 h-56 object-contain"
                    />
                </div>
                
                <p className="text-center text-xs text-gray-500 mt-4 font-mono">
                    ID: {ticketDetail._id.slice(-6).toUpperCase()}
                </p>
                
                {/* Live Clock Component */}
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

// Helper: Live Clock for Anti-Fraud
const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="mt-3 text-center bg-[#222] py-1 px-3 rounded-full inline-block border border-[#333]">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-xs font-mono text-gray-300">
                    {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                </span>
            </div>
        </div>
    );
};

export default TicketModal;