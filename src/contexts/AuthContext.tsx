'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'AUTHOR';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: 'ADMIN' | 'AUTHOR' | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  login: async () => ({}),
  register: async () => ({}),
  logout: async () => {},
  refresh: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || 'Login gagal' };
      }

      setUser(data.user);
      return {};
    } catch {
      return { error: 'Terjadi kesalahan saat login' };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || 'Registrasi gagal' };
      }

      setUser(data.user);
      return {};
    } catch {
      return { error: 'Terjadi kesalahan saat registrasi' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch {
      // Ignore logout errors
    }
  };

  const refresh = async () => {
    await fetchUser();
  };

  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, loading, role, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};
