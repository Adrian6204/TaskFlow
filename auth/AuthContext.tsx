import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { EMPLOYEES } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In a real app, this would be a secure API call.
const MOCK_USERS = [
  { username: 'alice', password: 'password', employeeId: 'emp-1', role: 'admin' as Role },
  { username: 'bob', password: 'password', employeeId: 'emp-2', role: 'user' as Role },
  { username: 'charlie', password: 'password', employeeId: 'emp-3', role: 'user' as Role },
  { username: 'diana', password: 'password', employeeId: 'emp-4', role: 'user' as Role },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        sessionStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('user');
      }
    } catch (error) {
      console.error("Failed to update sessionStorage", error);
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );

        if (foundUser) {
          const employee = EMPLOYEES.find(e => e.id === foundUser.employeeId);
          if (employee) {
            setUser({
              username: employee.name, // Use the full name for display
              role: foundUser.role,
              employeeId: foundUser.employeeId,
            });
            resolve();
          } else {
            reject(new Error('Associated employee not found.'));
          }
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
