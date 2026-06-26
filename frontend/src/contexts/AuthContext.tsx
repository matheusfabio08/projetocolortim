import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('colortim_user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('colortim_token'));
  const [isLoading, setIsLoading] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (token) {
      api.get('/auth/me').catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('colortim_token');
        localStorage.removeItem('colortim_user');
      });
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('colortim_token', data.token);
      localStorage.setItem('colortim_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('colortim_token');
    localStorage.removeItem('colortim_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
