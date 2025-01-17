import React, { useState, createContext, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/login', { username, password });
      const token = response.data.token;
      
      // Extract token expiration time from the response if possible
      const expirationTime = Date.now() + 60 * 60 * 1000; // 1 hour from now

      localStorage.setItem('token', token);
      localStorage.setItem('expirationTime', expirationTime); // Store the expiration time
      
      setAuth({ token });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');
    setAuth(null);
    navigate('/login');
  };

  const isTokenValid = () => {
    const expirationTime = localStorage.getItem('expirationTime');
    return expirationTime && Date.now() < expirationTime;
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token && isTokenValid()) {
      setAuth({ token });
    } else {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
