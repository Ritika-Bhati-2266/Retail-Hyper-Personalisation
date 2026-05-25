import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Star, Flame, Sparkles } from 'lucide-react';

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

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-custom/80 bg-bg-secondary/25 backdrop-blur-md glass-card-hover cursor-pointer transition-all duration-500 animate-slide-up"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-bg-primary/50">
        <img 
          src={product.image} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
          loading="lazy"
        />
        
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
              <Flame className="w-3 h-3 fill-white" />
              HOT
            </span>
          )
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Rating Mock */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-text-muted/30'}`} />
          ))}
          <span className="text-[10px] text-text-secondary font-bold ml-1.5">(4.8)</span>
        </div>

        {/* Recommendation Reason */}
        {product.recommendationReason && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-indigo dark:text-indigo-400 mb-2 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-indigo dark:text-indigo-400 animate-pulse-glow" />
            <span>{product.recommendationReason}</span>
          </div>
        )}

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
