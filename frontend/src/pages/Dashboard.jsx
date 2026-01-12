import React, { useEffect, useState } from 'react';
import UserDashboard from './user/UserDashboard'; 
import OrganizerDashboard from './organizer/OrganizerDashboard'; 
import api from '../services/api';

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {

    console.log("1. Starting Role Check...");
      try {
        // Option A: If you stored role in localStorage on login
        const storedUser = JSON.parse(localStorage.getItem('user'));

        console.log("2. Stored User:", storedUser);
        
        if (storedUser?.role) {
          setRole(storedUser.role);
          setLoading(false);
          return;
        }

        const res = await api.get('/auth/me'); 
        setRole(res.data.data.user.role);
        
        localStorage.setItem('user', JSON.stringify(res.data.data.user));

      } catch (err) {
        console.error("Auth check failed", err);
        // If error, maybe redirect to login?
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500 mr-2"></div>
            Loading your dashboard...
        </div>
    );
  }

  if (role === 'organizer' || role === 'admin') {
    return <OrganizerDashboard />;
  }

  return <UserDashboard />;
};

export default Dashboard;