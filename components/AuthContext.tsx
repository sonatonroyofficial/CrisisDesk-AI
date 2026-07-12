'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  isInitialized: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const activeToken = localStorage.getItem('crisisdesk_admin_token');
      setToken(activeToken);
    } catch (error) {
      console.warn('localStorage is not accessible:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = (newToken: string) => {
    try {
      localStorage.setItem('crisisdesk_admin_token', newToken);
    } catch (error) {
      console.warn('localStorage is not writable:', error);
    }
    setToken(newToken);
  };

  const logout = () => {
    try {
      localStorage.removeItem('crisisdesk_admin_token');
    } catch (error) {
      console.warn('localStorage clear failed:', error);
    }
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin: !!token, isInitialized, login, logout }}>
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
