'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  categories: { id: number; name: string }[];
}

const ProductPage: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios
        .get<Product>(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
        .then((response) => {
          setProduct(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching product:', error);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (!product) return <div className="container mx-auto p-4">Product not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">{product.name}</h1>
      <p className="text-lg mb-2 text-gray-700">Price: ${product.price}</p>
      <p className="mb-4 text-gray-600">{product.description}</p>
      <div className="flex gap-4 mb-4">
        {product.images.map((image, index) => (
          <img
            key={index}
            src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
            alt={product.name}
            className="w-48 h-48 object-cover rounded"
          />
        ))}
      </div>
      <p className="text-sm text-gray-500">
        Categories: {product.categories.map((cat) => cat.name).join(', ')}
      </p>
    </div>
  );
};

export default ProductPage;