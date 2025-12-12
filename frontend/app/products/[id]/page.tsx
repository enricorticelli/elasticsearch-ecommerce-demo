'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface CategoryNode {
  name: string;
  level: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  categories: CategoryNode[];
  stock: number;
  imageUrl: string;
  createdAt: string;
}

const groupCategories = (categories?: CategoryNode[]) => {
  if (!categories || categories.length === 0) {
    return [];
  }

  const grouped = categories.reduce<Record<number, Set<string>>>((acc, node) => {
    if (!acc[node.level]) {
      acc[node.level] = new Set();
    }
    acc[node.level].add(node.name);
    return acc;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([level, names]) => ({
      level: Number(level),
      names: Array.from(names).sort(),
    }));
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${params.id}`);
      if (!response.ok) {
        setError(true);
        return;
      }
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to products
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go back to products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const categoryLevels = groupCategories(product.categories);
  const categorySummary =
    categoryLevels.length > 0
      ? categoryLevels.map((group) => `L${group.level}: ${group.names.join(', ')}`).join(' • ')
      : 'No categories';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to products
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">
                  {product.brand} • {categorySummary}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-gray-600 mb-6">
                  {product.description}
                </p>
              </div>

              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <div className={`text-lg ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? (
                    <>
                      <span className="font-semibold">In Stock</span>
                      <span className="text-gray-600 ml-2">({product.stock} available)</span>
                    </>
                  ) : (
                    <span className="font-semibold">Out of Stock</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <span className="font-semibold text-gray-900">Brand:</span>
                  <span className="ml-2 text-gray-600">{product.brand}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Categories:</span>
                  <div className="mt-2 space-y-1">
                    {categoryLevels.length === 0 ? (
                      <span className="ml-2 text-gray-600">No categories</span>
                    ) : (
                      categoryLevels.map((group) => (
                        <div key={group.level} className="ml-2 text-gray-600">
                          <span className="font-semibold text-gray-800">Level {group.level}:</span>{' '}
                          {group.names.join(', ')}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Product ID:</span>
                  <span className="ml-2 text-gray-600 text-sm">{product.id}</span>
                </div>
              </div>

              <button
                disabled={product.stock === 0}
                className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <p className="mt-4 text-sm text-gray-500 text-center">
                This is a demo e-commerce application
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
