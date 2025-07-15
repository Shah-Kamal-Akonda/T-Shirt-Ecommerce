'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface Address {
  id: number;
  name: string;
  address: string;
  mobileNumber: string;
}

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  addresses: Address[];
  setAddresses: (addresses: Address[]) => void;
  fetchAddresses: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({ id: decoded.userId, email: decoded.email || 'Unknown' });
        setToken(storedToken);
        setIsLoggedIn(true);
        fetchAddresses();
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const response = await axios.get<{ addresses: Address[] }>(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setAddresses([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, user, setUser, token, setToken, addresses, setAddresses, fetchAddresses }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};