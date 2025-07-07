import { productCategories } from '../data/product';
import ProductCard from './ProductCard';

export default function ProductSection() {
  return (
    <div className="bg-white py-6">
      {productCategories.map((category) => (
        <div key={category.id} className="w-full mb-8">
          <h2 className="text-center text-lg sm:text-xl md:text-2xl font-bold text-green-900 m-10">
            {category.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-6 px-2 sm:px-4">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
