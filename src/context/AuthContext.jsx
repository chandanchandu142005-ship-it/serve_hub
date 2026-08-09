import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sh_token') || sessionStorage.getItem('sh_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authService.getMe(token);
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [token]);

  const login = (userData, authToken, rememberMe = false) => {
    setUser(userData);
    setToken(authToken);
    if (rememberMe) {
      localStorage.setItem('sh_token', authToken);
    } else {
      sessionStorage.setItem('sh_token', authToken);
    }
  };

  const logout = async () => {
    try {
      if (token) await authService.logout(token);
    } catch (e) {
      // ignore logout errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('sh_token');
      sessionStorage.removeItem('sh_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
