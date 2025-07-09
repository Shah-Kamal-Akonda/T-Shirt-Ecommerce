'use client';

import { useState } from 'react';
import { PhoneCall, Zap, User, Search, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      router.push(`/products?name=${searchTerm}`);
    }
  };

  return (
    <div className="w-full text-base">
      {/* Top Bar */}
      <div className="bg-black text-white py-3 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and title */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Image src="/red_t_shirt.jpg" alt="Logo" width={32} height={32} className="w-8 h-8 sm:w-8 sm:h-8 md:w-8 md:h-8 lg:w-9 lg:h-9" />
            <span className="font-bold text-base sm:text-lg md:text-base lg:text-base ml-4 md:ml-10">Sample Navbar</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-[300px] md:max-w-[80%] lg:max-w-lg relative">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 pl-10 py-2 rounded-md text-sm sm:text-sm md:text-sm lg:text-sm text-black border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute top-2.5 left-3 text-gray-500" size={16} />
        </form>

        {/* Right Side */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-4 lg:gap-5">
          <div className="flex items-center gap-1.5">
            <PhoneCall size={14} className="text-orange-600 sm:size-14 md:size-10 lg:size-12" />
            <span className="font-semibold text-xs sm:text-sm md:text-sm lg:text-sm">01872952818</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-orange-500 sm:size-14 md:size-10 lg:size-12" />
            <span className="font-semibold text-xs sm:text-sm md:text-sm lg:text-sm">OFFERS</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={14} className="text-orange-400 sm:size-14 md:size-10 lg:size-12" />
            <div className="leading-tight">
              <div className="text-xs sm:text-sm md:text-sm lg:text-sm font-semibold">ACCOUNT</div>
              <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-gray-300">Register or Login</div>
            </div>
          </div>
        </div>

        <button
          className="md:hidden text-white focus:outline-none absolute right-4 top-4"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={20} className="md:size-16" /> : <Menu size={20} className="md:size-16" />}
        </button>
      </div>

      {/* Bottom Static Menu with Dropdowns */}
      <div
        className={`bg-white border-t border-gray-200 md:block ${isMenuOpen ? 'block' : 'hidden'}`}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row flex-wrap gap-x-6 gap-y-2 font-semibold text-sm sm:text-sm md:text-base justify-start">
          <Link href="/adminPannel" className="cursor-pointer hover:text-orange-600">Admin Panel</Link>
          <div className="relative group cursor-pointer">
            <div className="hover:text-orange-600">Power Banks</div>
            <div className="absolute md:group-hover:block bg-white shadow-md mt-2 rounded w-40 sm:w-44 md:w-44 z-20 hidden">
              <div className="px-4 py-2 hover:bg-orange-100 text-sm">10000 mAh</div>
              <div className="px-4 py-2 hover:bg-orange-100 text-sm">20000 mAh</div>
              <div className="px-4 py-2 hover:bg-orange-100 text-sm">Solar Power Bank</div>
            </div>
          </div>
          <div className="relative group cursor-pointer">
            <div className="hover:text-orange-600">Mobile Phones</div>
            <div className="absolute md:group-hover:block bg-white shadow-md mt-2 rounded w-40 sm:w-44 md:w-44 z-20 hidden">
              <div className="px-4 py-2 hover:bg-orange-100 text-sm">Android</div>
              <div className="px-4 py-2 hover:bg-orange-100 text-sm">iPhone</div>
              <div className="px-4 py-2 hover:bg-orange-100 text-sm">Tablets</div>
            </div>
          </div>
          <div className="relative group cursor-pointer">
            <div className="hover:text-orange-600">Bluetooth Speakers</div>
            <div className="absolute md:group-hover:block bg-white shadow-md mt-2 rounded w-40 sm:w-44 md:w-48 z-20 hidden">
              <div className="px-4 py-2 hover:bg-orange-100 text-sm">Small</div>
              <div className="px-4 py-2 hover:bg-orange-100 text-sm">Waterproof</div>
              <div className="px-4 py-2 hover:bg-orange-100 text-sm">Party Speakers</div>
            </div>
          </div>
          <div className="cursor-pointer hover:text-orange-600">Headphones</div>
          <div className="cursor-pointer hover:text-orange-600">Phone Accessories</div>
          <div className="cursor-pointer hover:text-orange-600">Routers</div>
          <div className="cursor-pointer hover:text-orange-600">Gadget</div>
          <div className="cursor-pointer hover:text-orange-600">Microphone</div>
          <div className="cursor-pointer hover:text-orange-600">Free Delivery</div>
          <div className="cursor-pointer hover:text-orange-600">11:11 Offer</div>
        </div>
      </div>
    </div>
  );
}