import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

export interface AuthContextType {
  token: string | null;
  username: string | null;
  isAuth: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));

  const login = async (uname: string, password: string) => {
    const res = await api.post('/auth/login', {
      username: uname.trim(),
      password: password.trim(),
    });

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.username);
    setToken(res.data.token);
    setUsername(res.data.username);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, isAuth: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};