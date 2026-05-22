import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

import Navbar from '../components/Navbar';
import DynamicOffers from '../components/DynamicOffers';
import RecommendationSection from '../components/RecommendationSection';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';
import { Search, X, ChevronRight, Sparkles } from 'lucide-react';

export default function Home() {

  const {
    products,
    fetchProducts,
    searchProducts,
    loading,
    currentSegment,
    categoryAffinity
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [showSegmentDemoPanel, setShowSegmentDemoPanel] = useState(true);

  const categories = ['All', 'Electronics', 'Fashion', 'Fitness', 'Home'];

  // ---------------- CATEGORY ----------------
  const handleCategorySelect = (category) => {
    const cat = category === 'All' ? '' : category;
    setSelectedCategory(cat);
    fetchProducts(cat);
  };

  // ---------------- SEARCH ----------------
  const handleSearch = (e) => {
    e.preventDefault();
    searchProducts(searchVal);
  };

  const handleClearSearch = () => {
    setSearchVal('');
    fetchProducts(selectedCategory);
  };

  // ---------------- SEGMENT TEXT ----------------
  const getSegmentDesc = () => {
    switch (currentSegment) {
      case 'electronics_lovers':
        return 'Tech Enthusiast detected. Showing premium gadgets.';
      case 'fashion_lovers':
        return 'Fashion Lover detected. Showing trendy items.';
      case 'bargain_hunters':
        return 'Bargain Hunter detected. Showing best deals.';
      default:
        return 'Welcome! Explore personalized shopping experience.';
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">

      <Navbar />

      {/* HERO */}
      <header className="text-center py-14">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <Sparkles size={16} />
          AI Powered Store
        </div>

        <h1 className="text-4xl font-bold mt-3">
          Personalized Shopping
        </h1>

        <p className="text-gray-500 mt-2">
          Smart recommendations based on user behavior
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 space-y-8">

        {/* SEGMENT PANEL */}
        {showSegmentDemoPanel && (
          <div className="p-4 border rounded-xl bg-gray-50 relative">

            <button
              onClick={() => setShowSegmentDemoPanel(false)}
              className="absolute top-2 right-2"
            >
              <X size={18} />
            </button>

            <h2 className="font-bold">
              AI Personalization Active
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              {getSegmentDesc()}
            </p>
          </div>
        )}

        {/* OFFERS */}
        <DynamicOffers />

        {/* RECOMMENDATIONS */}
        <RecommendationSection />

        {/* FILTER + SEARCH */}
        <div className="flex flex-col md:flex-row justify-between gap-4">

          {/* CATEGORIES */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-1 rounded-full border text-sm ${
                  (cat === 'All' && !selectedCategory) || cat === selectedCategory
                    ? 'bg-black text-white'
                    : 'bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search products..."
              className="border px-3 py-1 rounded"
            />

            {searchVal && (
              <button
                type="button"
                onClick={handleClearSearch}
              >
                <X size={18} />
              </button>
            )}

            <button
              type="submit"
              className="px-3 py-1 bg-black text-white rounded"
            >
              Search
            </button>
          </form>
        </div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {loading ? (
            <Skeleton count={8} />
          ) : products.length === 0 ? (
            <p className="text-center col-span-4 text-gray-500">
              No products found
            </p>
          ) : (
            products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          )}

        </div>

      </main>
    </div>
  );
}