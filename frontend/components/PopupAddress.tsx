'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Address {
  id?: number;
  name: string;
  address: string;
  mobileNumber: string;
}

interface PopupAddressProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address;
}

interface AddressResponse {
  message: string;
  address?: Address;
}

interface ErrorResponse {
  message: string;
  statusCode?: number;
}

const PopupAddress: React.FC<PopupAddressProps> = ({ isOpen, onClose, address }) => {
  const [name, setName] = useState(address?.name || '');
  const [addressText, setAddressText] = useState(address?.address || '');
  const [mobileNumber, setMobileNumber] = useState(address?.mobileNumber || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setName(address.name);
      setAddressText(address.address);
      setMobileNumber(address.mobileNumber);
    }
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const newAddress = { name, address: addressText, mobileNumber };

    try {
      if (address?.id) {
        // Update existing address
        const response = await axios.put<AddressResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/addresses/${address.id}`,
          { ...newAddress, id: address.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.message === 'Address updated successfully') {
          onClose();
        }
      } else {
        // Add new address
        const response = await axios.post<AddressResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/addresses`,
          newAddress,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.message === 'Address added successfully') {
          onClose();
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: ErrorResponse } };
      setErrorMessage(err.response?.data?.message || 'Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setAddressText('');
    setMobileNumber('');
    setErrorMessage('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button onClick={handleClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">{address ? 'Edit Address' : 'Add Address'}</h2>
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          <div>
            <label className="block text-gray-700 text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium">Address</label>
            <input
              type="text"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium">Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PopupAddress;