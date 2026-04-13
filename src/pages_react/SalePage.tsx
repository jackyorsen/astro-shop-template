import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductsFromSheets } from '../hooks/useSheetsApi';
import { ProductCard } from '../components/ProductCard';
import { ChevronDown, SlidersHorizontal, ArrowLeft, Tag, Loader2 } from 'lucide-react';

export const SalePage: React.FC = () => {
    // Robust data fetching check
    const sheetsData = useProductsFromSheets();
    const products = sheetsData?.products || [];
    const loading = sheetsData?.loading || false;

    const [sortValue, setSortValue] = useState('default');
    const [visibleCount, setVisibleCount] = useState(12);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Filter products with at least 20% discount
    const { filteredProducts } = useMemo(() => {
        if (!Array.isArray(products) || products.length === 0) {
            return { filteredProducts: [] };
        }

        const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');

        // Only Songmics products in Sale page (implicit via filter logic, but safe to filter first)
        const shopProducts = products.filter(p => p && p.source === 'songmics');

        const filtered = shopProducts.filter(p => {
            const price = isCH ? (p as any).price_ch ?? p.price : p.price;
            const pricePrev = isCH ? (p as any).pricePrev_ch ?? (p as any).pricePrev : (p as any).pricePrev;

            if (!pricePrev || !price) return false;
            // Must have a previous price higher than current price
            if (price >= pricePrev) return false;

            const discount = ((pricePrev - price) / pricePrev) * 100;
            return discount >= 20;
        });

        // Sorting Logic
        const sorted = [...filtered];
        sorted.sort((a, b) => {
            // Helper to get prices for sorting
            const getPrices = (product: any) => {
                const p = isCH ? product.price_ch ?? product.price : product.price;
                const pp = isCH ? product.pricePrev_ch ?? product.pricePrev : product.pricePrev;
                return { price: p, pricePrev: pp };
            };

            const aPrices = getPrices(a);
            const bPrices = getPrices(b);

            // 1. OOS always last (Robust Check)
            const isOOS = (p: any) => p.isOutOfStock || Number(p.stock) <= 0;
            const aOOS = isOOS(a) ? 1 : 0;
            const bOOS = isOOS(b) ? 1 : 0;
            if (aOOS !== bOOS) return aOOS - bOOS;

            // 2. User selected sort
            switch (sortValue) {
                case 'price-asc':
                    return aPrices.price - bPrices.price;
                case 'price-desc':
                    return bPrices.price - aPrices.price;
                case 'discount-desc': {
                    const aDiscount = aPrices.pricePrev ? ((aPrices.pricePrev - aPrices.price) / aPrices.pricePrev) : 0;
                    const bDiscount = bPrices.pricePrev ? ((bPrices.pricePrev - bPrices.price) / bPrices.pricePrev) : 0;
                    return bDiscount - aDiscount;
                }
                default:
                    return 0;
            }
        });

        return { filteredProducts: sorted };
    }, [products, sortValue]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProducts.length;

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleCount(prev => prev + 12);
            setIsLoadingMore(false);
        }, 600);
    };

    return (
        <div className="w-full">
            {/* Hero Banner */}
            <div className="relative h-[300px] w-full mb-8 bg-gradient-to-r from-[#d9534f] to-[#c9302c]">
                <div className="absolute inset-0 bg-black/20"></div>

                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <Tag className="w-16 h-16 text-white mb-4" strokeWidth={1.5} />
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                        Sale & Angebote
                    </h1>
                    <p className="text-white/90 max-w-2xl text-sm md:text-base leading-relaxed drop-shadow-md">
                        Entdecken Sie unsere besten Angebote mit mindestens 20% Rabatt. Hochwertige Möbel zu unschlagbaren Preisen!
                    </p>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="max-w-[1320px] mx-auto px-4 mb-6">
                <nav className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    <Link to="/" className="hover:text-[#2b4736] transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#d9534f]">Sale & Angebote</span>
                </nav>
            </div>

            <div className="max-w-[1320px] mx-auto px-4 pb-12">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        <span>{filteredProducts.length} Artikel im Sale</span>
                    </div>

                    <div className="relative">
                        <select
                            value={sortValue}
                            onChange={(e) => setSortValue(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-md text-sm font-medium focus:outline-none focus:border-[#2b4736] focus:ring-1 focus:ring-[#2b4736] cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <option value="default">Sortierung: Standard</option>
                            <option value="discount-desc">Rabatt: Höchster zuerst</option>
                            <option value="price-asc">Preis: Aufsteigend</option>
                            <option value="price-desc">Preis: Absteigend</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {loading ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="aspect-[3/4] bg-gray-100 animate-pulse rounded-lg"></div>
                                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))
                    ) : visibleProducts.length > 0 ? (
                        visibleProducts.map(product => {
                            if (!product || !product.id) return null;
                            return <ProductCard key={product.id} product={product} />;
                        })
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Keine Sale-Artikel verfügbar</h3>
                            <p className="text-gray-500 mb-6">Aktuell haben wir keine Produkte mit mindestens 20% Rabatt.</p>
                            <Link to="/shop" className="inline-flex items-center text-[#2b4736] font-bold hover:underline">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Zum Shop
                            </Link>
                        </div>
                    )}
                </div>

                {/* Load More Button */}
                {!loading && hasMore && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="inline-flex items-center justify-center px-8 py-3 bg-[#d9534f] text-white font-bold rounded-full min-w-[200px] gap-2 hover:bg-[#c9302c] transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Lädt...</span>
                                </>
                            ) : (
                                "Mehr anzeigen"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalePage;
