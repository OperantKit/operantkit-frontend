'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useSyncExternalStore,
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

// The logged-in user lives in local storage under this key.
const STORAGE_KEY = 'user';

// Components subscribed to the stored user, notified after login/logout in
// this tab. Changes from other tabs arrive through the `storage` event.
const listeners = new Set<() => void>();

const subscribeToStoredUser = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
};

const notifyStoredUserChanged = () => {
  listeners.forEach((onChange) => onChange());
};

const readStoredUser = () => localStorage.getItem(STORAGE_KEY);

// The server has no local storage, so it renders as logged out.
const readStoredUserOnServer = () => null;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const storedUser = useSyncExternalStore(
    subscribeToStoredUser,
    readStoredUser,
    readStoredUserOnServer
  );
  const user = useMemo<{ username: string } | null>(
    () => (storedUser ? JSON.parse(storedUser) : null),
    [storedUser]
  );
  const isLoggedIn = user !== null;

  const login = useCallback((username: string) => {
    const newUser = { username };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser)); // Persist to local storage
    notifyStoredUserChanged();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY); // Clear from local storage
    notifyStoredUserChanged();
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
