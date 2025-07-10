import './globals.css';
import type { Metadata } from 'next';
import Navbar from '../../components/navbar';

export const metadata: Metadata = {
  title: 'MyShop',
  description: 'An e-commerce platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}