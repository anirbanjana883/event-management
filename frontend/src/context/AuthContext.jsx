import { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = () => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName'); // <--- Retrieve Name

    if (token) {
      setUser({ token, name: name || 'User' }); 
    }
    setLoading(false);
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userName', userData.name); // <--- Save Name
    setUser({ token, name: userData.name });
    toast.success(`Welcome back, ${userData.name}! 👋`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName'); // <--- Clear Name
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);