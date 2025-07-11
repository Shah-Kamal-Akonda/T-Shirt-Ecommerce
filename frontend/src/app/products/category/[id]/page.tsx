'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import ProductCard from '../../../../../components/ProductCard';
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  discount: number | null;
  categories: { id: number; name: string }[];
}

interface Category {
  id: number;
  name: string;
}

const CategoryPage: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(`${process.env.NEXT_PUBLIC_API_URL}/products/category/${id}`);
        setProducts(response.data || []);
        const categoryResponse = await axios.get<Category[]>(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const category = categoryResponse.data.find((cat) => cat.id === parseInt(id));
        setCategoryName(category?.name || 'Category');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setCategoryName('Category');
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">{categoryName} Products</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <p className="text-gray-500">No products found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;