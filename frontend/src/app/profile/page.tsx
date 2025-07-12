'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  email: string;
}

interface Address {
  id: number;
  name: string;
  address: string;
  mobileNumber: string;
}

interface UpdatePasswordResponse {
  message: string;
}

interface AddressesResponse {
  addresses: Address[];
}

interface AddAddressResponse {
  message: string;
  address: Address;
}

interface UpdateAddressResponse {
  message: string;
  address: Address;
}

interface DeleteAddressResponse {
  message: string;
}

interface ErrorResponse {
  message: string;
  statusCode?: number;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [addressForm, setAddressForm] = useState<Partial<Address>>({ name: '', address: '', mobileNumber: '' });
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get<AddressesResponse>(`${process.env.NEXT_PUBLIC_API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddresses(response.data.addresses || []);

        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: decoded.userId, email: decoded.email || 'Unknown' });
      } catch (error: unknown) {
        const err = error as { response?: { data?: ErrorResponse; status?: number } };
        if (err.response?.status === 401) {
          setErrorMessage('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/auth');
        } else {
          setErrorMessage(err.response?.data?.message || 'Failed to fetch user data.');
        }
      }
    };

    fetchUserData();
  }, [router, isLoggedIn]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put<UpdatePasswordResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message);
      setErrorMessage('');
      setNewPassword('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: ErrorResponse } };
      setErrorMessage(err.response?.data?.message || 'Failed to update password.');
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (editingAddressId) {
        const response = await axios.put<UpdateAddressResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/addresses/${editingAddressId}`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAddresses(addresses.map((addr) => (addr.id === editingAddressId ? response.data.address : addr)));
        setSuccessMessage(response.data.message);
      } else {
        const response = await axios.post<AddAddressResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/addresses`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAddresses([...addresses, response.data.address]);
        setSuccessMessage(response.data.message);
      }
      setErrorMessage('');
      setAddressForm({ name: '', address: '', mobileNumber: '' });
      setEditingAddressId(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: ErrorResponse } };
      setErrorMessage(err.response?.data?.message || 'Failed to save address.');
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({ name: address.name, address: address.address, mobileNumber: address.mobileNumber });
    setEditingAddressId(address.id);
  };

  const handleDeleteAddress = async (addressId: number) => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.delete<DeleteAddressResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(addresses.filter((addr) => addr.id !== addressId));
      setSuccessMessage(response.data.message);
      setErrorMessage('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: ErrorResponse } };
      setErrorMessage(err.response?.data?.message || 'Failed to delete address.');
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  if (!user) {
    return null; // Redirecting to /auth
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Profile</h1>
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Address Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            {editingAddressId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <form onSubmit={handleAddressSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={addressForm.name}
                onChange={handleAddressFormChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={addressForm.address}
                onChange={handleAddressFormChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Mobile Number</label>
              <input
                type="text"
                name="mobileNumber"
                value={addressForm.mobileNumber}
                onChange={handleAddressFormChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:bg-green-400"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : editingAddressId ? 'Update Address' : 'Add Address'}
              </button>
              {editingAddressId && (
                <button
                  type="button"
                  onClick={() => {
                    setAddressForm({ name: '', address: '', mobileNumber: '' });
                    setEditingAddressId(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 p-3 rounded hover:bg-gray-400"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Existing Addresses */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-green-700 mb-3">Your Addresses</h3>
            {addresses.length === 0 ? (
              <p className="text-gray-600">No addresses found.</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border p-4 rounded bg-gray-50">
                    <p className="text-gray-700">
                      {address.name}, {address.address}, {address.mobileNumber}
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="text-green-600 hover:text-green-800"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Account Information</h2>
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              className="w-full p-3 border rounded bg-gray-100 cursor-not-allowed"
              disabled
            />
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:bg-green-400"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 mt-4"
            disabled={isLoading}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;