'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  discount: number | null;
  categories: { id: number; name: string }[];
}

interface Category {
  id: number;
  name: string;
}

const AdminPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productForm, setProductForm] = useState({
    id: 0,
    name: '',
    price: 0,
    description: '',
    images: [null, null, null, null, null] as (File | null)[],
    discount: null as number | null,
    categoryIds: [] as number[],
  });
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: 0, name: '' });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get<Category[]>(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log(`Selected file for input ${index + 1}:`, file?.name || 'None');
    setProductForm((prev) => {
      const newImages = [...prev.images];
      newImages[index] = file;
      return { ...prev, images: newImages };
    });
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews[index] = file ? URL.createObjectURL(file) : null;
      return newPreviews;
    });
  };

  const clearImage = (index: number) => {
    setProductForm((prev) => {
      const newImages = [...prev.images];
      newImages[index] = null;
      return { ...prev, images: newImages };
    });
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews[index] = null;
      return newPreviews;
    });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('price', productForm.price.toString());
    formData.append('description', productForm.description);
    if (productForm.discount !== null) {
      formData.append('discount', productForm.discount.toString());
    }
    formData.append('categoryIds', JSON.stringify(productForm.categoryIds));
    productForm.images.forEach((image, index) => {
      if (image) {
        formData.append('images', image);
        console.log(`Appending image ${index + 1}: ${image.name}`);
      }
    });

    try {
      if (isEditingProduct) {
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productForm.id}`, formData);
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/products`, formData);
      }
      fetchProducts();
      resetProductForm();
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingCategory) {
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryForm.id}`, {
          name: categoryForm.name,
        });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          name: categoryForm.name,
        });
      }
      fetchCategories();
      resetCategoryForm();
    } catch (error) {
      console.error('Error submitting category:', error);
    }
  };

  const handleProductEdit = (product: Product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      images: [null, null, null, null, null],
      discount: product.discount,
      categoryIds: product.categories.map((cat) => cat.id),
    });
    setImagePreviews([null, null, null, null, null]);
    setIsEditingProduct(true);
  };

  const handleCategoryEdit = (category: Category) => {
    setCategoryForm({ id: category.id, name: category.name });
    setIsEditingCategory(true);
  };

  const handleProductDelete = async (id: number) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCategoryDelete = async (id: number) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      id: 0,
      name: '',
      price: 0,
      description: '',
      images: [null, null, null, null, null],
      discount: null,
      categoryIds: [],
    });
    setImagePreviews([null, null, null, null, null]);
    setIsEditingProduct(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ id: 0, name: '' });
    setIsEditingCategory(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* Product Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{isEditingProduct ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={productForm.price}
            onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="number"
            placeholder="Discount (%)"
            value={productForm.discount || ''}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                discount: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            className="border p-2 w-full rounded"
          />
          <textarea
            placeholder="Description"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
          <div>
            <label className="block text-gray-700 mb-1">Product Images (up to 5)</label>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="mb-2 flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange(index)}
                  className="border p-2 w-full rounded"
                />
                {imagePreviews[index] && (
                  <>
                    <img
                      src={imagePreviews[index]!}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => clearImage(index)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          <select
            multiple
            value={productForm.categoryIds.map(String)}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                categoryIds: Array.from(e.target.selectedOptions, (option) => parseInt(option.value)),
              })
            }
            className="border p-2 w-full rounded"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {isEditingProduct ? 'Update Product' : 'Add Product'}
          </button>
          {isEditingProduct && (
            <button
              type="button"
              onClick={resetProductForm}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 ml-2"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Category Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{isEditingCategory ? 'Edit Category' : 'Add Category'}</h2>
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Category Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {isEditingCategory ? 'Update Category' : 'Add Category'}
          </button>
          {isEditingCategory && (
            <button
              type="button"
              onClick={resetCategoryForm}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 ml-2"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Product List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p>
                Price:{' '}
                {product.discount ? (
                  <>
                    <span className="line-through text-gray-400">${product.price.toFixed(2)}</span>
                    <span className="text-green-600 ml-2">
                      ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                    </span>
                  </>
                ) : (
                  `$${product.price.toFixed(2)}`
                )}
              </p>
              {product.discount && <p>Discount: {product.discount}%</p>}
              <p>{product.description.substring(0, 100)}...</p>
              <div className="flex gap-2">
                {product.images.length > 0 ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <p className="text-gray-500">No image</p>
                )}
              </div>
              <p>Categories: {product.categories.map((cat) => cat.name).join(', ')}</p>
              <button
                onClick={() => handleProductEdit(product)}
                className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mt-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleProductDelete(product.id)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-2 ml-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Category List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border p-4 rounded">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <button
                onClick={() => handleCategoryEdit(category)}
                className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mt-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleCategoryDelete(category.id)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-2 ml-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;