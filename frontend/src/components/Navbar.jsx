import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Ticket, LayoutDashboard, LogOut, User, Menu, X, PlusCircle, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  // Helper to check active link
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${
          isScrolled
            ? "bg-[#030303]/80 backdrop-blur-xl border-white/10 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
            : "bg-black/20 backdrop-blur-sm border-transparent py-5" // Slightly visible even at top for readability
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center relative">
            
            {/* --- 1. LOGO WITH NEON GLOW --- */}
            <Link to="/" className="flex items-center gap-3 group relative z-10">
              {/* Glow Effect behind logo */}
              <div className="absolute -inset-2 bg-red-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-red-900/30 border border-white/10">
                <Ticket className="text-white drop-shadow-md" size={20} />
              </div>
              
              <span className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
                Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">X</span>
              </span>
            </Link>

            {/* --- 2. DESKTOP MENU --- */}
            <div className="hidden md:flex items-center gap-8">
              {/* Vertical Divider */}
              <div className="h-6 w-px bg-white/10" />

              {/* Auth Section */}
              {user ? (
                <div className="flex items-center gap-4">
                  {/* Organizer Button with Gradient Border */}
                  {user.role === "organizer" && (
                    <Link
                      to="/create-event"
                      className="relative p-[1px] rounded-full group overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-gradient-x opacity-70 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center gap-2 px-4 py-1.5 bg-black rounded-full text-white text-xs font-bold uppercase tracking-wider group-hover:bg-black/90 transition-colors">
                        <PlusCircle size={14} className="text-red-400" />
                        Host
                      </div>
                    </Link>
                  )}

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors"
                  >
                     Dashboard
                  </Link>

                  {/* Profile Dropdown Trigger */}
                  <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden xl:block">
                      <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">{user.role}</p>
                    </div>
                    
                    <div className="group relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-700 to-black border border-white/20 flex items-center justify-center cursor-pointer group-hover:border-red-500/50 transition-colors shadow-inner">
                            <User size={18} className="text-gray-300 group-hover:text-white" />
                        </div>
                        {/* Hover Logout Menu */}
                        <div className="absolute top-10 right-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <button 
                                onClick={handleLogout}
                                className="w-32 py-2.5 bg-[#111] border border-white/10 rounded-xl shadow-2xl text-red-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-900/10 hover:border-red-500/30 transition-all"
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-sm font-bold text-gray-300 hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="group relative px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm overflow-hidden transition-transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2">
                        Get Started <Sparkles size={14} className="text-yellow-600" />
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* --- 3. MOBILE TOGGLE --- */}
            <button
              className="md:hidden relative z-50 p-2 text-white hover:text-red-500 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- 4. MOBILE FULLSCREEN MENU --- */}
      <div 
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:hidden flex flex-col justify-center px-8 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Background Gradients for Mobile */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col gap-6 relative z-10">
            {user ? (
                <>
                    <div className="flex items-center gap-4 mb-8 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-black flex items-center justify-center border border-white/20 shadow-lg">
                            <span className="text-xl font-bold text-white">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{user.name}</p>
                            <p className="text-sm text-red-400 uppercase tracking-wider font-semibold">{user.role}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {user.role === 'organizer' && (
                            <Link to="/create-event" onClick={() => setIsOpen(false)} className="mobile-link text-red-400 border border-red-500/20 bg-red-500/10">
                                <PlusCircle /> Host New Event
                            </Link>
                        )}
                        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="mobile-link text-white hover:bg-white/5">
                            <LayoutDashboard /> Dashboard
                        </Link>
                        <button onClick={handleLogout} className="mobile-link text-gray-400 hover:text-red-400 hover:bg-white/5">
                            <LogOut /> Log Out
                        </button>
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white hover:to-gray-400 transition-all">
                        Log In
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 transition-all">
                        Get Started
                    </Link>
                </div>
            )}
        </div>
      </div>

      {/* --- CUSTOM CSS FOR ANIMATIONS --- */}
      <style>{`
        .mobile-link {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 1.1rem;
            font-weight: 700;
            padding: 18px;
            border-radius: 16px;
            transition: all 0.2s;
        }
        .mobile-link:active {
            transform: scale(0.98);
        }
        @keyframes gradient-x {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default Navbar;