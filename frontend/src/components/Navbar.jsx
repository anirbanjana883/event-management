import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, LayoutDashboard, LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu State

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "/login";
  };
  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-[#333]">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* Logo Container */}
            <div className="p-1 bg-red-600/10 rounded-full border border-red-500/20 group-hover:bg-red-600/20 transition-colors">
              <img
                src="/eventloop.png"
                alt="EventLoop Logo"
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>

            {/* Text */}
            <span className="text-xl font-bold tracking-tight text-white">
              Event<span className="text-red-500">Loop</span>
            </span>
          </Link>

          {/* DESKTOP MENU (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-full">
                  <div className="p-1 bg-red-500 rounded-full">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-200">
                    {user.name}
                  </span>
                </div>

                <Link
                  to="/create-event"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-gray-300 hover:text-white hover:border-red-500/50 transition-all"
                >
                  <span className="text-red-500 font-bold">+</span> Host Event
                </Link>

                <Link
                  to="/dashboard"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON (Visible only on Mobile) */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[#333] pt-4 space-y-4 animate-in fade-in slide-in-from-top-5 duration-200">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2 bg-[#1a1a1a] rounded-lg">
                  <div className="p-2 bg-red-500 rounded-full">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-xs text-gray-500">Logged In</p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="block px-2 py-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-2 py-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="block text-center py-2 text-gray-400 hover:text-white border border-[#333] rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block text-center py-2 bg-red-600 text-white font-bold rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
