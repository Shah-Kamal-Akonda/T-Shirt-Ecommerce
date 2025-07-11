'use client';
import React from 'react';
import { useCart } from '@/app/context/CartContext';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CartSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlider: React.FC<CartSliderProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => {
        const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Cart</h2>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6 text-gray-800" />
          </button>
        </div>
        {cart.length > 0 ? (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${item.image}`}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-800 font-medium text-sm">{item.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {item.discount ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-green-600">
                          ${(item.price * (1 - item.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      `$${item.price.toFixed(2)}`
                    )}
                    {' '}x {item.quantity}
                  </p>
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 text-gray-800 px-2 py-1 rounded-l text-sm"
                    >
                      –
                    </button>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 text-gray-800 px-2 py-1 rounded-r text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <p className="text-gray-800 font-bold">Total: ${calculateTotal()}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Your cart is empty.</p>
        )}
      </div>
    </div>
  );
};

export default CartSlider;