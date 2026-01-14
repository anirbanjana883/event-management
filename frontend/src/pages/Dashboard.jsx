import React, { useEffect, useState } from 'react';
import UserDashboard from './user/UserDashboard'; 
import OrganizerDashboard from './organizer/OrganizerDashboard';
import AdminDashboard from './admin/AdminDashboard'; // <--- IMPORT THIS
import api from '../services/api';

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // ... (Keep existing logic to check role)
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.role) {
            setRole(storedUser.role);
        } else {
            const res = await api.get('/auth/me');
            setRole(res.data.data.user.role);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkUserRole();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  // RENDER BASED ON ROLE
  return (
    <div className="min-h-screen bg-black pt-20">
      {role === 'user' && <UserDashboard />}
      {role === 'organizer' && <OrganizerDashboard />}
      {role === 'admin' && <AdminDashboard />} 
    </div>
  );
};

export default Dashboard;