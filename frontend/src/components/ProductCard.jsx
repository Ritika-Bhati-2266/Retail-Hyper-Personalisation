import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Star } from 'lucide-react';

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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md glass-card-hover cursor-pointer transition-all duration-300"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-bg-primary">
        <img 
          src={product.image} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Category tag */}
        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-bg-secondary/90 text-text-primary border border-border-custom shadow-sm">
          {product.category}
        </span>

        {/* Discount badge */}
        {product.discountPercent > 0 && (
          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-brand-pink text-white animate-pulse shadow-sm">
            -{product.discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Rating Mock */}
        <div className="flex items-center gap-1 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-text-muted/30'}`} />
          ))}
          <span className="text-[10px] text-text-muted ml-1">(4.8)</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-indigo transition truncate mb-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-text-secondary line-clamp-2 mb-3.5 flex-1">
          {product.description}
        </p>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-custom/50">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-text-primary">${finalPrice.toFixed(2)}</span>
              {product.discountPercent > 0 && (
                <span className="text-xs text-text-muted line-through">${product.price.toFixed(2)}</span>
              )}
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/30 transition-all cursor-pointer"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
