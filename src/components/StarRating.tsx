import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating, sizeClass = "w-5 h-5", className = "" }: { rating: number, sizeClass?: string, className?: string }) => {
    return (
        <div className={`flex gap-0.5 text-[#eebb0e] ${className}`}>
            {[...Array(5)].map((_, i) => {
                const isFull = rating >= i + 1;
                const isPartial = !isFull && rating > i;
                const fillPercentage = isPartial ? (rating - i) * 100 : 0;

                return (
                    <div key={i} className={`relative ${sizeClass}`}>
                        <Star className={`absolute inset-0 ${sizeClass} text-gray-200 fill-gray-100`} />
                        {(isFull || isPartial) && (
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ clipPath: `inset(0 ${isFull ? 0 : 100 - fillPercentage}% 0 0)` }}
                            >
                                <Star className={`absolute inset-0 ${sizeClass} fill-current text-[#eebb0e]`} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
