import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  categories: { id: number; name: string }[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link
      href={`/products/${product.id}`}
      className="border p-4 rounded hover:shadow-lg transition bg-white"
    >
      <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
      <p className="text-gray-600">Price: ${product.price}</p>
      <p className="text-sm text-gray-500">{product.description.substring(0, 100)}...</p>
      <div className="flex gap-2 mt-2">
        {product.images.map((image, index) => (
          <Image
            key={index}
            src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
            alt={product.name}
            className="w-24 h-24 object-cover rounded"
          />
        ))}
      </div>
      <p className="text-sm text-gray-400 mt-2">
        Categories: {product.categories.map((cat) => cat.name).join(', ')}
      </p>
    </Link>
  );
};

export default ProductCard;