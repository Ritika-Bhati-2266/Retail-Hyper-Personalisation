import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Tag, Sparkles, ChevronRight } from 'lucide-react';

export default function DynamicOffers() {
  const { offers } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (offers.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % offers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [offers]);

  if (offers.length === 0) return null;

  const activeOffer = offers[activeIndex];

  const getSegmentReason = (segment) => {
    switch (segment) {
      case 'electronics_lovers':
        return 'Exclusive Tech Enthusiast Reward';
      case 'fashion_lovers':
        return 'Vogue Trendsetter Special';
      case 'bargain_hunters':
        return 'Extra Discount Deal Stack';
      case 'new_users':
        return 'First Purchase Welcome Offer';
      default:
        return 'Daily Shopping Treat';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md shadow-xl transition-all duration-300">
      
      {/* Background Decorative Blur Orb (Modern UI detail) */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-indigo/10 blur-3xl pointer-events-none" />
      
      <div className="relative h-[260px] sm:h-[300px] w-full flex items-center">
        
        {/* Banner image with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={activeOffer.bannerImage} 
            alt={activeOffer.title}
            className="w-full h-full object-cover opacity-20 dark:opacity-35 transition-all duration-700 scale-102"
          />
          {/* Multi-directional gradients for clean readability in both themes */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/90 to-transparent" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-xl px-6 sm:px-12 flex flex-col gap-3">
          {/* Segment Tag */}
          <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-purple/10 border border-brand-purple/20 text-brand-purple dark:text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{getSegmentReason(activeOffer.targetSegment)}</span>
          </div>

          {/* Offer Title */}
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-text-primary leading-tight">
            {activeOffer.title}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-text-secondary max-w-md leading-relaxed">
            {activeOffer.description}
          </p>

          {/* Code display row */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary border border-dashed border-border-custom shadow-inner">
              <Tag className="w-4 h-4 text-brand-pink" />
              <span className="font-mono text-sm font-bold tracking-wider text-brand-pink uppercase">
                {activeOffer.discountCode}
              </span>
            </div>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(activeOffer.discountCode);
                alert(`Promo code ${activeOffer.discountCode} copied to clipboard!`);
              }}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/25 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Copy Code</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* dots */}
      {offers.length > 1 && (
        <div className="absolute bottom-4 right-6 sm:right-12 z-20 flex gap-2">
          {offers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 bg-brand-indigo' : 'bg-text-muted/30'}`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
