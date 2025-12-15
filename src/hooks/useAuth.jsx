import { createContext, useContext, useState, useEffect } from "react";
import api from "@/config/api";
import { jwtDecode } from "jwt-decode";

// --- THE SECRET ADMIN KEY ---
const ADMIN_EMAIL = "admin@medclinic.com"; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to process token and assign role
  const handleUserSetup = (token) => {
      const decoded = jwtDecode(token);
      
      // LOGIC: If email matches, they are Admin. Otherwise, User.
      const role = decoded.email === ADMIN_EMAIL ? 'admin' : 'user';
      
      localStorage.setItem("token", token);
      setUser({ ...decoded, token, role }); 
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          handleUserSetup(token);
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const token = response.data.token;
      handleUserSetup(token);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const register = async (first_name, last_name, email, password) => {
    try {
      const response = await api.post("/register", { first_name, last_name, email, password });
      const token = response.data.token;
      if (token) {
        handleUserSetup(token);
        return true;
      }
      return await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);