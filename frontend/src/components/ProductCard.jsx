import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Star, Flame, Sparkles, TrendingUp, Search, Eye, Award } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart, logBehavior } = useApp();

  const handleCardClick = () => {
    logBehavior('click', {
      productId: product._id,
      name: product.name,
      category: product.category,
      price: product.price
    });
  };

  const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);

  const getBadgeConfig = (reason) => {
    switch (reason) {
      case 'Trending Now':
        return {
          icon: <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20 animate-bounce" />,
          classes: 'bg-orange-500/10 border-orange-500/20 text-orange-500 dark:text-orange-400 shadow-orange-500/5'
        };
      case 'Matches your search':
        return {
          icon: <Search className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />,
          classes: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400 shadow-indigo-500/5'
        };
      case 'Similar to recently viewed':
        return {
          icon: <Eye className="w-3.5 h-3.5 text-pink-400 animate-pulse" />,
          classes: 'bg-pink-500/10 border-pink-500/20 text-pink-500 dark:text-pink-400 shadow-pink-500/5'
        };
      case 'Frequently viewed':
        return {
          icon: <Award className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />,
          classes: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400 shadow-emerald-500/5'
        };
      case 'Based on category interest':
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />,
          classes: 'bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400 shadow-purple-500/5'
        };
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-custom/80 bg-bg-secondary/25 backdrop-blur-md glass-card-hover cursor-pointer transition-all duration-500 animate-slide-up"
    >
      {/* Premium Ambient Hover Glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-brand-indigo/10 via-brand-purple/10 to-brand-pink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-sm" />

      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-bg-primary/50">
        <img 
          src={product.image} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
          loading="lazy"
        />
        
        {/* Hover Glassmorphic Overlay */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <span className="px-4 py-2 rounded-xl bg-white/10 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/10 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out">
            View Details
          </span>
        </div>

        {/* Category tag */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-bg-secondary/90 text-text-primary border border-border-custom/50 shadow-sm backdrop-blur-sm">
          {product.category}
        </span>

        {/* Discount badge */}
        {product.discountPercent > 0 ? (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20 animate-pulse-glow">
            -{product.discountPercent}% OFF
          </span>
        ) : (
          product.price > 150 && (
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-white text-white animate-bounce" />
              HOT
            </span>
          )
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4 relative z-10">
        {/* Rating Mock */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-text-muted/30'}`} />
          ))}
          <span className="text-[10px] text-text-secondary font-bold ml-1.5">(4.8)</span>
        </div>

        {/* Recommendation Reason */}
        {product.recommendationReason && (() => {
          const config = getBadgeConfig(product.recommendationReason);
          return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm transition-all duration-300 mb-2.5 w-fit ${config.classes}`}>
              {config.icon}
              <span>{product.recommendationReason}</span>
            </div>
          );
        })()}

        {/* Title */}
        <h3 className="text-sm font-bold text-text-primary group-hover:text-brand-indigo transition duration-300 truncate mb-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-custom/40">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-text-primary">${finalPrice.toFixed(2)}</span>
              {product.discountPercent > 0 && (
                <span className="text-xs text-text-muted line-through font-semibold">${product.price.toFixed(2)}</span>
              )}
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/30 active:scale-95 transition-all duration-300 cursor-pointer"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
