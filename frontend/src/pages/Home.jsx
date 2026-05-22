import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import DynamicOffers from '../components/DynamicOffers';
import RecommendationSection from '../components/RecommendationSection';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';
import { Search, Filter, Sparkles, X, ChevronRight } from 'lucide-react';

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

  const handleCategorySelect = (category) => {
    const cat = category === 'All' ? '' : category;
    setSelectedCategory(cat);
    fetchProducts(cat);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchProducts(searchVal);
  };

  const handleClearSearch = () => {
    setSearchVal('');
    fetchProducts(selectedCategory);
  };

  const getSegmentDesc = () => {
    switch (currentSegment) {
      case 'electronics_lovers':
        return 'Our model identifies you as a Tech Enthusiast. Browse our premium audio devices, AMOLED trackers, and workspace smart gadgets.';
      case 'fashion_lovers':
        return 'Our model identifies you as a Trendsetter. Enjoy exclusive catalog updates featuring tailored coats and eco-friendly running shoes.';
      case 'bargain_hunters':
        return 'Our model identifies you as a Bargain Hunter. We have aggregated highest-discount banners and markdown code vouchers for you.';
      default:
        return 'Welcome to PersonalShop! Our recommendation model adjusts dynamically. Start clicking items or searching to tailor your feed.';
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300 relative overflow-hidden">
      
      {/* Decorative Orbs (Apple style background glows) */}
      <div className="gradient-glow-orb top-[-100px] left-[-50px] w-[400px] h-[400px] bg-brand-indigo/10 dark:bg-brand-indigo/15" />
      <div className="gradient-glow-orb top-[400px] right-[-50px] w-[500px] h-[500px] bg-brand-pink/5 dark:bg-brand-pink/10" />

      <Navbar />
      
      {/* Premium Apple/Nike Style Hero Section */}
      <header className="relative z-10 mx-auto max-w-5xl px-6 pt-16 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bg-secondary border border-border-custom text-text-secondary shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
          <span>Next-Generation Personalized Shopping</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-text-primary leading-[1.1] max-w-3xl mx-auto">
          Every Click Shapes <span className="gradient-text">Your Store.</span>
        </h1>
        
        <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
          An intelligent ecommerce space that learns your preferences, builds your affinity score, and targets promo codes in real time.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <a 
            href="#catalog"
            className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-indigo/20 hover:shadow-brand-indigo/35 hover:-translate-y-0.5 transition flex items-center gap-1 cursor-pointer"
          >
            <span>Explore Collections</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Real-time personalizer telemetry banner */}
        {showSegmentDemoPanel && (
          <div className="relative overflow-hidden rounded-3xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-6 shadow-lg">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setShowSegmentDemoPanel(false)}
                className="text-text-muted hover:text-text-primary p-1 transition cursor-pointer"
                title="Close Alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="space-y-2 max-w-2xl">
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20">
                  AI Personalisation Engine
                </span>
                <h2 className="text-lg font-bold font-display text-text-primary">
                  Adaptive Catalog Active
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {getSegmentDesc()}
                </p>
              </div>

              {/* Live telemetry score indicators */}
              <div className="rounded-2xl p-4 min-w-[240px] bg-bg-secondary/80 border border-border-custom shadow-inner">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-indigo mb-2.5">Live Interest Vectors</h4>
                {Object.keys(categoryAffinity).length === 0 ? (
                  <p className="text-[10px] text-text-muted">Affinities: No telemetry captured yet.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(categoryAffinity).slice(0, 3).map(([cat, val]) => (
                      <div key={cat} className="flex justify-between items-center text-[10px]">
                        <span className="text-text-secondary font-medium">{cat}:</span>
                        <span className="text-brand-pink font-extrabold">{val} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Offers Banners */}
        <DynamicOffers />

        {/* Recommendations scroll list */}
        <RecommendationSection />

        {/* Main Catalog Header */}
        <div id="catalog" className="space-y-6 pt-6 border-t border-border-custom/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">Explore Our Collections</h2>
              <p className="text-xs text-text-secondary mt-1">Browse all products or search specific items below.</p>
            </div>

            {/* Mobile search bar inline */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 md:hidden">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full h-9 px-3 pl-8 rounded-xl bg-bg-secondary border border-border-custom text-xs text-text-primary focus:outline-none"
                />
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-muted" />
              </div>
              <button 
                type="submit" 
                className="px-3 h-9 bg-brand-indigo text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Go
              </button>
            </form>
          </div>

          {/* Filtering bar and inline search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = (cat === 'All' && !selectedCategory) || (cat === selectedCategory);
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-brand-indigo border-brand-indigo text-white shadow-md shadow-brand-indigo/15' 
                        : 'bg-bg-secondary border-border-custom text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Desktop inline search */}
            <div className="hidden md:flex items-center gap-2">
              <form onSubmit={handleSearch} className="relative w-64">
                <input
                  type="text"
                  placeholder="Search inside catalog..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full h-9 px-3 pl-8 rounded-xl bg-bg-secondary border border-border-custom text-xs text-text-primary focus:outline-none focus:border-brand-indigo"
                />
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-muted" />
                {searchVal && (
                  <button 
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-2.5 p-0.5 text-text-muted hover:text-text-primary cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>

          </div>

          {/* Catalog grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <Skeleton count={5} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border-custom rounded-3xl bg-bg-secondary/20">
              <p className="text-sm text-text-muted">No products found matching the criteria.</p>
              <button 
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-brand-indigo hover:bg-brand-indigo/90 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 animate-scale-in">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

        </div>

      </main>

      <footer className="border-t border-border-custom bg-bg-secondary py-8 text-center text-xs text-text-muted mt-20">
        <p>© 2026 PersonalShop Inc. Hyper-personalisation engines enabled.</p>
      </footer>
    </div>
  );
}
