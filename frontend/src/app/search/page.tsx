'use client';
import React, { useState, useEffect,Suspense } from 'react';
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
  categories: { id: number; name: string }[];
}

const SearchComponent: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (query.trim()) {
        try {
          const response = await axios.get<Product[]>(`${process.env.NEXT_PUBLIC_API_URL}/products/search?name=${encodeURIComponent(query)}`);
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
  }, [query]);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
  Search Results for &quot;{query}&quot;
</h1>

      <div className="grid grid-cols-2  md:grid-cols-3  lg:grid-cols-4 gap-4">
        {products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <p className="text-gray-500">No products found.</p>
        )}
      </div>
    </div>
  );
};

// 🔸 Suspense দিয়ে wrap করা হয়েছে এই main export-এ
const SearchPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-4">Loading search...</div>}>
      <SearchComponent />
    </Suspense>
  );
};


export default SearchPage;