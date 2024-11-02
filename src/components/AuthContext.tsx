// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '../types';
import { api } from '../api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window === 'undefined') return { user: null, token: null };
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return {
      token,
      user: userStr ? JSON.parse(userStr) : null,
    };
  });

  useEffect(() => {
    if (authState.token) {
      api.setToken(authState.token);
      localStorage.setItem('token', authState.token);
      if (authState.user) {
        localStorage.setItem('user', JSON.stringify(authState.user));
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [authState]);

  const login = async (email: string, password: string) => {
    const { user, token } = await api.login(email, password);
    setAuthState({ user, token });
  };

  const register = async (email: string, password: string, name: string) => {
    const { user, token } = await api.register(email, password, name);
    setAuthState({ user, token });
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
