
import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { Product } from '../types';
import { useRelatedProducts } from '../hooks/useSheetsApi';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RelatedProductsProps {
    currentProduct: Product;
}

// Simple Intersection Observer Hook
function useInView(ref: React.RefObject<Element>, options = {}) {
    const [isIntersecting, setIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false); // Trigger once

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIntersecting(entry.isIntersecting);
            if (entry.isIntersecting) {
                setHasIntersected(true);
            }
        }, options);

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref, options]);

    return hasIntersected;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProduct }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);

    // Trigger fetch only when section is visible (with 200px margin)
    const shouldFetch = useInView(sectionRef, { rootMargin: '200px' });

    const { relatedProducts, loading } = useRelatedProducts(
        currentProduct.category,
        currentProduct.id,
        shouldFetch
    );

    const scrollRecommendations = (direction: 'left' | 'right') => {
        if (containerRef.current) {
            const container = containerRef.current;
            const scrollAmount = container.clientWidth / (window.innerWidth > 1024 ? 5 : (window.innerWidth > 640 ? 2 : 1));

            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!shouldFetch && !loading && relatedProducts.length === 0) {
        // Placeholder height to prevent layout shift
        return <div ref={sectionRef} className="h-20 w-full" />;
    }

    return (
        <div ref={sectionRef} className="mt-24 mb-16 relative">
            <div className="flex items-center justify-between mb-8 px-4 lg:px-0">
                <div>
                    <h2 className="text-2xl font-bold text-[#111] mb-2">Ähnliche Produkte</h2>
                    <div className="h-1 w-20 bg-[#2b4736] rounded-full"></div>
                </div>

                {(relatedProducts.length > 5 || window.innerWidth < 1024) && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => scrollRecommendations('left')}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#2b4736] hover:text-white hover:border-[#2b4736] transition-all bg-white shadow-sm"
                            aria-label="Previous"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scrollRecommendations('right')}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#2b4736] hover:text-white hover:border-[#2b4736] transition-all bg-white shadow-sm"
                            aria-label="Next"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className="relative -mx-4 lg:mx-0">
                <div
                    ref={containerRef}
                    className="flex gap-4 overflow-x-auto px-4 lg:px-1 pb-8 scrollbar-hide snap-x"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {loading ? (
                        // Skeleton Loading
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="min-w-[280px] md:min-w-[300px] h-[450px] bg-gray-100 rounded-lg animate-pulse snap-start"></div>
                        ))
                    ) : (
                        relatedProducts.map((product) => (
                            <div key={product.id} className="min-w-[280px] md:min-w-[300px] snap-start h-full">
                                <ProductCard product={product} />
                            </div>
                        ))
                    )}
                </div>

                {/* Fade Gradients for Mobile */}
                <div className="absolute top-0 left-0 bottom-8 w-8 bg-gradient-to-r from-[#f7f7f7] to-transparent lg:hidden pointer-events-none"></div>
                <div className="absolute top-0 right-0 bottom-8 w-8 bg-gradient-to-l from-[#f7f7f7] to-transparent lg:hidden pointer-events-none"></div>
            </div>
        </div>
    );
};
