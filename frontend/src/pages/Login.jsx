import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Call Backend
      const response = await loginUser(formData);
      
      // 2. Update Context (Login)
      if (response.token) {
        // Note: Check your backend response structure. 
        // Usually it's response.data.user.name or just response.data.user
        login(response.token, { name: response.data.user.name });
        
        navigate('/'); // Redirect Home
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>

        <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8">Login to access your tickets</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-500" size={20} />
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              required
              className="w-full bg-[#0f0f0f] border border-[#333] text-white px-10 py-3 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
              onChange={handleChange}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              required
              className="w-full bg-[#0f0f0f] border border-[#333] text-white px-10 py-3 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Log In <LogIn size={20} /></>}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Don't have an account? <Link to="/register" className="text-red-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;