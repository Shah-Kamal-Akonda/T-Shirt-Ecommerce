'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

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

interface Category {
  id: number;
  name: string;
}

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<{ [key: number]: Product[] }>({});
  const [loading, setLoading] = useState(true);
  // ADD HERE: State for size filter
  const [sizeFilter, setSizeFilter] = useState<string>('');

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        // Fetch all categories
        const categoryResponse = await axios.get<Category[]>(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const fetchedCategories = categoryResponse.data || [];
        setCategories(fetchedCategories);

        // Fetch products for each category
        const productsMap: { [key: number]: Product[] } = {};
        await Promise.all(
          fetchedCategories.map(async (category) => {
            const productResponse = await axios.get<Product[]>(
              `${process.env.NEXT_PUBLIC_API_URL}/products/category/${category.id}`,
              // ADD HERE: Pass size filter to category endpoint
              sizeFilter ? { params: { size: sizeFilter } } : {},
            );
            productsMap[category.id] = productResponse.data || [];
          }),
        );
        setProductsByCategory(productsMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories or products:', error);
        setCategories([]);
        setProductsByCategory({});
        setLoading(false);
      }
    };
    fetchCategoriesAndProducts();
  }, [sizeFilter]); // CHANGE HERE: Added sizeFilter to dependencies

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* ADD HERE: Size filter dropdown */}
      {/* <div className="mb-6">
        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="w-full sm:w-48 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <option value="">All Sizes</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
        </select>
      </div> */}

      {categories.length > 0 ? (
        categories.map((category) => (
          <div key={category.id} className="mb-8">
            <h2 className="text-2xl text-center font-bold my-6 text-gray-800">{category.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
              {productsByCategory[category.id]?.length > 0 ? (
                productsByCategory[category.id].map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className="text-gray-500">No products found in this category.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No categories available.</p>
      )}
    </div>
  );
};

export default HomePage;