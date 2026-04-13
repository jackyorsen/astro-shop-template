import React from 'react';

interface ProductSkeletonProps {
    count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 12 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col h-full gap-3 relative animate-pulse"
                    style={{ animationDelay: `${i * 50}ms` }}
                >
                    {/* Image Skeleton */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 rounded-[8px]">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex flex-col gap-2 px-1">
                        {/* Title */}
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />

                        {/* Price */}
                        <div className="h-5 bg-gray-200 rounded w-1/3 mt-1" />

                        {/* Category */}
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                </div>
            ))}
        </>
    );
};
