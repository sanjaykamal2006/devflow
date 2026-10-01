'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import {
  api,
  clearToken,
  getToken,
  setToken,
  enterDemoSandbox as apiEnterDemo,
  exitDemoSandbox as apiExitDemo,
  isDemoMode,
} from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  enterDemoSandbox: () => Promise<void>;
  exitDemoSandbox: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const refreshUser = async () => {
    try {
      const currentUser = await api.auth.getMe();
      setUser(currentUser);
      setIsDemo(isDemoMode());
    } catch {
      setUser(null);
      clearToken();
      setTokenState(null);
      setIsDemo(false);
    }
  };

  useEffect(() => {
    setIsDemo(isDemoMode());
    const existingToken = getToken();
    if (existingToken) {
      setTokenState(existingToken);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setToken(res.accessToken);
    setTokenState(res.accessToken);
    setUser(res.user);
    setIsDemo(isDemoMode());
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await api.auth.register({ email, password, fullName });
    setToken(res.accessToken);
    setTokenState(res.accessToken);
    setUser(res.user);
    setIsDemo(isDemoMode());
  };

  const enterDemoSandbox = async () => {
    const res = apiEnterDemo();
    setTokenState(res.accessToken);
    setUser(res.user);
    setIsDemo(true);
  };

  const exitDemoSandbox = () => {
    apiExitDemo();
    setTokenState(null);
    setUser(null);
    setIsDemo(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/register';
    }
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    clearToken();
    setTokenState(null);
    setUser(null);
    setIsDemo(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isDemo,
        login,
        register,
        logout,
        enterDemoSandbox,
        exitDemoSandbox,
        refreshUser,
      }}
    >
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
