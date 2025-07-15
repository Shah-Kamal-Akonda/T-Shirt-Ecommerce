'use client'
import CartIcon from '../../components/Carticon';
import Navbar from '../../components/navbar';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <CartIcon />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}