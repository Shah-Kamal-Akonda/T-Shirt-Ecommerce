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
      className=" p-4  hover:shadow-lg transition bg-white"
    >

     <div className="relative   p-2  md:p-0 w-[130px] md:w-[230px] lg:w-[350px] h-[100px] md:h-[160px] lg:h-[280px] mt-2  overflow-hidden bg-white">
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



      
      <div className=" items-center gap-2">
          <div>
             <h3 className="text-[12px] md:text-[20px] font-bold text-gray-800 text-center">{product.name}</h3>
          </div>


        <p className="text-gray-600 text-left md:text-center space-x-1.5 md:space-x-3  ">
          {discountedPrice ? (
            <>
              <span className="line-through text-gray-400 text-[12px] md:text-[20px] font-bold">${product.price.toFixed(2)}</span>
              <span className="text-green-600 text-[12px] md:text-[20px] font-bold ">${discountedPrice}</span>
            </>
          ) : (
            `Price: $${product.price.toFixed(2)}`
          )}



           {product.discount && (
          <span className="bg-red-600 text-white text-[12px] md:text-[16px]  p-0.5 md:p-2 rounded-2xl   ">
            {product.discount}%
          </span>
        )}
        </p>
       
      </div>
           
      {/* <p className="text-sm text-gray-500">{product.description.substring(0, 100)}...</p> */}
     
      {/* <p className="text-sm text-gray-400 mt-2">
        Categories:{' '}
        {Array.isArray(product.categories) && product.categories.length > 0
          ? product.categories.map((cat) => cat.name).join(', ')
          : 'None'}
      </p> */}


    </Link>
  );
};

export default ProductCard;