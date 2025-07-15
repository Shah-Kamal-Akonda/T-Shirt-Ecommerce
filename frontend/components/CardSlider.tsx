'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import SignUpPopup from './SignUpPopup';
import LoginPopup from './LoginPopup';
import PopupAddress from './PopupAddress';
import OrderPopup from './OrederPopup';

interface CartSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlider: React.FC<CartSliderProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { isLoggedIn, addresses, fetchAddresses } = useAuth();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => {
        const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const checkAddresses = useCallback(async () => {
    if (isLoadingAddresses) return; // Prevent multiple fetches
    setIsLoadingAddresses(true);
    try {
      await fetchAddresses();
      if (addresses.length === 0) {
        setIsAddressOpen(true);
        setIsOrderOpen(false);
      } else {
        setIsAddressOpen(false);
        setIsOrderOpen(true);
      }
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [addresses, fetchAddresses, isLoadingAddresses]);

  const handleBuyNow = useCallback(async () => {
    if (!isLoggedIn) {
      setIsSignUpOpen(true);
      return;
    }
    await checkAddresses();
  }, [isLoggedIn, checkAddresses]);

  const handleSignUpSuccess = useCallback(() => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  }, []);

  const handleLoginSuccess = useCallback(async () => {
    setIsLoginOpen(false);
    await checkAddresses();
  }, [checkAddresses]);

  const handleAddressSuccess = useCallback(async () => {
    if (isLoadingAddresses) return; // Prevent multiple fetches
    setIsAddressOpen(false);
    setIsLoadingAddresses(true);
    try {
      await fetchAddresses();
      setIsOrderOpen(true); // Open OrderPopup after address is saved
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [fetchAddresses, isLoadingAddresses]);

  // Fetch addresses when component mounts or isLoggedIn changes
  useEffect(() => {
    if (isLoggedIn && !isLoadingAddresses) {
      fetchAddresses();
    }
  }, [isLoggedIn, fetchAddresses]);

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
              <div key={`${item.id}-${item.size}`} className="flex items-center gap-4 border-b pb-4">
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
                  <p className="text-gray-600 text-sm">Size: {item.size}</p>
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
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                      className="bg-gray-200 text-gray-800 px-2 py-1 rounded-l text-sm"
                      disabled={isLoadingAddresses}
                    >
                      –
                    </button>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                      className="bg-gray-200 text-gray-800 px-2 py-1 rounded-r text-sm"
                      disabled={isLoadingAddresses}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="ml-4 text-red-600 text-sm"
                      disabled={isLoadingAddresses}
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
      <div className="fixed bottom-4 md:bottom-8 lg:bottom-10 left-0 right-0 flex justify-center">
        <button
          onClick={handleBuyNow}
          className="bg-green-500 text-white rounded-sm md:rounded-md lg:rounded-lg p-2 md:p-3 lg:p-4 font-semibold text-[12px] md:text-[16px] lg:text-[20px] disabled:bg-gray-400"
          disabled={cart.length === 0 || isLoadingAddresses}
        >
          {isLoadingAddresses ? 'Loading...' : 'Buy Now'}
        </button>
      </div>
      <SignUpPopup isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} onLogin={handleSignUpSuccess} />
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
      <PopupAddress isOpen={isAddressOpen} onClose={() => setIsAddressOpen(false)} onSuccess={handleAddressSuccess} />
      {isOrderOpen && addresses.length > 0 && (
        <OrderPopup
          cart={cart}
          total={calculateTotal()}
          address={addresses[0]}
          onClose={() => setIsOrderOpen(false)}
        />
      )}
    </div>
  );
};

export default CartSlider;