'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  discount?: number | null;
  size: string;
}

interface Address {
  id: number;
  name: string;
  address: string;
  mobileNumber: string;
}

interface OrderPopupProps {
  cart: CartItem[];
  total: string;
  address: Address;
  onClose: () => void;
}

const OrderPopup: React.FC<OrderPopupProps> = ({ cart, total, address, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();
  const { clearCart } = useCart(); // To clear cart after order

  const handleConfirmOrder = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          items: cart,
          total: parseFloat(total),
          address: {
            name: address.name,
            address: address.address,
            mobileNumber: address.mobileNumber,
          },
          userId: user?.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clearCart(); // Clear cart after successful order
      alert('Order placed successfully! Confirmation emails sent.');
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
              <div>
                <p className="text-gray-800">{item.name} (Size: {item.size})</p>
                <p className="text-gray-600">
                  {item.discount ? (
                    <>
                      <span className="line-through text-gray-400 mr-1">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="text-green-600">
                        ${(item.price * (1 - (item.discount || 0) / 100)).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    `$${item.price.toFixed(2)}`
                  )}
                  {' '}x {item.quantity}
                </p>
              </div>
              <p className="text-gray-800">
                ${((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="border-t pt-2">
            <p className="text-gray-800 font-bold">Total: ${total}</p>
          </div>
          <div className="mt-4">
            <h3 className="text-gray-800 font-medium">Shipping Address</h3>
            <p className="text-gray-600 text-sm">
              {address.name}, {address.address}, {address.mobileNumber}
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 rounded-sm md:rounded-md lg:rounded-lg p-2 md:p-3 text-[12px] md:text-[14px] lg:text-[16px]"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmOrder}
            className="bg-green-500 text-white rounded-sm md:rounded-md lg:rounded-lg p-2 md:p-3 text-[12px] md:text-[14px] lg:text-[16px] disabled:bg-green-400"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPopup;