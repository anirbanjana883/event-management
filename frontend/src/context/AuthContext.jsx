import { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // ⚠️ FIXED: Retrieve full user details, not just name
    const storedUser = localStorage.getItem('user'); 

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    // ⚠️ FIXED: Save entire user object (id, name, email, ROLE)
    localStorage.setItem('user', JSON.stringify(userData)); 
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success("Logged out successfully");
    // Optional: Redirect to login
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);