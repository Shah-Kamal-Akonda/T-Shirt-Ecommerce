'use client';
import React, { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import CartSlider from './CardSlider';

const CartIcon: React.FC = () => {
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className="fixed top-16 right-4 z-50 text-gray-700 hover:text-blue-600"
      >
        <ShoppingCartIcon className="h-8 w-8" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartCount}
        </span>
      </button>
      <CartSlider isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default CartIcon;