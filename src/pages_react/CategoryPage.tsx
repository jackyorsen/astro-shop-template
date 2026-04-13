
import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductsFromSheets } from '../hooks/useSheetsApi';
import { ProductCard } from '../components/ProductCard';
import { getSlug } from '../utils/categoryHelper';
import { ChevronDown, SlidersHorizontal, ArrowLeft, Loader2 } from 'lucide-react';
import { filterShopProducts } from '../utils/productFilters';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products, loading } = useProductsFromSheets();
  const [sortValue, setSortValue] = useState('default');
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter products based on the slug
  const { filteredProducts, categoryName } = useMemo(() => {
    if (!products || !slug) return { filteredProducts: [], categoryName: '' };

    // Filter to only show Songmics products (exclude Galaxus)
    const shopProducts = filterShopProducts(products);

    // Find the actual category name based on the slug (reverse lookup)
    const matchingProduct = shopProducts.find(p => getSlug(p.category) === slug);
    const foundCategoryName = matchingProduct ? matchingProduct.category : '';

    const filtered = shopProducts.filter(p => getSlug(p.category) === slug);

    // Sorting Logic
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      // 1. OOS always last
      const isOOS = (p: any) => p.isOutOfStock || Number(p.stock) <= 0;
      const aOOS = isOOS(a) ? 1 : 0;
      const bOOS = isOOS(b) ? 1 : 0;
      if (aOOS !== bOOS) return aOOS - bOOS;

      // 2. User selected sort
      switch (sortValue) {
        case 'price-asc': {
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
        default:
          return 0;
      }
    });

    return { filteredProducts: sorted, categoryName: foundCategoryName };
  }, [products, slug, sortValue]);

  if (loading) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 py-12">
        <div className="h-8 w-64 bg-gray-100 animate-pulse rounded mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Handle case where category is not found or empty
  if (!loading && filteredProducts.length === 0) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategorie nicht gefunden</h1>
        <p className="text-gray-500 mb-8">Leider konnten wir keine Produkte unter dieser Kategorie finden.</p>
        <Link to="/shop" className="inline-flex items-center text-[#2b4736] font-bold hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Zurück zum Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Banner Area */}
      <div className="bg-[#f4f6f5] py-12 mb-8 border-b border-gray-100">
        <div className="max-w-[1320px] mx-auto px-4 text-center">
          <span className="text-xs font-bold text-[#2b4736] uppercase tracking-[0.2em] mb-3 block">Kategorie</span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#333] mb-4">{categoryName || 'Produkte'}</h1>
          <nav className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            <Link to="/" className="hover:text-[#2b4736] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-[#2b4736] transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-[#2b4736]">{categoryName}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-4 pb-12">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center text-sm font-medium text-gray-500">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <span>{filteredProducts.length} Artikel</span>
          </div>

          <div className="relative">
            <select
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-md text-sm font-medium focus:outline-none focus:border-[#2b4736] focus:ring-1 focus:ring-[#2b4736] cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="default">Sortierung: Standard</option>
              <option value="price-asc">Preis: Aufsteigend</option>
              <option value="price-desc">Preis: Absteigend</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filteredProducts.slice(0, visibleCount).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More Button */}
        {!loading && (visibleCount < filteredProducts.length) && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => {
                setIsLoadingMore(true);
                setTimeout(() => {
                  setVisibleCount(prev => prev + 12);
                  setIsLoadingMore(false);
                }, 600);
              }}
              disabled={isLoadingMore}
              className="inline-flex items-center justify-center px-8 py-3 bg-[#1f3a34] text-white rounded-full font-medium min-w-[200px] gap-2 hover:bg-[#2d5449] transition-all duration-300 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
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

export default CategoryPage;
