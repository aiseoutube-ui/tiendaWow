import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-neutral-200 rounded-md ${className}`} />
  );
};

export const ProductSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 p-4">
    <Skeleton className="w-full h-56 mb-4 rounded-xl" />
    <Skeleton className="w-3/4 h-6 mb-2" />
    <Skeleton className="w-1/2 h-5 mb-4" />
    <div className="flex justify-between items-center">
      <Skeleton className="w-1/3 h-8" />
      <Skeleton className="w-10 h-10 rounded-full" />
    </div>
  </div>
);