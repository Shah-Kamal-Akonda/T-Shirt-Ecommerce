'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import SignUpPopup from './SignUpPopup';
import LoginPopup from './LoginPopup';

interface Product {
  id: number;
  name: string;
  images: string[];
}

interface Category {
  id: number;
  name: string;
}

const Navbar: React.FC = () => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLFormElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch suggestions with debouncing
  useEffect(() => {
    const debounce = setTimeout(() => {
      const fetchSuggestions = async () => {
        if (searchQuery.trim()) {
          try {
            const response = await axios.get<Product[]>(`${process.env.NEXT_PUBLIC_API_URL}/products/search?name=${encodeURIComponent(searchQuery)}`);
            setSuggestions(response.data || []);
          } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
          }
        } else {
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Clear suggestions on navigation
  useEffect(() => {
    setSuggestions([]);
    setSearchQuery('');
    setIsProfileOpen(false);
  }, [pathname]);

  // Handle click outside to close suggestions and profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/search?name=${encodeURIComponent(searchQuery)}`);
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchQuery('');
        setSuggestions([]);
        setIsMobileMenuOpen(false);
      } catch (error) {
        console.error('Error searching products:', error);
      }
    }
  };

  const handleSuggestionClick = (productName: string) => {
    setSearchQuery(productName);
    router.push(`/search?q=${encodeURIComponent(productName)}`);
    setSuggestions([]);
    setIsMobileMenuOpen(false);
  };

  const toggleProductsDropdown = () => setIsProductsOpen(!isProductsOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileDropdown = () => setIsProfileOpen(!isProfileOpen);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition">
          MyShop
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition">
            Home
          </Link>
          <div className="relative">
            <button
              onClick={toggleProductsDropdown}
              className="text-gray-700 hover:text-blue-600 font-medium transition flex items-center"
            >
              Products
              <svg
                className={`ml-1 h-5 w-5 transform ${isProductsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isProductsOpen && (
              <div className="absolute mt-2 w-48 bg-white shadow-lg rounded-md py-2">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products/category/${category.id}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No categories available</div>
                )}
              </div>
            )}
          </div>
          <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition">
            About
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition">
            Contact
          </Link>
        </div>

        {/* Search Bar and Profile Icon */}
        <div className="hidden md:flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative" ref={searchRef}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-10 pr-4 py-2 border rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            {suggestions.length > 0 && searchQuery.trim() && (
              <div className="absolute mt-12 w-64 bg-white shadow-lg rounded-md py-2 z-10 max-h-60 overflow-y-auto">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.name)}
                    className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {product.images[0] && (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="mr-3 rounded"
                      />
                    )}
                    <span className="text-gray-700">{product.name}</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          <div className="relative" ref={profileRef}>
            <button onClick={toggleProfileDropdown}>
              <Image
                src="/profile-icon.png"
                alt="Profile"
                width={44}
                height={24}
                className="rounded-full"
              />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-10">
                <button
                  onClick={() => {
                    setIsSignUpOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-gray-700 hover:text-blue-600">
            {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <div>
              <button
                onClick={toggleProductsDropdown}
                className="text-gray-700 hover:text-blue-600 font-medium flex items-center"
              >
                Products
                <svg
                  className={`ml-1 h-5 w-5 transform ${isProductsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isProductsOpen && (
                <div className="pl-4 mt-2 space-y-2">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products/category/${category.id}`}
                        className="block text-gray-700 hover:text-blue-600"
                        onClick={() => {
                          setIsProductsOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No categories available</div>
                  )}
                </div>
              )}
            </div>
            <Link
              href="/about"
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={toggleMobileMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={toggleMobileMenu}
            >
              Contact
            </Link>
            <form onSubmit={handleSearchSubmit} className="relative" ref={searchRef}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              {suggestions.length > 0 && searchQuery.trim() && (
                <div className="mt-2 w-full bg-white shadow-lg rounded-md py-2 z-10 max-h-60 overflow-y-auto">
                  {suggestions.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSuggestionClick(product.name)}
                      className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    >
                      {product.images[0] && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="mr-3 rounded"
                        />
                      )}
                      <span className="text-gray-700">{product.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </form>
            <div className="relative">
              <button onClick={toggleProfileDropdown}>
                <Image
                  src="/profile-icon.png"
                  alt="Profile"
                  width={24}
                  height={24}
                />
              </button>
              {isProfileOpen && (
                <div className="mt-2 w-48 bg-white shadow-lg rounded-md py-2">
                  <button
                    onClick={() => {
                      setIsSignUpOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <SignUpPopup isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </nav>
  );
};

export default Navbar;