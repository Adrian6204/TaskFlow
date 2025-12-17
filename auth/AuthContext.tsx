
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role, Employee, AuthContextType } from '../types';
import { EMPLOYEES } from '../constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial seed data for users if local storage is empty
const SEED_USERS = [
  { login: 'alice', password: 'password', employeeId: 'emp-1', role: 'admin' as Role },
  { login: 'bob', password: 'password', employeeId: 'emp-2', role: 'user' as Role },
  { login: 'charlie', password: 'password', employeeId: 'emp-3', role: 'user' as Role },
  { login: 'diana', password: 'password', employeeId: 'emp-4', role: 'user' as Role },
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

  // Ensure initial data exists in LocalStorage for production-like feel
  useEffect(() => {
    const existingUsers = localStorage.getItem('taskflow_users');
    if (!existingUsers) {
      localStorage.setItem('taskflow_users', JSON.stringify(SEED_USERS));
    }
    
    // Ensure employees are seeded if missing (matches App.tsx logic but useful for AuthContext to have access)
    const existingEmployees = localStorage.getItem('taskflow_employees');
    if (!existingEmployees) {
        localStorage.setItem('taskflow_employees', JSON.stringify(EMPLOYEES));
    }
  }, []);

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

  const getUsersFromStorage = () => {
      try {
          const stored = localStorage.getItem('taskflow_users');
          return stored ? JSON.parse(stored) : SEED_USERS;
      } catch {
          return SEED_USERS;
      }
  };

  const getEmployeesFromStorage = (): Employee[] => {
      try {
          const stored = localStorage.getItem('taskflow_employees');
          return stored ? JSON.parse(stored) : EMPLOYEES;
      } catch {
          return EMPLOYEES;
      }
  };

  const login = async (username: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getUsersFromStorage();
        const foundUser = users.find(
          (u: any) => u.login.toLowerCase() === username.toLowerCase() && u.password === password
        );

        if (foundUser) {
          const employees = getEmployeesFromStorage();
          const employee = employees.find(e => e.id === foundUser.employeeId);
          
          if (employee) {
            setUser({
              username: employee.name, // Use the full name/display name
              role: foundUser.role,
              employeeId: foundUser.employeeId,
              avatarUrl: employee.avatarUrl
            } as User & { avatarUrl?: string });
            resolve();
          } else {
            reject(new Error('Associated employee profile not found.'));
          }
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 500);
    });
  };

  const signup = async (username: string, password: string, fullName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromStorage();
            if (users.find((u: any) => u.login.toLowerCase() === username.toLowerCase())) {
                reject(new Error('Username already taken'));
                return;
            }

            const newEmployeeId = `emp-${Date.now()}`;
            
            // 1. Create Employee Profile
            const newEmployee: Employee = {
                id: newEmployeeId,
                name: fullName,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff&bold=true`
            };

            const employees = getEmployeesFromStorage();
            const updatedEmployees = [...employees, newEmployee];
            localStorage.setItem('taskflow_employees', JSON.stringify(updatedEmployees));

            // 2. Create User Credentials
            const newUserCred = {
                login: username,
                password: password,
                employeeId: newEmployeeId,
                role: 'user' // Default role for new signups
            };
            
            const updatedUsers = [...users, newUserCred];
            localStorage.setItem('taskflow_users', JSON.stringify(updatedUsers));

            // 3. Auto Login
            setUser({
                username: fullName,
                role: 'user',
                employeeId: newEmployeeId,
                avatarUrl: newEmployee.avatarUrl
            } as User & { avatarUrl?: string });
            
            resolve();
        }, 800);
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
        setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
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
