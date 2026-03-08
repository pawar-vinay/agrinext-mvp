import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface User {
  id: number;
  mobile_number: string;
  name: string;
  location: string;
  primary_crop: string;
  language: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (mobile: string, otp: string) => Promise<void>;
  register: (mobile: string, name: string, location: string, primaryCrop: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid saved data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (mobile: string, otp: string) => {
    const response = await authService.verifyOTP(mobile, otp);
    const { token, user: userData } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    setIsAuthenticated(true);
  };

  const register = async (mobile: string, name: string, location: string, primaryCrop: string) => {
    // Create user without OTP verification (for prototype)
    const newUser: User = {
      id: Date.now(), // Use timestamp as unique ID
      mobile_number: mobile,
      name: name,
      location: location,
      primary_crop: primaryCrop,
      language: 'en',
    };

    // Generate a mock token
    const token = `demo-token-${Date.now()}`;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
