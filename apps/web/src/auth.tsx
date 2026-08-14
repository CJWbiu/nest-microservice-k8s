import React, { createContext, useContext, useMemo, useState } from 'react';
import { login as apiLogin, logout as apiLogout } from './api';

interface AuthState {
  token: string | null;
  username: string | null;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('access_token'),
  );
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem('username'),
  );

  const value = useMemo<AuthState>(
    () => ({
      token,
      username,
      async login(u, p) {
        const data = await apiLogin(u, p);
        setToken(data.access_token);
        setUsername(data.username || u);
      },
      logout() {
        apiLogout();
        setToken(null);
        setUsername(null);
      },
    }),
    [token, username],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
