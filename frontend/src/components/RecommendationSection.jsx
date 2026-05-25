import React from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from './ProductCard';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function RecommendationSection() {
  const { recommendations, categoryAffinity } = useApp();

  const getTopCategory = () => {
    const entries = Object.entries(categoryAffinity);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };

  const topCategory = getTopCategory();

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-6 pt-2">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom/50 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <div className="p-1.5 bg-brand-indigo/10 rounded-lg text-brand-indigo">
              <Sparkles className="w-5 h-5 text-brand-indigo animate-pulse-glow" />
            </div>
            <span>Recommended for You</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Dynamic recommendations updating instantly as you search and click.
          </p>
        </div>

        {/* Dynamic Context tag */}
        {topCategory ? (
          <div className="self-start sm:self-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo dark:text-indigo-300 shadow-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-ping" />
            <span>Tailored to interest in <strong className="font-extrabold capitalize text-brand-pink">{topCategory}</strong></span>
          </div>
        ) : (
          <div className="self-start sm:self-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-bg-secondary border border-border-custom text-text-secondary shadow-sm">
            <TrendingUp className="w-3.5 h-3.5 text-brand-purple" />
            <span>Trending Products</span>
          </div>
        )}
      </div>

      {/* Grid of Recommended Products */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {recommendations.slice(0, 4).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
