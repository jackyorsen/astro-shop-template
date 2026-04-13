
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ChevronDown, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useProductsFromSheets } from '../hooks/useSheetsApi';
import { filterShopProducts } from '../utils/productFilters';
import { ProductSkeleton } from '../components/ProductSkeleton';

export const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const [sortValue, setSortValue] = useState('default');
  const calculateStartPage = () => 12;
  const [pageSize, setPageSize] = useState(12);
  const [displayCount, setDisplayCount] = useState(12);

  // Use global hook - fetches once, then uses cache
  const { products, loading: apiLoading, error } = useProductsFromSheets();

  const [loadingMore, setLoadingMore] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  // Effect to handle initial load simulation
  React.useEffect(() => {
    if (!apiLoading) {
      setLocalLoading(false);
    }
  }, [apiLoading]);

  const loading = apiLoading || localLoading;
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // 1. Search filtering (out-of-stock products already filtered in hook)
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    // CRITICAL: Only show Songmics products in public shop (filter out Galaxus)
    const shopProducts = filterShopProducts(products);

    // Apply search filter if exists
    if (!searchQuery.trim()) return shopProducts;

    const lowerTerm = searchQuery.toLowerCase().trim();

    return shopProducts
      .filter(p => {
        const titleMatch = p.title.toLowerCase().includes(lowerTerm);
        const categoryMatch = p.category.toLowerCase().includes(lowerTerm);
        const skuMatch = p.sku?.toLowerCase().includes(lowerTerm);
        const descriptionMatch = p.description?.toLowerCase().includes(lowerTerm);
        return titleMatch || categoryMatch || skuMatch || descriptionMatch;
      })
      .sort((a, b) => {
        // Priority for search relevance if searching
        const aExactSku = a.sku?.toLowerCase() === lowerTerm;
        const bExactSku = b.sku?.toLowerCase() === lowerTerm;
        if (aExactSku && !bExactSku) return -1;
        if (!aExactSku && bExactSku) return 1;

        const aTitlePrefix = a.title.toLowerCase().startsWith(lowerTerm);
        const bTitlePrefix = b.title.toLowerCase().startsWith(lowerTerm);
        if (aTitlePrefix && !bTitlePrefix) return -1;
        if (!aTitlePrefix && bTitlePrefix) return 1;

        return 0;
      });
  }, [products, searchQuery]);

  // 2. Client-side sorting (OOS products already filtered out)
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    sorted.sort((a, b) => {
      // User selected sort
      switch (sortValue) {
        case 'price-asc': {
          // Domain-based price for sorting
          const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');
          const getPriceForSort = (p: any) => {
            const price = isCH ? (p as any).price_ch ?? p.price : p.price;
            const pricePrev = isCH ? (p as any).pricePrev_ch ?? (p as any).pricePrev : (p as any).pricePrev;
            return (pricePrev && pricePrev < price) ? pricePrev : price;
          };
          return getPriceForSort(a) - getPriceForSort(b);
        }
        case 'price-desc': {
          const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');
          const getPriceForSort = (p: any) => {
            const price = isCH ? (p as any).price_ch ?? p.price : p.price;
            const pricePrev = isCH ? (p as any).pricePrev_ch ?? (p as any).pricePrev : (p as any).pricePrev;
            return (pricePrev && pricePrev < price) ? pricePrev : price;
          };
          return getPriceForSort(b) - getPriceForSort(a);
        }
        case 'default':
        default:
          return 0;
      }
    });

    return sorted;
  }, [filteredProducts, sortValue]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 w-full min-h-screen">

      {/* Header Banner Area - Unified Style */}
      <div className="bg-[#f4f6f5] py-12 mb-8 border-b border-gray-100 -mx-4 md:-mx-8 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto text-center">
          <span className="text-xs font-bold text-[#2b4736] uppercase tracking-[0.2em] mb-3 block">Kollektion</span>
          <h1 className="text-3xl md:text-5xl font-bold text-[#1f3a34] mb-4 tracking-tight">Shop</h1>
          <nav className="text-xs text-gray-500 font-medium uppercase tracking-wide flex justify-center items-center">
            <Link to="/" className="hover:text-[#2b4736] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[#2b4736]">Alle Produkte</span>
          </nav>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <p className="text-gray-500 text-sm font-medium">
          {loading ? 'Produkte werden geladen...' : `${sortedProducts.length} Ergebnisse ${searchQuery ? `für "${searchQuery}"` : ''}`}
        </p>

        {/* Filter / Sort Controls */}
        <div className="flex items-center gap-4">
          {/* ... existing controls ... */}
          <div className="relative group">
            <select
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              className="appearance-none bg-transparent hover:bg-gray-50 border border-gray-300 text-[#333] py-2.5 pl-4 pr-10 rounded-[4px] text-sm font-medium focus:outline-none focus:border-[#1f3a34] focus:ring-1 focus:ring-[#1f3a34] cursor-pointer transition-colors min-w-[180px]"
              disabled={loading}
            >
              <option value="default">Empfohlen</option>
              <option value="price-asc">Preis: Aufsteigend</option>
              <option value="price-desc">Preis: Absteigend</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button className="hidden md:flex items-center gap-2 border border-gray-300 py-2.5 px-4 rounded-[4px] text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors text-[#333]">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Loading State - Skeleton Screens */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-6 md:gap-y-12">
          <ProductSkeleton count={12} />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-20 bg-gray-50 rounded-lg animate-in fade-in duration-300">
          <p className="font-bold text-red-500">Es gab ein Problem beim Laden der Produkte.</p>
          <p className="text-sm mt-2 text-gray-500">{error.message}</p>
        </div>
      )}

      {/* Product Grid - 4 Columns on Desktop with fade-in */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-6 md:gap-y-12 animate-in fade-in duration-500">
            {sortedProducts.slice(0, displayCount).map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {displayCount < sortedProducts.length && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => {
                  setLoadingMore(true);
                  setTimeout(() => {
                    setDisplayCount(prev => prev + 12);
                    setLoadingMore(false);
                  }, 600);
                }}
                disabled={loadingMore}
                className="px-8 py-3 bg-[#1f3a34] text-white rounded-full font-medium min-w-[200px] flex items-center justify-center gap-2 hover:bg-[#2d5449] transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
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
        </>
      )}

      {!loading && !error && sortedProducts.length === 0 && (
        <div className="text-center py-32">
          <p className="text-gray-400 font-medium text-lg">Keine Produkte gefunden.</p>
          <button
            onClick={() => {
              setSortValue('default');
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('q');
              navigate('/shop');
            }}
            className="mt-4 text-[#1f3a34] underline font-medium hover:text-black"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
