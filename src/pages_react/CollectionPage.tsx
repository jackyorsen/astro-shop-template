import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductsFromSheets } from '../hooks/useSheetsApi';
import { ProductCard } from '../components/ProductCard';
import { ChevronDown, SlidersHorizontal, ArrowLeft, Loader2 } from 'lucide-react';
import { filterShopProducts } from '../utils/productFilters';
import { getSlug } from '../utils/categoryHelper';

interface CollectionPageProps {
    type: 'work' | 'beauty' | 'sale' | 'bestseller';
}

const SEO_CONTENT = {
    work: {
        title: "Moderne Home Office Möbel für produktives Arbeiten",
        description: "Entdecken Sie unsere hochwertigen Büromöbel für Ihr Home Office. Von ergonomischen Bürostühlen bis hin zu höhenverstellbaren Schreibtischen – schaffen Sie eine Arbeitsatmosphäre, die Produktivität und Wohlbefinden vereint.",
        subcategories: [
            { name: 'Aktenschränke', slug: 'aktenschraenke' },
            { name: 'Bürostühle', slug: 'buerostuehle' },
            { name: 'Computertische', slug: 'computertische' },
            { name: 'Höhenverstellbare Schreibtische', slug: 'hoehenverstellbare-schreibtische' },
            { name: 'Arbeitshocker', slug: 'arbeitshocker' }
        ]
    },
    beauty: {
        title: "Stilvolle Beauty Möbel für dein persönliches Zuhause",
        description: "Verwandeln Sie Ihr Zuhause in eine Wohlfühloase mit unseren eleganten Beauty-Möbeln. Finden Sie den perfekten Schminktisch, praktische Schmuckschränke und stilvolle Aufbewahrungslösungen für Ihre Schätze.",
        subcategories: [
            { name: 'Schmuckschränke', slug: 'schmuckschraenke' },
            { name: 'Schminktische', slug: 'schminktische' },
            { name: 'Kleiderschränke', slug: 'kleiderschraenke' },
            { name: 'Schuhaufbewahrung', slug: 'schuhaufbewahrung' }
        ]
    },
    sale: {
        title: "Aktuelle Angebote & Reduzierte Möbel",
        description: "Sichern Sie sich unsere besten Angebote. Hochwertige Möbel zu reduzierten Preisen – nur solange der Vorrat reicht.",
        subcategories: []
    },
    bestseller: {
        title: "Unsere Bestseller – Beliebte Kundenfavoriten",
        description: "Entdecken Sie die beliebtesten Möbelstücke unserer Kunden. Diese Highlights überzeugen durch Design, Qualität und Funktionalität.",
        subcategories: []
    }
};

export const CollectionPage: React.FC<CollectionPageProps> = ({ type }) => {
    const { subcategory } = useParams<{ subcategory: string }>();
    const { products, loading: apiLoading, error } = useProductsFromSheets();
    const [sortValue, setSortValue] = useState('default');
    const [displayCount, setDisplayCount] = useState(12);
    const [loadingMore, setLoadingMore] = useState(false);

    const content = SEO_CONTENT[type];

    const filteredProducts = useMemo(() => {
        if (!products) return [];

        // 1. Basic Filter: Shop Status & Stock (handled partly by hook default but ensuring here)
        let filtered = filterShopProducts(products);

        // 2. Type Filter
        if (type === 'work') {
            filtered = filtered.filter(p => p.world === 'work');
        } else if (type === 'beauty') {
            filtered = filtered.filter(p => p.world === 'beauty');
        } else if (type === 'sale') {
            // Sale logic: price < pricePrev OR specifically marked
            filtered = filtered.filter(p => {
                const price = p.price;
                const prev = p.pricePrev;
                return (prev && price < prev);
            });
        } else if (type === 'bestseller') {
            // Bestseller logic: displayScore > threshold or just sort? 
            // For now, let's take top 50 by displayScore
            filtered = [...filtered].sort((a, b) => (b.displayScore || 0) - (a.displayScore || 0));
        }

        // 3. Subcategory Filter
        if (subcategory) {
            // Create a flexible matcher because slug might not match category name exactly
            // We'll use a simple inclusion check or exact slug match if we had slugs on categories
            const normalizedSub = subcategory.replace(/-/g, ' ').toLowerCase();

            filtered = filtered.filter(p => {
                const cat = p.category.toLowerCase();
                // Special mapping for slugs to keywords
                if (subcategory === 'aktenschraenke') return cat.includes('akten') || cat.includes('container');
                if (subcategory === 'buerostuehle') return cat.includes('chef') || cat.includes('sessel') || cat.includes('netz') || cat.includes('dreh') || cat.includes('gaming');
                if (subcategory === 'computertische') return cat.includes('computer');
                if (subcategory === 'hoehenverstellbare-schreibtische') return cat.includes('höhen') || cat.includes('schreibtisch');
                if (subcategory === 'arbeitshocker') return cat.includes('hocker');

                if (subcategory === 'schmuckschraenke') return cat.includes('schmuck');
                if (subcategory === 'schminktische') return cat.includes('schmink');
                if (subcategory === 'kleiderschraenke') return cat.includes('kleider');
                if (subcategory === 'schuhaufbewahrung') return cat.includes('schuh') && !cat.includes('bank');

                return cat.includes(normalizedSub);
            });
        }

        // 4. Sorting
        filtered.sort((a, b) => {
            switch (sortValue) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                default: return type === 'bestseller' ? (b.displayScore || 0) - (a.displayScore || 0) : 0;
            }
        });

        return filtered;
    }, [products, type, subcategory, sortValue]);

    // Load More Handler
    const handleLoadMore = () => {
        setLoadingMore(true);
        setTimeout(() => {
            setDisplayCount(prev => prev + 12);
            setLoadingMore(false);
        }, 300);
    };




    // Active Subcategory Name for Display
    const currentSubcategoryName = content.subcategories?.find(s => s.slug === subcategory)?.name;

    // Background Gradient Logic
    const getBackgroundClass = () => {
        if (type === 'work') return 'bg-[#F9FAFB]';
        if (type === 'beauty') return 'bg-[#FAF7F4]';
        if (type === 'sale') return 'bg-red-50/30';
        return 'bg-gray-50';
    };

    return (
        <div className="w-full min-h-screen pb-20">

            {/* 1. COMPACT HEADER SECTION */}
            <div className={`${getBackgroundClass()} border-b border-gray-100/50`}>
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-12 pb-8 text-center">
                    {/* Breadcrumbs - Subtler */}
                    <nav className="flex justify-center items-center flex-wrap text-[10px] font-medium uppercase tracking-wide text-[#8C8C8C] mb-4 gap-y-1">
                        <Link to="/" className="hover:text-[#2b4736] transition-colors">Home</Link>
                        <span className="mx-1 text-gray-300">/</span>
                        <Link to={`/${type}`} className={`transition-colors ${!subcategory ? 'text-[#2b4736]' : 'hover:text-[#2b4736]'}`}>
                            {type === 'work' ? 'Büro & Office' : type === 'beauty' ? 'Wohnen & Style' : type}
                        </Link>
                        {subcategory && (
                            <>
                                <span className="mx-1 text-gray-300">/</span>
                                <span className="text-[#2b4736]">{currentSubcategoryName}</span>
                            </>
                        )}
                    </nav>

                    <h1 className="text-2xl md:text-3xl font-semibold text-[#1F3A33] mb-3 tracking-tight leading-tight max-w-3xl mx-auto">
                        {subcategory ? currentSubcategoryName : content.title}
                    </h1>

                    <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-6">
                        {content.description}
                    </p>

                    {/* Filter Chips - REMOVED from Header to ensure stability in sticky bar below */}
                </div>
            </div>

            {/* 2. STABLE CATEGORY NAV - ALWAYS VISIBLE (Fixed Height 48px) */}
            <div className="border-b border-gray-100 bg-white shadow-sm h-[48px] flex items-center">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 w-full overflow-x-auto no-scrollbar">
                    <div className="flex items-center justify-start md:justify-center gap-2 min-w-max">
                        {/* "Alle" Chip - Always First */}
                        <Link
                            to={`/${type}`}
                            className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium border transition-all whitespace-nowrap ${!subcategory
                                ? 'bg-[#2b4736] text-white border-[#2b4736]'
                                : 'bg-white text-gray-600 border-[#E5E5E5] hover:bg-[#F3F3F3] hover:border-[#CFCFCF]'
                                }`}
                        >
                            Alle
                        </Link>

                        {/* Subcategory Chips - Stable Order */}
                        {content.subcategories && content.subcategories.map(sub => (
                            <Link
                                key={sub.slug}
                                to={`/${type}/${sub.slug}`}
                                className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium border transition-all whitespace-nowrap ${subcategory === sub.slug
                                    ? 'bg-[#2b4736] text-white border-[#2b4736]'
                                    : 'bg-white text-gray-600 border-[#E5E5E5] hover:bg-[#F3F3F3] hover:border-[#CFCFCF]'
                                    }`}
                            >
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>


            {/* 3. MAIN CONTENT AREA - GRID STARTS EARLY */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">

                {/* Toolbar - Compact */}
                <div className="flex flex-row justify-between items-center gap-4 mb-6 border-b border-gray-50 pb-4">
                    <p className="text-gray-400 text-xs md:text-sm font-medium">
                        <span className="text-[#1F3A33] font-bold">{filteredProducts.length}</span> Artikel
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <select
                                value={sortValue}
                                onChange={(e) => setSortValue(e.target.value)}
                                className="appearance-none bg-transparent hover:bg-gray-50 pl-2 pr-8 py-1 rounded text-xs md:text-sm font-medium text-gray-600 focus:outline-none cursor-pointer transition-colors"
                            >
                                <option value="default">Sortierung: Empfohlen</option>
                                <option value="price-asc">Preis: Aufsteigend</option>
                                <option value="price-desc">Preis: Absteigend</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {apiLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-[400px] bg-gray-50 animate-pulse rounded-lg"></div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                            {filteredProducts.slice(0, displayCount).map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Load More */}
                        {displayCount < filteredProducts.length && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="px-8 py-3 bg-[#1f3a34] text-white rounded-full text-sm font-bold hover:bg-[#2d5449] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 flex items-center gap-2 transform active:scale-95"
                                >
                                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {loadingMore ? 'Lade...' : 'Mehr Produkte'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Keine Produkte gefunden</h3>
                        <p className="text-gray-500 mb-6 text-sm">In dieser Kategorie sind aktuell keine Artikel verfügbar.</p>
                        <Link to="/shop" className="text-[#2b4736] font-bold text-sm hover:underline">
                            Alle Produkte ansehen
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionPage;
