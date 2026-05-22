import React from 'react';

export default function Skeleton({ count = 1 }) {
  const cards = Array.from({ length: count });

  return (
    <>
      {cards.map((_, idx) => (
        <div 
          key={idx}
          className="flex flex-col overflow-hidden rounded-2xl border border-border-custom bg-bg-secondary/40 p-4 gap-4"
        >
          {/* Shimmer Image Box */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 animate-shimmer" />

          {/* Shimmer Text Fields */}
          <div className="space-y-3 flex-1">
            {/* Category tag skeleton */}
            <div className="h-3 w-1/3 rounded-full bg-gray-200 dark:bg-gray-800 animate-shimmer" />
            
            {/* Title skeleton */}
            <div className="h-4 w-3/4 rounded-full bg-gray-200 dark:bg-gray-800 animate-shimmer" />

            {/* Desc lines skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800 animate-shimmer" />
              <div className="h-3 w-5/6 rounded-full bg-gray-200 dark:bg-gray-800 animate-shimmer" />
            </div>
          </div>

          {/* Shimmer Action row */}
          <div className="flex items-center justify-between pt-3 border-t border-border-custom mt-auto">
            <div className="h-5 w-1/4 rounded-full bg-gray-200 dark:bg-gray-800 animate-shimmer" />
            <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-800 animate-shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}
