import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from './ProductCard';
import Skeleton from './Skeleton';
import { Sparkles, TrendingUp, RefreshCw, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

export default function RecommendationSection() {
  const { recommendations, categoryAffinity, recLoading, refreshPersonalization } = useApp();
  const scrollContainerRef = useRef(null);

  const getTopCategory = () => {
    const entries = Object.entries(categoryAffinity);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };

  const topCategory = getTopCategory();

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (recommendations.length === 0 && !recLoading) return null;

  return (
    <div className="space-y-6 pt-2 group/section">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom/50 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <div className="p-1.5 bg-brand-indigo/10 rounded-lg text-brand-indigo">
              <Sparkles className="w-5 h-5 text-brand-indigo animate-pulse-glow" />
            </div>
            <span>Recommended for You</span>
            <button
              onClick={refreshPersonalization}
              disabled={recLoading}
              className="p-1.5 hover:bg-bg-secondary hover:text-brand-indigo text-text-muted rounded-xl transition-all duration-300 disabled:opacity-50 cursor-pointer ml-1"
              title="Refresh Recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${recLoading ? 'animate-spin text-brand-indigo' : ''}`} />
            </button>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Apple-inspired personal feed updates instantly as you browse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Scroll Controls (Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-bg-secondary border border-border-custom text-text-secondary hover:text-brand-indigo hover:border-brand-indigo/30 transition-all active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-bg-secondary border border-border-custom text-text-secondary hover:text-brand-indigo hover:border-brand-indigo/30 transition-all active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Context tag */}
          {topCategory ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo dark:text-indigo-300 shadow-sm backdrop-blur-sm animate-scale-in">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-ping" />
              <span>Tailored to <strong className="font-extrabold capitalize text-brand-pink">{topCategory}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-bg-secondary border border-border-custom text-text-secondary shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 text-brand-purple" />
              <span>Trending Now</span>
            </div>
          )}
        </div>
      </div>

      {/* Carousel of Recommended Products */}
      <div 
        ref={scrollContainerRef}
        className={`flex overflow-x-auto gap-5 sm:gap-6 pb-6 pt-2 scrollbar-hide snap-x snap-mandatory transition-all duration-700 ease-in-out ${recLoading ? 'opacity-40 blur-[2px] scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recLoading ? (
          <div className="flex gap-6 w-full">
            <Skeleton count={4} />
          </div>
        ) : (
          recommendations.slice(0, 8).map((product, idx) => (
            <div 
              key={product._id} 
              className="min-w-[260px] sm:min-w-[280px] flex-shrink-0 snap-start animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative">
                {/* Recommendation Badge */}
                {idx === 0 && (
                  <div className="absolute -top-3 -right-2 z-20 px-2 py-0.5 rounded-md bg-brand-pink text-white text-[9px] font-black uppercase tracking-tighter shadow-lg shadow-brand-pink/40 animate-float flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-white" />
                    Top Match
                  </div>
                )}
                {product.category === topCategory && idx > 0 && (
                  <div className="absolute -top-3 -left-2 z-20 px-2 py-0.5 rounded-md bg-brand-indigo text-white text-[9px] font-black uppercase tracking-tighter shadow-lg shadow-brand-indigo/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 fill-white" />
                    For You
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
