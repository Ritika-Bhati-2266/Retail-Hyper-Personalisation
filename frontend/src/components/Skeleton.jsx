import React from 'react';

export default function Skeleton({ count = 1 }) {
  const cards = Array.from({ length: count });

  return (
    <>
      {cards.map((_, idx) => (
        <div 
          key={idx}
          className="flex flex-col overflow-hidden rounded-2xl border border-border-custom/80 bg-bg-secondary/25 p-4 gap-4 animate-scale-in"
        >
          {/* Shimmer Image Box */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-bg-primary/60 animate-shimmer" />

          {/* Shimmer Text Fields */}
          <div className="space-y-3.5 flex-1 flex flex-col">
            {/* Rating skeleton */}
            <div className="h-3.5 w-1/4 rounded-full bg-bg-primary/60 animate-shimmer" />
            
            {/* Title skeleton */}
            <div className="h-4.5 w-3/4 rounded-full bg-bg-primary/60 animate-shimmer" />

            {/* Desc lines skeleton */}
            <div className="space-y-2 flex-1">
              <div className="h-3 w-full rounded-full bg-bg-primary/60 animate-shimmer" />
              <div className="h-3 w-5/6 rounded-full bg-bg-primary/60 animate-shimmer" />
            </div>
            
            {/* Shimmer Action row */}
            <div className="flex items-center justify-between pt-3 border-t border-border-custom/40 mt-auto">
              <div className="h-5 w-1/3 rounded-full bg-bg-primary/60 animate-shimmer" />
              <div className="h-9 w-9 rounded-xl bg-bg-primary/60 animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
