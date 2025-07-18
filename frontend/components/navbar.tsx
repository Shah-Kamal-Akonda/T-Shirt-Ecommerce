'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import SignUpPopup from './SignUpPopup';
import LoginPopup from './LoginPopup';
import { useAuth } from '@/app/context/AuthContext';

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
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLFormElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLoginSuccess = async () => {
    // No specific action needed in Navbar after login
  };

  const handleSignUpToLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

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

  useEffect(() => {
    setSuggestions([]);
    setSearchQuery('');
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    router.push('/');
  };

  const toggleProductsDropdown = () => setIsProductsOpen(!isProductsOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileDropdown = () => setIsProfileOpen(!isProfileOpen);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-800 text-[10px] md:text-[16px] lg:text-[24px] hover:text-green-600 transition">
          T-Shirt Ecommerce
        </Link>

        <div className="hidden md:flex flex-row md:space-x-5 lg:space-x-8 md:text-[12px] lg:text-[20px]">
          <Link
            href="/"
            className="block text-gray-700 hover:text-green-600 font-medium"
            onClick={toggleMobileMenu}
          >
            Home
          </Link>
          <div>
            <button
              onClick={toggleProductsDropdown}
              className="text-gray-700 hover:text-green-600 font-medium flex items-center"
            >
              Products
              <svg
                className={`ml-1 md:h-4 md:w-3 lg:w-5 lg:h-5 transform ${isProductsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isProductsOpen && (
              <div className="absolute top-full shadow-md space-y-2 p-2">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products/category/${category.id}`}
                      className="block text-gray-500 hover:text-black bg-white"
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
            className="block text-gray-700 hover:text-green-600 font-medium"
            onClick={toggleMobileMenu}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block text-gray-700 hover:text-green-600 font-medium"
            onClick={toggleMobileMenu}
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center space-x-1 md:space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative mr-4 md:mr-8" ref={searchRef}>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-23 h-8 md:w-38 md:h-10 lg:w-40 lg:h-12 pl-10 pr-0.5 md:pr-4 py-2 border rounded-full text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            {suggestions.length > 0 && searchQuery.trim() && (
              <div className="absolute mt-2 w-64 bg-white shadow-lg rounded-md py-2 z-10 max-h-60 overflow-y-auto">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.name)}
                    className="flex items-center px-4 py-2 hover:bg-green-50 cursor-pointer"
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
                width={24}
                height={24}
                className="rounded-full"
              />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-10">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsSignUpOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => {
                        setIsLoginOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden flex items-center mr-6">
          <button onClick={toggleMobileMenu} className="text-gray-700 hover:text-green-600">
            {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-700 hover:text-green-600 font-medium"
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <div>
              <button
                onClick={toggleProductsDropdown}
                className="text-gray-700 hover:text-green-600 font-medium flex items-center"
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
                        className="block text-gray-700 hover:text-green-600"
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
              className="block text-gray-700 hover:text-green-600 font-medium"
              onClick={toggleMobileMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-green-600 font-medium"
              onClick={toggleMobileMenu}
            >
              Contact
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="block text-gray-700 hover:text-green-600 font-medium"
                  onClick={toggleMobileMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-green-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsSignUpOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-green-600 font-medium"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-green-600 font-medium"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <SignUpPopup isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} onLogin={handleSignUpToLogin} />
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
    </nav>
  );
};

export default Navbar;