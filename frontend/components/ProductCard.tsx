import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[] | null | undefined;
   discount?: number | null;
  categories: { id: number; name: string }[] | null | undefined;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const discountedPrice = product.discount
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="border p-4 rounded hover:shadow-lg transition bg-white"
    >
      <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
      <div className="flex items-center gap-2">
        <p className="text-gray-600">
          {discountedPrice ? (
            <>
              <span className="line-through text-gray-400">${product.price.toFixed(2)}</span>
              <span className="text-green-600 font-bold ml-2">${discountedPrice}</span>
            </>
          ) : (
            `Price: $${product.price.toFixed(2)}`
          )}
        </p>
        {product.discount && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
            {product.discount}% OFF
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500">{product.description.substring(0, 100)}...</p>
      <div className="flex gap-2 mt-2">
        {Array.isArray(product.images) && product.images.length > 0 ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`}
            alt={product.name}
            width={96}
            height={96}
            className="object-cover rounded"
          />
        ) : (
          <p className="text-gray-500">No images available</p>
        )}
      </div>
      <p className="text-sm text-gray-400 mt-2">
        Categories:{' '}
        {Array.isArray(product.categories) && product.categories.length > 0
          ? product.categories.map((cat) => cat.name).join(', ')
          : 'None'}
      </p>
    </Link>
  );
};

export default ProductCard;