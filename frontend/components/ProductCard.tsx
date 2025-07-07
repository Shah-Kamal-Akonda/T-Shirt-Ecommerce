
import { Product } from '../data/types';
import Image from 'next/image';

interface ProductCardProps{
    product:Product;
}


export default function ProductCard({product}:ProductCardProps){

const discountedPrice = product.price * (1 - product.discount/100);

    return (
        <>
       <div className="bg-white    overflow-hidden transition duration-500  hover:border border-black cursor-pointer flex flex-col max-w-[120px] sm:max-w-[380px]">
    <div className="w-full aspect-square relative">
  <Image
    src={product.images[0]}
    alt={product.name}
    fill
    className="object-cover"
    sizes="100vw"
    priority={false}
  />
</div>

        <div className=" text-center  flex flex-col flex-grow">
          <h3 className="text-[10px] sm:text-base font-bold text-black ">
            {product.name}
          </h3>
         
        
            <div >
              <span className="text-blue-600  font-bold text-[10px] sm:text-base">
                ${discountedPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <span className="ml-1 md:ml-2 text-[8px] sm:text-sm font-bold text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}

                 <span className="text-[8px] ml-2 md:ml-4 sm:text-sm font-bold bg-orange-600 text-white px-1 sm:px-2 py-0.5 rounded-full">
              {product.discount}%
            </span>
            </div>
         
          </div>
       
      </div>
          
        </>
    )
}