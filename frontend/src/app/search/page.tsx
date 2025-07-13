'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import ProductCard from '../../../components/ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  discount: number | null;
  sizes: string[] | null; // ADD HERE: Added sizes to Product interface
  categories: { id: number; name: string }[];
}

const SearchComponent: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // ADD HERE: State for size filter
  const [sizeFilter, setSizeFilter] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      if (query.trim()) {
        try {
          // CHANGE HERE: Add size filter to API call
          const response = await axios.get<Product[]>(
            `${process.env.NEXT_PUBLIC_API_URL}/products/search?name=${encodeURIComponent(query)}`,
            sizeFilter ? { params: { size: sizeFilter } } : {},
          );
          setProducts(response.data || []);
          setLoading(false);
        } catch (error) {
          console.error('Error searching products:', error);
          setProducts([]);
          setLoading(false);
        }
      } else {
        setProducts([]);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [query, sizeFilter]); // CHANGE HERE: Added sizeFilter to dependencies

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
           Search Results for &quot;{query}&quot;
      </h1>
      {/* ADD HERE: Size filter dropdown */}
      <div className="mb-6">
        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="w-full sm:w-48 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600 text-[12px] md:text-[14px] lg:text-[16px]"
        >
          <option value="">All Sizes</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <p className="text-gray-500">No products found.</p>
        )}
      </div>
    </div>
  );
};

const SearchPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-4">Loading search...</div>}>
      <SearchComponent />
    </Suspense>
  );
};

export default SearchPage;