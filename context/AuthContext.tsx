// operantkit/apps/operantkit-frontend/context/AuthContext.tsx
'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  user: { username: string } | null;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  // Attempt to load auth state from local storage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const login = useCallback((username: string) => {
    const newUser = { username };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(newUser)); // Persist to local storage
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user'); // Clear from local storage
  }, []);

  const value = {
    isLoggedIn,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
