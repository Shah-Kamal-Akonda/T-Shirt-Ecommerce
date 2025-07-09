'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
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
    images: [] as File[],
    categoryIds: [] as number[],
  });
  const [categoryForm, setCategoryForm] = useState({ id: 0, name: '' });
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);

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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('price', productForm.price.toString());
    formData.append('description', productForm.description);
    formData.append('categoryIds', JSON.stringify(productForm.categoryIds));
    productForm.images.forEach((image) => formData.append('images', image));

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
      images: [],
      categoryIds: product.categories.map((cat) => cat.id),
    });
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
    setProductForm({ id: 0, name: '', price: 0, description: '', images: [], categoryIds: [] });
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
          <textarea
            placeholder="Description"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="file"
            multiple
            onChange={(e) => setProductForm({ ...productForm, images: Array.from(e.target.files || []) })}
            className="border p-2 w-full rounded"
          />
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
              <p>Price: ${product.price}</p>
              <p>{product.description.substring(0, 100)}...</p>
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ))}
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