import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

import Navbar from '../components/Navbar';
import DynamicOffers from '../components/DynamicOffers';
import RecommendationSection from '../components/RecommendationSection';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';
import { Search, X, Sparkles, Cpu, Award } from 'lucide-react';

export default function Home() {
  const {
    products,
    fetchProducts,
    searchProducts,
    loading,
    currentSegment,
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
        return 'Our machine learning models identified you as a Tech Enthusiast. We have customized your product feeds and unlocked a premium gadget promo code below.';
      case 'fashion_lovers':
        return 'Our fashion segment scoring categorized you as a Trendsetter. Enjoy customized apparel picks and stackable style discounts below.';
      case 'bargain_hunters':
        return 'Smart shopper score detected. High-utility deals and maximum budget optimization discounts have been injected into your dashboard.';
      default:
        return 'Explore personalized shopping. Interaction clicks, search keywords, and purchases train the AI engine in real-time to tailor your feed.';
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300">

      <Navbar />

      {/* HERO */}
      <header className="relative text-center py-16 sm:py-20 overflow-hidden">
        {/* Floating backdrops */}
        <div className="gradient-glow-orb top-[-80px] left-[15%] w-[320px] h-[320px] bg-brand-indigo/10 animate-pulse-glow" />
        <div className="gradient-glow-orb top-[40px] right-[15%] w-[280px] h-[280px] bg-brand-pink/5 animate-pulse-glow" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 max-w-3xl mx-auto px-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 shadow-sm animate-scale-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-time Behavior Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold mt-6 leading-tight tracking-tight text-text-primary">
            The Store That <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">Learns You</span>
          </h1>

          <p className="text-sm sm:text-base text-text-secondary mt-4 max-w-xl leading-relaxed">
            Watch recommendations and discount packages adapt instantly as you search, click, and browse the catalog.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 space-y-10 pb-20">

        {/* SEGMENT PANEL */}
        {showSegmentDemoPanel && (
          <div className="relative overflow-hidden rounded-3xl border border-border-custom bg-bg-secondary/35 backdrop-blur-md p-5 shadow-lg animate-scale-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-brand-indigo/5 to-transparent pointer-events-none" />

            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-brand-indigo/10 text-brand-indigo rounded-2xl border border-brand-indigo/20 flex-shrink-0 animate-float">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <span>AI Personalisation Active</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 max-w-2xl leading-relaxed">
                  {getSegmentDesc()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSegmentDemoPanel(false)}
              className="absolute top-3.5 right-3.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary/80 p-2 rounded-xl transition duration-200 cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* OFFERS */}
        <DynamicOffers />

        {/* RECOMMENDATIONS */}
        <RecommendationSection />

        {/* FILTER + SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-t border-border-custom/40 pt-10">
          
          {/* CATEGORIES */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = (cat === 'All' && !selectedCategory) || cat === selectedCategory;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4.5 py-2 rounded-full border text-xs font-bold transition-all duration-300 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-brand-indigo border-brand-indigo text-white shadow-md shadow-brand-indigo/20'
                      : 'bg-bg-secondary border-border-custom text-text-secondary hover:bg-bg-secondary/80 hover:text-text-primary hover:border-text-secondary/25'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* SEARCH */}
          <form onSubmit={handleSearch} className="relative flex items-center w-full md:max-w-xs group">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search products..."
              className="w-full h-10 px-4 pl-10 pr-12 rounded-full bg-bg-secondary/60 border border-border-custom text-xs font-semibold text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/30 focus:bg-bg-secondary transition-all duration-300"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-text-muted group-focus-within:text-brand-indigo transition duration-300" />
            
            {searchVal && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-14 text-text-muted hover:text-brand-pink p-1 rounded-full hover:bg-bg-primary transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="submit"
              className="absolute right-1.5 h-7 px-3 bg-brand-indigo hover:bg-brand-indigo/90 active:scale-95 text-white font-bold text-[10px] rounded-full shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">

          {loading ? (
            <Skeleton count={8} />
          ) : products.length === 0 ? (
            <div className="col-span-2 lg:col-span-4 text-center py-20 bg-bg-secondary/20 rounded-3xl border border-border-custom/50">
              <Award className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-text-secondary">No products found</p>
              <p className="text-xs text-text-muted mt-1">Try tweaking your search criteria or Category tags.</p>
            </div>
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