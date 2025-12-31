import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, getAuthUser, login as authLogin, logout as authLogout } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedUser = getAuthUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const success = authLogin(username, password);
    if (success) {
      setUser(getAuthUser());
    }
    return success;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user?.isAuthenticated ?? false,
        login,
        logout,
      }}
    >
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
