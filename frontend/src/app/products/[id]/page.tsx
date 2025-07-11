'use client';
import React, { useState, useEffect,Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { useCart } from '@/app/context/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[] | null | undefined;
   discount: number | null;
  categories: { id: number; name: string }[] | null | undefined;
}

const ProductComponent: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, updateQuantity, cart, toggleCart } = useCart();

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
            // Sync quantity with cart
            const cartItem = cart.find((item) => item.id === sanitizedProduct.id);
            setQuantity(cartItem ? cartItem.quantity : 1);
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
  }, [id, cart]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    if (product) {
      const cartItem = cart.find((item) => item.id === product.id);
      if (cartItem) {
        // If product is in cart, update cart quantity immediately
        updateQuantity(product.id, newQuantity);
      }
      // If not in cart, local quantity will be used when adding to cart
    }
  };

  const handleAddToCart = () => {
    if (product && product.images && product.images[0]) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity,
        discount: product.discount,
      });
      toggleCart(); // Open slider
    }
  };

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (!product) return <div className="container mx-auto p-4">Product not found.</div>;

  const discountedPrice = product.discount
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : null;

  return (
    <div className="mx-4 md:mx-6 my-8 md:m-12">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Thumbnail Images */}
        <div className="flex flex-col gap-2">
          {Array.isArray(product.images) && product.images.length > 0 ? (
            product.images.map((image, index) => (
              <div
                key={index}
                className="relative w-[45px] h-[40px] md:w-[50px] md:h-[45px] lg:w-[80px] lg:h-[70px] cursor-pointer hover:opacity-80"
                onClick={() => setMainImage(image)}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No images available</p>
          )}
        </div>

        {/* Main Image */}
        <div className="flex flex-col md:flex-row">
          {mainImage ? (
            <div className="relative w-[200px] h-[130px] md:w-[330px] md:h-[230px] lg:w-[600px] lg:h-[400px]">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${mainImage}`}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <p className="text-gray-500">No main image</p>
          )}

          {/* Product Details */}
          <div className="w-full lg:ml-12 md:ml-8 font-bold mt-4">
            <h1 className="text-gray-800 text-[12px] md:text-[17px] lg:text-[20px]">{product.name}</h1>
            <div className="flex items-center gap-x-2">
              <p>
                {discountedPrice ? (
                  <>
                    <span className="line-through text-gray-400 text-[12px] md:text-[17px] lg:text-[20px] mr-1">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-green-600 text-[12px] md:text-[17px] lg:text-[20px]">
                      ${discountedPrice}
                    </span>
                  </>
                ) : (
                  `$${product.price.toFixed(2)}`
                )}
              </p>
              {product.discount && (
                <span className="bg-red-500 text-white text-[12px] md:text-[17px] lg:text-[20px] rounded p-1 md:p-2">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            <p className="text-gray-600 text-[12px] md:text-[17px] lg:text-[20px]">{product.description}</p>
            <p className="text-gray-500 text-[12px] md:text-[17px] lg:text-[20px]">
              Categories:{' '}
              {Array.isArray(product.categories) && product.categories.length > 0
                ? product.categories.map((cat) => cat.name).join(', ')
                : 'None'}
            </p>

            {/* Quantity Selector */}
            <div className="mt-4 md:mt-6">
              <label className="text-gray-800 text-[12px] md:text-[14px] lg:text-[16px] font-bold">
                Quantity
              </label>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded-l text-[12px] md:text-[14px] lg:text-[16px]"
                >
                  –
                </button>
                <span className="px-4 py-1 bg-gray-100 text-gray-800 text-[12px] md:text-[14px] lg:text-[16px]">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded-r text-[12px] md:text-[14px] lg:text-[16px]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="font-bold mt-4 md:mt-6 text-[12px] md:text-[14px] lg:text-[16px]">
              <button className="bg-green-600 text-white rounded-b-sm p-1.5 md:p-3 mr-2">
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className="bg-orange-600 text-white rounded-b-sm p-1.5 md:p-3 ml-2"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



const ProductPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-4">Loading search...</div>}>
      <ProductComponent />
    </Suspense>
  );
};

export default ProductPage;