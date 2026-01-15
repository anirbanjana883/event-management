import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  DollarSign, 
  Users, 
  Ticket, 
  TrendingUp, 
  Loader2, 
  Calendar,
  MapPin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { getEventStats } from '../../services/organizerService';
import toast from 'react-hot-toast';

const AnalyticsDashboard = () => {
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // FETCH DATA ON LOAD
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEventStats(eventId);
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  // LOADING STATE
  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <Loader2 className="animate-spin text-red-500 w-12 h-12 mb-4" />
      <p className="text-gray-400 animate-pulse">Crunching the numbers...</p>
    </div>
  );

  // ERROR STATE
  if (!data) return (
    <div className="min-h-screen bg-black text-white p-10 text-center">
      <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
      <Link to="/organizer/dashboard" className="text-red-500 hover:underline">Return to Dashboard</Link>
    </div>
  );

  // DESTRUCTURE DATA
  const { summary, dailySales, eventTitle, totalSeats } = data;
  
  // Calculate Occupancy Percentage
  const occupancyRate = totalSeats > 0 
    ? Math.round((summary.totalTicketsSold / totalSeats) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20 selection:bg-red-500/30">
      
      {/* --- HEADER --- */}
      <div className="max-w-6xl mx-auto mb-10">
        <Link 
          to="/organizer/dashboard" 
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Overview</span>
            </h1>
            <p className="text-xl text-gray-400 flex items-center gap-2">
              For event: <span className="text-white font-bold">{eventTitle}</span>
            </p>
          </div>
          <div className="bg-[#1a1a1a] px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-400">
            Last updated: <span className="text-white font-mono">Just now</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- 1. KPI CARDS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD 1: REVENUE */}
          <div className="bg-[#111] p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-red-500/30 transition-colors">
            {/* Background Icon Decoration */}
            <div className="absolute -top-4 -right-4 bg-green-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2 text-gray-400">
                <div className="p-2 bg-[#222] rounded-lg">
                  <DollarSign size={20} className="text-green-500" />
                </div>
                <span className="font-medium text-sm uppercase tracking-wider">Total Revenue</span>
              </div>
              <h2 className="text-4xl font-black text-white mt-2">
                ₹{summary.totalRevenue.toLocaleString()}
              </h2>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full w-fit">
                <TrendingUp size={12} /> Live Earnings
              </div>
            </div>
          </div>

          {/* CARD 2: TICKETS & OCCUPANCY */}
          <div className="bg-[#111] p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
             <div className="absolute -top-4 -right-4 bg-blue-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-2 bg-[#222] rounded-lg">
                      <Ticket size={20} className="text-blue-500" />
                    </div>
                    <span className="font-medium text-sm uppercase tracking-wider">Tickets Sold</span>
                  </div>
                  <span className={`text-xl font-black ${occupancyRate >= 100 ? 'text-green-500' : 'text-white'}`}>
                    {occupancyRate}%
                  </span>
                </div>

                <h2 className="text-4xl font-black text-white">
                  {summary.totalTicketsSold} <span className="text-lg text-gray-500 font-medium">/ {totalSeats}</span>
                </h2>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-[#222] rounded-full mt-4 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      occupancyRate >= 90 ? 'bg-green-500' : 'bg-blue-500'
                    }`} 
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
             </div>
          </div>

          {/* CARD 3: REAL-TIME CHECK-INS */}
          <div className="bg-[#111] p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute -top-4 -right-4 bg-purple-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2 text-gray-400">
                <div className="p-2 bg-[#222] rounded-lg">
                  <Users size={20} className="text-purple-500" />
                </div>
                <span className="font-medium text-sm uppercase tracking-wider">Checked In</span>
              </div>
              <h2 className="text-4xl font-black text-white mt-2">
                {summary.totalCheckedIn}
              </h2>
              <p className="mt-4 text-xs text-gray-500">
                People currently inside the venue.
              </p>
            </div>
          </div>

        </div>

        {/* --- 2. MAIN CHART SECTION --- */}
        <div className="bg-[#111] p-8 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Sales Trends</h3>
              <p className="text-sm text-gray-400">Daily revenue for the last 30 days</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-[#222] text-xs font-bold text-white rounded hover:bg-[#333]">30 Days</button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="_id" 
                  stroke="#555" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('default', { day: '2-digit', month: 'short' })}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#555" 
                  tickFormatter={(val) => `₹${val}`}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '10px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: '#ffffff05' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#colorRevenue)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;