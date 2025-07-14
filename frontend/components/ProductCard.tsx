'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[] | null | undefined;
  discount?: number | null;
  sizes: string[] | null;
  categories: { id: number; name: string }[] | null | undefined;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateQuantity, removeFromCart, toggleCart } = useCart();
  const [quantity, setQuantity] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Sync quantity with cart
  useEffect(() => {
    const cartItem = cart.find((item) => item.id === product.id && item.size === selectedSize);
    setQuantity(cartItem ? cartItem.quantity : 0);
  }, [cart, product.id, selectedSize]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any potential navigation
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size before adding to cart.');
      return;
    }
    if (product.images && product.images[0]) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1,
        discount: product.discount,
        size: selectedSize || 'N/A',
      });
      toggleCart();
    }
  };

  const handleQuantityChange = (e: React.MouseEvent, newQuantity: number) => {
    e.preventDefault(); // Prevent any potential navigation
    if (newQuantity < 0) return;
    if (newQuantity === 0) {
      removeFromCart(product.id, selectedSize || 'N/A');
      setQuantity(0);
    } else {
      updateQuantity(product.id, newQuantity, selectedSize || 'N/A');
      setQuantity(newQuantity);
    }
  };

  const discountedPrice = product.discount
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : null;

  return (
    <div className="p-4 hover:shadow-lg transition bg-white">
      {/* Navigable content wrapped in Link */}
      <Link href={`/products/${product.id}`}>
        <div className="relative p-2 md:p-0 w-[130px] md:w-[230px] lg:w-[350px] h-[130px] md:h-[160px] lg:h-[280px] mt-2 overflow-hidden bg-white">
          {Array.isArray(product.images) && product.images.length > 0 ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-center">
              <p className="text-gray-400 text-sm px-2">No Image</p>
            </div>
          )}
        </div>
        <div className="items-center gap-2 mt-2">
          <div>
            <h3 className="text-[12px] md:text-[20px] font-bold text-gray-800  text-center lg:text-center">{product.name}</h3>
          </div>
          <p className="text-gray-600 text-left md:text-center space-x-1.5 md:space-x-3">
            {discountedPrice ? (
              <>
                <span className="line-through text-gray-400 text-[12px] md:text-[20px] font-bold">${product.price.toFixed(2)}</span>
                <span className="text-green-600 text-[12px] md:text-[20px] font-bold">${discountedPrice}</span>
              </>
            ) : (
              `Price: $${product.price.toFixed(2)}`
            )}
            {product.discount && (
              <span className="bg-red-500 text-white text-[12px] md:text-[16px] p-0.5 md:p-2 rounded-2xl">
                {product.discount}%
              </span>
            )}
          </p>
          {product.sizes && product.sizes.length > 0 && (
            // <p className="text-gray-700 text-[12px] md:text-[14px] lg:text-[16px] text-center">
            //   Sizes: {product.sizes.join(', ')}
            // </p>
            <p></p>
          )}
        </div>
      </Link>

      {/* Non-navigable content: Size dropdown and cart buttons */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="relative">
          <div className="absolute top-[-76px] md:top-[-95px] lg:top-[-95px] left-0   lg:left-0">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="bg-green-500 text-white rounded-r-sm md:rounded-r-sm lg:rounded-r-md  lg:p-1 text-sm  focus:outline-none font-semibold text-[10px] md:text-[14px] lg:text-[20px] w-[70px] md:w-[90px] lg:w-[130px]  h-[25px] md:h-[28] lg:h-[30px]"
            >
              <option value="">select size</option>
              {product.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="mt-2">
        <div className="flex justify-center space-x-2">
          {quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-green-500 text-white w-[120px] md:w-[180px] lg:w-[240px] font-semibold rounded-2xl md:rounded-3xl lg:rounded-4xl p-1.5 md:p-2 text-[12px] md:text-[14px] lg:text-[16px] cursor-pointer"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center space-x-0.5 md:space-x-1 lg:space-x-2">
              <button
                onClick={(e) => handleQuantityChange(e, quantity + 1)}
                className="bg-green-500 text-white px-2 py-1 rounded-2xl md:rounded-3xl lg:rounded-4xl font-bold text-[12px] md:text-[14px] lg:text-[20px] p-1 md:p-2 lg:p-3 cursor-pointer"
              >
                +
              </button>
              <span className="px-2 py-1 text-center bg-green-500 text-white w-[70px] md:w-[160px] lg:w-[210px] font-semibold rounded-2xl md:rounded-3xl lg:rounded-4xl p-1.5 md:p-2 text-[12px] md:text-[14px] lg:text-[16px] cursor-pointer">
                cart {quantity} in
              </span>
              <button
                onClick={(e) => handleQuantityChange(e, quantity - 1)}
                className="bg-green-500 text-white px-2 py-1 rounded-2xl md:rounded-3xl lg:rounded-4xl font-bold text-[12px] md:text-[14px] lg:text-[20px] p-1 md:p-2 lg:p-3 cursor-pointer"
              >
                –
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;






// import React from 'react';
// import Link from 'next/link';
// import Image from 'next/image';

// interface Product {
//   id: number;
//   name: string;
//   price: number;
//   description: string;
//   images: string[] | null | undefined;
//    discount?: number | null;
//   categories: { id: number; name: string }[] | null | undefined;
// }

// interface ProductCardProps {
//   product: Product;
// }

// const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
//   const discountedPrice = product.discount
//     ? (product.price * (1 - product.discount / 100)).toFixed(2)
//     : null;

//   return (
//     <Link
//       href={`/products/${product.id}`}
//       className=" p-4  hover:shadow-lg transition bg-white"
//     >

//      <div className="relative   p-2  md:p-0 w-[130px] md:w-[230px] lg:w-[350px] h-[100px] md:h-[160px] lg:h-[280px] mt-2  overflow-hidden bg-white">
//   {Array.isArray(product.images) && product.images.length > 0 ? (
//     <Image
//       src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`}
//       alt={product.name}
//       fill
//       className="object-cover"
//     />
//   ) : (
//     <div className="w-full h-full flex items-center justify-center bg-gray-100 text-center">
//       <p className="text-gray-400 text-sm px-2">No Image</p>
//     </div>
//   )}
// </div>



      
//       <div className=" items-center gap-2">
//           <div>
//              <h3 className="text-[12px] md:text-[20px] font-bold text-gray-800 text-center">{product.name}</h3>
//           </div>


//         <p className="text-gray-600 text-left md:text-center space-x-1.5 md:space-x-3  ">
//           {discountedPrice ? (
//             <>
//               <span className="line-through text-gray-400 text-[12px] md:text-[20px] font-bold">${product.price.toFixed(2)}</span>
//               <span className="text-green-600 text-[12px] md:text-[20px] font-bold ">${discountedPrice}</span>
//             </>
//           ) : (
//             `Price: $${product.price.toFixed(2)}`
//           )}



//            {product.discount && (
//           <span className="bg-red-600 text-white text-[12px] md:text-[16px]  p-0.5 md:p-2 rounded-2xl   ">
//             {product.discount}%
//           </span>
//         )}
//         </p>
       
//       </div>
           
//       {/* <p className="text-sm text-gray-500">{product.description.substring(0, 100)}...</p> */}
     
//       {/* <p className="text-sm text-gray-400 mt-2">
//         Categories:{' '}
//         {Array.isArray(product.categories) && product.categories.length > 0
//           ? product.categories.map((cat) => cat.name).join(', ')
//           : 'None'}
//       </p> */}


//     </Link>
//   );
// };

// export default ProductCard;
