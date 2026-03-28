'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

type User = { name: string; email: string };

type RegisteredUser = User & { password: string };

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function readStoredUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem('acme_user');
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  const login = (email: string, password: string): boolean => {
    const users: RegisteredUser[] = JSON.parse(
      localStorage.getItem('acme_users') || '[]',
    );
    const found = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (found) {
      const userData = { name: found.name, email: found.email };
      setUser(userData);
      localStorage.setItem('acme_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = (
    name: string,
    email: string,
    password: string,
  ): boolean => {
    const users: RegisteredUser[] = JSON.parse(
      localStorage.getItem('acme_users') || '[]',
    );
    if (users.some((u) => u.email === email)) return false;
    users.push({ name, email, password });
    localStorage.setItem('acme_users', JSON.stringify(users));
    const userData = { name, email };
    setUser(userData);
    localStorage.setItem('acme_user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('acme_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
