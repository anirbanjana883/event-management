import React, { useEffect, useState } from 'react';
import { Users, DollarSign, Calendar, Trash2, ShieldAlert, Activity } from 'lucide-react';
import { getSystemStats, getAllUsers, deleteUser } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data on Load
  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        getSystemStats(),
        getAllUsers()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error("Admin Load Failed", error);
      toast.error("Failed to load Admin Data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Ban User
  const handleBanUser = async (userId) => {
    if (!window.confirm("Are you sure you want to BAN this user? This cannot be undone.")) return;
    try {
      await deleteUser(userId);
      toast.success("User Banned/Deleted Successfully");
      // Update UI without refreshing
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <Activity className="w-10 h-10 text-red-600 animate-spin mb-4" />
      <p>Loading God Mode...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
        <ShieldAlert className="text-red-500" /> Admin Dashboard
      </h1>

      {/* 1. STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Users />} label="Total Users" value={stats?.totalUsers} color="bg-blue-500/10 text-blue-500" />
        <StatCard icon={<Calendar />} label="Total Events" value={stats?.totalEvents} color="bg-purple-500/10 text-purple-500" />
        <StatCard icon={<DollarSign />} label="Total Revenue" value={`₹${stats?.totalRevenue}`} color="bg-green-500/10 text-green-500" />
        <StatCard icon={<Activity />} label="Tickets Sold" value={stats?.totalTicketsSold} color="bg-yellow-500/10 text-yellow-500" />
      </div>

      {/* 2. USER MANAGEMENT TABLE */}
      <div className="bg-[#111] rounded-xl border border-[#333] overflow-hidden">
        <div className="p-6 border-b border-[#333]">
          <h2 className="text-xl font-bold text-white">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-400">
            <thead className="bg-[#0a0a0a] text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{user.name}</span>
                      <span className="text-xs">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                      user.role === 'organizer' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-gray-700/50 text-gray-400'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => handleBanUser(user._id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                        title="Ban User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color}`}>
      {icon}
    </div>
    <p className="text-gray-500 text-sm mb-1">{label}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

export default AdminDashboard;