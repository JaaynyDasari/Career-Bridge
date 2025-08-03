import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'jobseeker' | 'recruiter';
  company?: string;
}

interface AuthContextType {
  user: User | null;
  signup: (userData: any) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userInfoFromStorage = localStorage.getItem('userInfo');
    if (userInfoFromStorage) {
      setUser(JSON.parse(userInfoFromStorage));
    }
  }, []);

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (response.ok) {
        const loggedInUser: User = {
          id: data._id, name: data.name, email: data.email,
          role: data.role, company: data.company
        };
        setUser(loggedInUser);
        localStorage.setItem('userInfo', JSON.stringify(loggedInUser));
        localStorage.setItem('userToken', data.token);
        return true;
      } else {
        alert(data.message || 'Signup failed');
        return false;
      }
    } catch (error) {
      console.error('Signup request failed:', error);
      alert('A network or server error occurred during signup.');
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        const loggedInUser: User = {
            id: data._id, name: data.name, email: data.email,
            role: data.role, company: data.company,
        };
        setUser(loggedInUser);
        localStorage.setItem('userInfo', JSON.stringify(loggedInUser));
        localStorage.setItem('userToken', data.token);
        return true;
      } else {
        alert(data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login request failed:', error);
      alert('A network or server error occurred during login.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
  };

  const value = {
    user,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};