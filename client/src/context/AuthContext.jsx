import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('libook_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const savedToken = localStorage.getItem('libook_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            setToken(savedToken);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Auth verification failed", err);
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login(username, password);
    if (res.success && res.data) {
      const { access_token, user: userData } = res.data;
      localStorage.setItem('libook_token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('libook_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isMember: user?.role === 'MEMBER'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
