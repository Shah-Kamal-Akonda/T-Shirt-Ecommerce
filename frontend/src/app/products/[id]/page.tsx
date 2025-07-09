'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[] | null | undefined;
  discount: number | null | undefined;
  categories: { id: number; name: string }[] | null | undefined;
}

const ProductPage: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      axios
        .get<Product>(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
        .then((response) => {
          const productData = response.data;
          if (productData && typeof productData === 'object' && 'id' in productData) {
            const sanitizedProduct = {
              ...productData,
              id: productData.id,
              name: productData.name || 'Unknown',
              price: productData.price || 0,
              description: productData.description || 'No description',
              images: Array.isArray(productData.images) ? productData.images : [],
              discount: productData.discount || null,
              categories: Array.isArray(productData.categories) ? productData.categories : [],
            };
            setProduct(sanitizedProduct);
            setMainImage(sanitizedProduct.images[0] || null);
          } else {
            setProduct(null);
          }
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

  const discountedPrice = product.discount
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Thumbnail Images */}
        <div className="flex flex-col gap-2">
          {Array.isArray(product.images) && product.images.length > 0 ? (
            product.images.map((image, index) => (
              <Image
                key={index}
                src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                alt={`${product.name} thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="object-cover rounded cursor-pointer hover:opacity-80"
                onClick={() => setMainImage(image)}
              />
            ))
          ) : (
            <p className="text-gray-500">No images available</p>
          )}
        </div>
        {/* Main Image */}
        <div className="w-full md:w-1/2">
          {mainImage ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${mainImage}`}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover rounded"
            />
          ) : (
            <p className="text-gray-500">No main image</p>
          )}
        </div>
        {/* Product Details */}
        <div className="w-full md:w-1/4">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">{product.name}</h1>
          <div className="flex gap-2 items-center">
            <p className="text-lg font-semibold">
              {discountedPrice ? (
                <>
                  <span className="line-through text-gray-400">${product.price.toFixed(2)}</span>
                  <span className="text-green-600 ml-2">${discountedPrice}</span>
                </>
              ) : (
                `$${product.price.toFixed(2)}`
              )}
            </p>
            {product.discount && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                {product.discount}% OFF
              </span>
            )}
          </div>
          <p className="mb-4 text-gray-600">{product.description}</p>
          <p className="text-sm text-gray-500">
            Categories:{' '}
            {Array.isArray(product.categories) && product.categories.length > 0
              ? product.categories.map((cat) => cat.name).join(', ')
              : 'None'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;