import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductsFromSheets } from '../hooks/useSheetsApi';
import { ProductCard } from '../components/ProductCard';
import { getSlug } from '../utils/categoryHelper';
import { ChevronDown, SlidersHorizontal, ArrowLeft, Loader2 } from 'lucide-react';

// Inline Definition to avoid import issues
const filterShopProductsInline = (products: any[]) => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => p && p.source === 'songmics');
};

// Room configuration with images and descriptions
const ROOM_CONFIG: Record<string, { name: string; image: string; description: string; keywords: string[] }> = {
    'wohnzimmer': {
        name: 'Wohnzimmer',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000',
        description: 'Das Wohnzimmer ist der Mittelpunkt in Ihrem Zuhause. Ob gemütliche Sofas oder stilvolle Regale.',
        keywords: ['wohnzimmer', 'wohn', 'sideboard', 'kommode', 'regal', 'tv', 'fernseh', 'konsolentisch', 'vitrine', 'couch', 'sofa', 'sessel', 'couchtisch', 'beistelltisch']
    },
    'kueche-esszimmer': {
        name: 'Küche & Esszimmer',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2000',
        description: 'Die Küche ist das Herz des Hauses. Finden Sie Tische, Stühle und praktische Helfer.',
        keywords: ['küche', 'haushalt', 'küchenregal', 'servierwagen', 'vorrat', 'müll', 'abfall', 'nische', 'wagen', 'esszimmer', 'esstisch']
    },
    'badezimmer': {
        name: 'Badezimmer',
        image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=2000',
        description: 'Verwandeln Sie Ihr Bad in eine Wellness-Oase mit passenden Schränken und Regalen.',
        keywords: ['bad', 'badezimmer', 'hochschrank', 'unterschrank', 'spiegelschrank', 'waschbecken', 'handtuch']
    },
    'schlafzimmer': {
        name: 'Schlafzimmer',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2000',
        description: 'Ruhe und Entspannung. Entdecken Sie Möbel für Ihr perfektes Schlafzimmer.',
        keywords: ['schlafzimmer', 'nacht', 'nachttisch', 'schminktisch', 'kleiderschrank', 'bett', 'matratze']
    },
    'home-office': {
        name: 'Home Office',
        image: '/images/rooms/homeoffice.jpg',
        description: 'Produktiv arbeiten mit ergonomischen Stühlen und geräumigen Schreibtischen.',
        keywords: ['büro', 'office', 'schreibtisch', 'computer', 'akten', 'rollcontainer', 'arbeitsplatz', 'drehstuhl', 'stuhl', 'homeoffice']
    },
    'eingangsbereich': {
        name: 'Eingangsbereich',
        image: '/images/rooms/eingangsbereich.jpg',
        description: 'Ein einladender Flur mit Garderoben, Schuhschränken und Sitzbänken.',
        keywords: ['eingang', 'flur', 'diele', 'garderobe', 'schuhschrank', 'schuh', 'bank', 'sitzbank']
    },
    'waschkueche': {
        name: 'Waschküche',
        image: '/images/rooms/waschkueche.jpg',
        description: 'Ordnung im Hauswirtschaftsraum mit praktischen Schränken und Regalen.',
        keywords: ['wasch', 'wäsche', 'bad', 'hochschrank']
    },
    'garage': {
        name: 'Garage',
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=2000',
        description: 'Robuste Regale und Ordnungssysteme für Garage und Werkstatt.',
        keywords: ['schwerlast', 'regal', 'garage', 'keller', 'werkstatt']
    },
    'outdoor-garten': {
        name: 'Outdoor & Garten',
        image: '/images/rooms/outdoor-garten.jpg',
        description: 'Genießen Sie die Zeit im Freien mit unseren Gartenmöbeln.',
        keywords: ['garten', 'outdoor', 'balkon', 'terrasse', 'lounge', 'polyrattan', 'sonnenliege', 'markise']
    },
    'kinderzimmer': {
        name: 'Kinderzimmer',
        image: '/images/rooms/kinderzimmer.jpg',
        description: 'Bunt, sicher und praktisch – Möbel für kleine Entdecker.',
        keywords: ['kinder', 'spielzeug', 'regal', 'aufbewahrung', 'box']
    }
};

export const RoomPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    // Robust data fetching check
    const sheetsData = useProductsFromSheets();
    const products = sheetsData?.products || [];
    const loading = sheetsData?.loading || false;

    const [sortValue, setSortValue] = useState('default');
    const [visibleCount, setVisibleCount] = useState(12);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const roomConfig = slug ? ROOM_CONFIG[slug] : null;

    // Safe filtering logic
    const { filteredProducts, subcategories } = useMemo(() => {
        if (!roomConfig) {
            return { filteredProducts: [], subcategories: [] };
        }

        if (!Array.isArray(products) || products.length === 0) {
            return { filteredProducts: [], subcategories: [] };
        }

        // Inline filter to ensure no import errors
        const shopProducts = filterShopProductsInline(products);

        const keywords = roomConfig.keywords || [];
        const filtered = shopProducts.filter(p => {
            if (!p || !p.category) return false;
            const categoryLower = p.category.toLowerCase();
            return keywords.some(keyword => categoryLower.includes(keyword));
        });

        // Extract unique subcategories
        const uniqueCategories = Array.from(new Set(filtered.map(p => p.category))).sort();

        // Sorting Logic
        const sorted = [...filtered];
        sorted.sort((a, b) => {
            const isOOS = (p: any) => p.isOutOfStock || Number(p.stock) <= 0;
            const aOOS = isOOS(a) ? 1 : 0;
            const bOOS = isOOS(b) ? 1 : 0;
            if (aOOS !== bOOS) return aOOS - bOOS;

            switch (sortValue) {
                case 'price-asc':
                    return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
                case 'price-desc':
                    return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
                default:
                    return 0;
            }
        });

        return { filteredProducts: sorted, subcategories: uniqueCategories };
    }, [products, roomConfig, sortValue]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProducts.length;

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleCount(prev => prev + 12);
            setIsLoadingMore(false);
        }, 600);
    };

    if (!roomConfig) {
        return (
            <div className="max-w-[1320px] mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Raum nicht gefunden</h1>
                <Link to="/shop" className="inline-flex items-center text-[#2b4736] font-bold hover:underline">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Zurück zum Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Hero */}
            <div className="relative h-[300px] md:h-[400px] w-full mb-8">
                <img
                    src={roomConfig.image}
                    alt={roomConfig.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                        {roomConfig.name}
                    </h1>
                    <p className="text-white/90 max-w-2xl text-sm md:text-base leading-relaxed drop-shadow-md hidden md:block">
                        {roomConfig.description}
                    </p>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="max-w-[1320px] mx-auto px-4 mb-6">
                <nav className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    <Link to="/" className="hover:text-[#2b4736] transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-400">Räume</span>
                    <span className="mx-2">/</span>
                    <span className="text-[#2b4736]">{roomConfig.name}</span>
                </nav>
            </div>

            <div className="max-w-[1320px] mx-auto px-4 pb-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
                                Kategorien
                            </h3>
                            <ul className="space-y-2">
                                {subcategories.length > 0 ? (
                                    subcategories.map((category, index) => (
                                        <li key={index}>
                                            <Link
                                                to={`/kategorie/${getSlug(category)}`}
                                                className="text-sm text-gray-600 hover:text-[#2b4736] transition-colors block py-1"
                                            >
                                                {category}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-gray-400 italic">Keine Unterkategorien</li>
                                )}
                            </ul>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1">
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

                        {/* Loading / Products */}
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="flex flex-col gap-3">
                                        <div className="aspect-[3/4] bg-gray-100 animate-pulse rounded-lg"></div>
                                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {visibleProducts.length > 0 ? (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
                                        {visibleProducts.map(product => {
                                            if (!product || !product.id) return null;
                                            return <ProductCard key={product.id} product={product} />;
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">Keine Produkte in dieser Kategorie gefunden.</p>
                                    </div>
                                )}

                                {hasMore && (
                                    <div className="mt-12 text-center">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoadingMore}
                                            className="inline-flex items-center justify-center px-8 py-3 bg-[#2b4736] text-white font-bold rounded-full min-w-[200px] gap-2 hover:bg-[#233a2d] transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RoomPage;
