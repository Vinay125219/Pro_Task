import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default users: Ravali and Vinay
const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'ravali',
    password: 'ravali123',
    name: 'Ravali',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'vinay',
    password: 'vinay123',
    name: 'Vinay',
    createdAt: new Date().toISOString(),
  },
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize users in localStorage if not present
    const existingUsers = localStorage.getItem('task_manager_users');
    if (!existingUsers) {
      localStorage.setItem('task_manager_users', JSON.stringify(DEFAULT_USERS));
    }

    // Check for existing session
    const savedUser = localStorage.getItem('task_manager_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('task_manager_users') || '[]');
    const user = users.find((u: User) => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('task_manager_current_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('task_manager_current_user');
  };

  const value: AuthContextType = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};