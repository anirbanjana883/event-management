import { Link, useNavigate } from 'react-router-dom';
import { Ticket, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = false; // Mock

  const handleLogout = () => {
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-[#333]">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-red-600/10 rounded-lg group-hover:bg-red-600/20 transition-colors">
            <Ticket className="w-6 h-6 text-red-500" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Event<span className="text-red-500">Loop</span>
          </span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Log In
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;