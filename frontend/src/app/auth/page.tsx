'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
}

interface AddressesResponse {
  addresses: Address[];
}

interface Address {
  id: number;
  name: string;
  address: string;
  mobileNumber: string;
}



const AuthPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: decoded.userId, email: decoded.email || 'Unknown' });
        setIsLoggedIn(true);

        // Verify token by fetching protected resource
        axios
          .get<AddressesResponse>(`${process.env.NEXT_PUBLIC_API_URL}/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch((error) => {
            console.error('Token verification failed:', error);
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setUser(null);
            setErrorMessage('Session expired. Please log in again.');
          });
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        setErrorMessage('Invalid token. Please log in again.');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Authentication Status</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        {isLoggedIn && user ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Welcome, {user.email}</h2>
            <p className="text-gray-600">You are logged in.</p>
            <div className="space-y-2">
              <Link
                href="/profile"
                className="block w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-center"
              >
                Go to Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Not Logged In</h2>
            <p className="text-gray-600">Please log in to access your account.</p>
            <Link
              href="/"
              className="block w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-center"
            >
              Go to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;