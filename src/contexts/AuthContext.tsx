import React, { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react'
import api from '../services/api'

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get<User>('/users/me');
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user data", err);
      logout(); // Log out if token is invalid or user data can't be fetched
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setLoading(true);
    // fetchUser will be called by the useEffect after setToken updates
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
