import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Tag, Sparkles, ChevronRight, Copy, Check } from 'lucide-react';

export default function DynamicOffers() {
  const { offers } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fadeTrigger, setFadeTrigger] = useState(true);

  useEffect(() => {
    if (offers.length <= 1) return;
    const interval = setInterval(() => {
      // Trigger fade out
      setFadeTrigger(false);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % offers.length);
        setFadeTrigger(true);
      }, 300); // match duration
    }, 6000);
    return () => clearInterval(interval);
  }, [offers]);

  // When manually clicking dot
  const handleDotClick = (idx) => {
    if (idx === activeIndex) return;
    setFadeTrigger(false);
    setTimeout(() => {
      setActiveIndex(idx);
      setFadeTrigger(true);
    }, 300);
  };

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

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border-custom bg-bg-secondary/25 backdrop-blur-md shadow-xl transition-all duration-500">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-brand-indigo/8 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-brand-pink/5 blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />
      
      <div className="relative h-[280px] sm:h-[320px] w-full flex items-center">
        
        {/* Banner image with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={activeOffer.bannerImage} 
            alt={activeOffer.title}
            className={`w-full h-full object-cover opacity-15 dark:opacity-30 transition-all duration-700 scale-102 ${
              fadeTrigger ? 'opacity-15 dark:opacity-30 blur-none' : 'opacity-0 blur-sm'
            }`}
          />
          {/* Multi-directional gradients for clean readability in both themes */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/95 to-transparent" />
        </div>

        {/* Content Box */}
        <div className={`relative z-10 max-w-xl px-6 sm:px-12 flex flex-col gap-3.5 transition-all duration-300 ${
          fadeTrigger ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          {/* Segment Tag */}
          <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-purple/10 border border-brand-purple/20 text-brand-purple dark:text-purple-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{getSegmentReason(activeOffer.targetSegment)}</span>
          </div>

          {/* Offer Title */}
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-text-primary leading-tight">
            {activeOffer.title}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-text-secondary max-w-md leading-relaxed">
            {activeOffer.description}
          </p>

          {/* Code display row */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-bg-secondary/80 border border-dashed border-border-custom shadow-inner">
              <Tag className="w-4 h-4 text-brand-pink" />
              <span className="font-mono text-sm font-extrabold tracking-wider text-brand-pink uppercase">
                {activeOffer.discountCode}
              </span>
            </div>
            
            <button 
              onClick={() => handleCopyCode(activeOffer.discountCode)}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-indigo-600 hover:to-purple-600 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/35 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* dots */}
      {offers.length > 1 && (
        <div className="absolute bottom-5 right-6 sm:right-12 z-20 flex gap-2">
          {offers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                activeIndex === idx 
                  ? 'w-7 bg-brand-indigo shadow-md shadow-brand-indigo/30' 
                  : 'w-2 bg-text-muted/30 hover:bg-text-muted/50'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
