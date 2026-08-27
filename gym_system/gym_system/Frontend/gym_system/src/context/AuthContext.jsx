/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const currentUser = authService.getCurrentUser();
    const token = localStorage.getItem('token');
    // Guard against residual localStorage data from other localhost projects
    if (currentUser && token) return currentUser;
    return null;
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getMe();
        if (data && data.status === 'success') {
          // ensure we have latest user data
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch {
        // If token expires or backend is restarted and user doesn't exist anymore
        console.error("Token invalid or expired. Logging out automatically.");
        authService.logout();
        setUser(null);
      }
    };

    if (authService.getCurrentUser() && localStorage.getItem('token')) {
      fetchUser();
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.status === 'success') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password, role, termsAccepted) => {
    const data = await authService.register(name, email, password, role, termsAccepted);
    if (data.status === 'success') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
