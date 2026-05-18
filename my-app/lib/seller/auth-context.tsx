'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  loginSeller,
  registerSeller,
  saveSellerSession,
  clearSellerSession,
  getUser,
  getToken,
  isSellerLoggedIn,
  isSellerRole,
  type SellerUser,
} from './auth-api';

type SellerAuthContextType = {
  user: SellerUser | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<void>;
  logout: () => void;
  isSeller: boolean;
};

const SellerAuthContext = createContext<SellerAuthContextType | null>(null);

export function SellerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SellerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    if (isSellerLoggedIn()) {
      const storedUser = getUser();
      const storedToken = getToken();
      setUser(storedUser);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginSeller(email, password);
    saveSellerSession(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const result = await registerSeller({
        email,
        password,
        fullName,
        role: 'seller',
      });
      saveSellerSession(result.token, result.user);
      setToken(result.token);
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearSellerSession();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <SellerAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: user !== null && token !== null,
        login,
        register,
        logout,
        isSeller: isSellerRole(user),
      }}
    >
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() {
  const ctx = useContext(SellerAuthContext);
  if (!ctx) {
    throw new Error('useSellerAuth must be used inside SellerAuthProvider');
  }
  return ctx;
}
