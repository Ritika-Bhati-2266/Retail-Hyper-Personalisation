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
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-custom pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-indigo" />
            <span>Recommended for You</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Dynamic recommendations updating instantly as you search and click.
          </p>
        </div>

        {/* Dynamic Context tag */}
        {topCategory ? (
          <div className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tailored to your affinity for <strong>{topCategory}</strong></span>
          </div>
        ) : (
          <div className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bg-secondary border border-border-custom text-text-secondary">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trending Products</span>
          </div>
        )}
      </div>

      {/* Grid of Recommended Products */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.slice(0, 4).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
