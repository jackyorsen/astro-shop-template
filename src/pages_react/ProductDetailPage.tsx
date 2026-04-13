
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firestore";
import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    Star,
    Truck,
    ShieldCheck,
    Headset,
    Minus,
    Plus,
    Bell,
    Check,
    ThumbsUp,
    ThumbsDown,
    X,
    Undo2,
    Gift,
    Sparkles,
    Heart,
    ShoppingCart,
    CreditCard
} from "lucide-react";
import { useProductFromSheets, useProductBySlug } from "../hooks/useSheetsApi";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { OptimizedImage } from "../components/OptimizedImage";
import { CouponBox, Coupon } from "../components/CouponBox";
import { ProductCard } from "../components/ProductCard";
import { NewsletterSection } from "../components/NewsletterSection";
import { ReviewsSection } from "../components/ReviewsSection";
import { StarRating } from "../components/StarRating";
import { productReviews } from "../data/productsReviews";
import { Button } from "../components/Button";
import { ProductSchema } from "../components/ProductSchema";
import { RelatedProducts } from "../components/RelatedProducts";
import { formatPrice, convertPrice, getCurrency } from "../utils/currency";
import { trackEvent } from "../analytics/analytics";
import { trackShopEvent } from "../utils/shopEvents";

type RouteParams = {
    sku?: string;
    world?: string;
    subcategory?: string;
    slug?: string;
};

// --- CONSTANTS ---
const PRIMARY_GREEN = "#2b4736";
const MAMORU_GREEN = "#0E4F34"; // Requested specific green
const MAMORU_ORANGE = "#E87E24"; // Requested specific orange
const COLOR_GREEN = "#00C18A";
const COLOR_YELLOW = "#FFD85A";
const COLOR_ORANGE = "#FB8C00";
const COLOR_RED = "#D24A43";
const COLOR_NUMBER = "#00AE8A";

// formatPrice removed, imported from utils

// Linear Interpolation & Easing
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;
const interpolateColor = (color1: string, color2: string, factor: number) => {
    const f = Math.max(0, Math.min(1, factor));
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    const r = Math.round(lerp(r1, r2, f));
    const g = Math.round(lerp(g1, g2, f));
    const b = Math.round(lerp(b1, b2, f));
    return "#" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
};

function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;
    function sampleCurveX(t: number) { return ((ax * t + bx) * t + cx) * t; }
    function sampleCurveY(t: number) { return ((ay * t + by) * t + cy) * t; }
    function solveCurveX(x: number) {
        let t2 = x;
        for (let i = 8; i < 8; i++) {
            const x2 = sampleCurveX(t2) - x;
            if (Math.abs(x2) < 1e-6) return t2;
            const d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
            if (Math.abs(d2) < 1e-6) break;
            t2 = t2 - x2 / d2;
        }
        return t2;
    }
    return function (x: number) {
        if (x <= 0) return 0;
        if (x >= 1) return 1;
        return sampleCurveY(solveCurveX(x));
    };
}
const easeDrain = cubicBezier(0.15, 0.85, 0.35, 1.00);

// MOCK_REVIEWS removed
const MOCK_REVIEWS: any[] = [];

export const ProductDetailPage: React.FC = () => {
    const { sku, world, subcategory, slug } = useParams<RouteParams>();
    const navigate = useNavigate();

    // 🚀 NEW ROUTING LOGIC:
    // 1. If accessed via /product/:sku, use sku.
    // 2. If accessed via /:world/:subcategory/:slug, use slug.
    const identifier = slug || sku;
    const { product: fetchedProductRaw, loading: productLoading } = useProductBySlug(identifier);

    // Inject Reviews from productsReviews.ts if available
    const fetchedProduct = useMemo(() => {
        if (!fetchedProductRaw) return null;
        const lookupId = fetchedProductRaw.sku; // Always join reviews by SKU
        if (lookupId && productReviews[lookupId]) {
            return { ...fetchedProductRaw, reviews: productReviews[lookupId] };
        }
        return fetchedProductRaw;
    }, [fetchedProductRaw]);

    // RECOMMENDATIONS are now handled by RelatedProducts component internally
    // const { products: allProducts, loading: allProductsLoading } = useProductsFromSheets();

    const { addToCart } = useCart();

    // 🔥 ATOMIC VIEW STATE: No separate loading/product - only one atomic state
    type ProductViewState =
        | { status: 'loading' }
        | { status: 'not_found' }
        | { status: 'ready'; product: Product };

    const viewState: ProductViewState = useMemo(() => {
        if (productLoading) {
            return { status: 'loading' };
        }

        if (!fetchedProduct) {
            return { status: 'not_found' };
        }

        return { status: 'ready', product: fetchedProduct };
    }, [productLoading, fetchedProduct]);

    // 🚀 CANONICAL REDIRECT LOGIC
    useEffect(() => {
        if (viewState.status === 'ready' && viewState.product) {
            const p = viewState.product;

            // Validate Data Integrity - If world/subcategory missing, we can't form a valid URL
            // In strict mode, we might want to show error, but for now let's just ensure we have data.
            // If data is missing in Sheet, it will be undefined.

            if (p.world && p.subcategory && p.slug) {
                const canonicalPath = `/${p.world}/${p.subcategory}/${p.slug}`;
                const currentPath = window.location.pathname;

                // Decode paths to handle special chars safe comparison
                if (decodeURIComponent(currentPath) !== decodeURIComponent(canonicalPath)) {
                    console.log(`🔀 Redirecting to canonical: ${canonicalPath}`);
                    navigate(canonicalPath, { replace: true });
                }
            }
        }
    }, [viewState, navigate]);


    // Reviews disabled
    // const { reviews: amazonReviews, stats: amazonStats, hasReviews } = useAmazonReviews(sku || "");
    const amazonReviews: any[] = [];
    const amazonStats = null;
    const hasReviews = false;

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'qa' | 'shipping'>('description');

    // Dynamic Shop Settings & Coupons
    const [shopSettings, setShopSettings] = useState<any>({
        showProductBanner: true,
        productBannerText: 'VDAY SALE – Nur für Mitglieder: Exklusiver Bestpreis!',
        showCouponBox: true,
        maxCouponsInBox: 2,
        couponBoxFooterText: 'Code im Warenkorb oder an der Kasse einfügen.'
    });
    const [dynamicCoupons, setDynamicCoupons] = useState<any[]>([]);

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    // Touch/Swipe State
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isSwipeTransitioning, setIsSwipeTransitioning] = useState(false);

    // Track view_item event when product is ready
    useEffect(() => {
        if (viewState.status === 'ready' && viewState.product) {
            const product = viewState.product;
            const currency = getCurrency();
            // Calculate correct price based on domain/currency logic which is simpler here
            const displayPrice = product.salePrice || product.price;

            trackEvent('view_item', {
                currency: currency,
                value: displayPrice,
                items: [{
                    item_id: product.sku,
                    item_name: product.title,
                    price: displayPrice
                }]
            });

            // SHOP EVENTS: Track Score & View (v1 Score System)
            import('../utils/shopEvents').then(({ trackShopEvent }) => {
                trackShopEvent({
                    event: 'view_item',
                    productId: product.sku || product.id,
                    productName: product.title,
                    price: displayPrice
                });
            });
        }
    }, [viewState.status, identifier]); // Only re-run if ID or status changes


    // Review Modal State removed
    // const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    // const [reviewForm, setReviewForm] = useState({ rating: 0, name: '', email: '', content: '' });
    // const [hoverRating, setHoverRating] = useState(0);

    // Stock Animation
    const [barWidth, setBarWidth] = useState(100);
    const [barColor, setBarColor] = useState(COLOR_GREEN);
    const requestRef = useRef<number | undefined>(undefined);
    const startTimeRef = useRef<number | undefined>(undefined);

    // Thumbnail Scroll Ref
    const thumbsRef = useRef<HTMLDivElement>(null);

    // Recommendations Scroll Ref
    const recommendationsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [identifier]);

    // Load Shop Settings & Visible Coupons
    useEffect(() => {
        const loadShopSettings = async () => {
            try {
                if (!db) return;
                const settingsRef = doc(db, 'coupons', '_settings');
                const settingsSnap = await getDoc(settingsRef);
                if (settingsSnap.exists()) {
                    console.log('✅ Shop Settings loaded:', settingsSnap.data());
                    setShopSettings(settingsSnap.data());
                } else {
                    console.log('ℹ️ No Shop Settings found in DB, using defaults');
                }
            } catch (error) {
                console.error('Error loading shop settings:', error);
            }
        };

        const loadVisibleCoupons = async () => {
            try {
                if (!db) return;
                const couponsRef = collection(db, 'coupons');
                // Fetch all and filter client-side to avoid index requirements
                const querySnapshot = await getDocs(couponsRef);
                const fetched: any[] = [];
                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const isVisible = (data.showInProductPage === true || data.showInProductPage === 'true') && (data.active !== false);
                    console.log(`🎫 Coupon ${docSnap.id}: visible=${isVisible}, showProp=${data.showInProductPage} (${typeof data.showInProductPage}), activeProp=${data.active}`);

                    if (isVisible) {
                        fetched.push({
                            id: docSnap.id,
                            ...data,
                            discount: data.discount,
                            code: data.code,
                            description: data.description
                        });
                    }
                });
                console.log('✅ Found visible coupons:', fetched.length);
                setDynamicCoupons(fetched);
            } catch (error) {
                console.error('Error loading dynamic coupons:', error);
            }
        };

        loadShopSettings();
        loadVisibleCoupons();
    }, []);

    // Lock body scroll for lightbox
    useEffect(() => {
        if (isLightboxOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isLightboxOpen]);

    useEffect(() => { setIsZoomed(false); }, [activeImageIndex]);

    // Stock Animation Logic - only for ready state
    useEffect(() => {
        if (viewState.status !== 'ready') return;

        const product = viewState.product;
        setBarWidth(100);
        setBarColor(COLOR_GREEN);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        const stock = product.stock ?? 0;
        const isOutOfStock = product.isOutOfStock;

        if (isOutOfStock || stock <= 0 || stock >= 30) return;

        const MAX_STOCK = 30;
        const targetPercentage = Math.max(5, (stock / MAX_STOCK) * 100);
        const DURATION = 2000;

        const animate = (time: number) => {
            if (!startTimeRef.current) startTimeRef.current = time;
            const timeElapsed = time - startTimeRef.current;
            const rawProgress = Math.min(timeElapsed / DURATION, 1);
            const easedProgress = easeDrain(rawProgress);
            const currentWidth = 100 + (targetPercentage - 100) * easedProgress;

            let currentColor = COLOR_GREEN;
            if (currentWidth >= 30) {
                const factor = 1 - ((currentWidth - 30) / 70);
                currentColor = interpolateColor(COLOR_GREEN, COLOR_YELLOW, factor);
            } else if (currentWidth >= 10) {
                const factor = 1 - ((currentWidth - 10) / 20);
                currentColor = interpolateColor(COLOR_YELLOW, COLOR_ORANGE, factor);
            } else {
                const factor = 1 - (currentWidth / 10);
                currentColor = interpolateColor(COLOR_ORANGE, COLOR_RED, factor);
            }

            setBarWidth(currentWidth);
            setBarColor(currentColor);

            if (timeElapsed < DURATION) requestRef.current = requestAnimationFrame(animate);
        };
        const timeoutId = setTimeout(() => {
            startTimeRef.current = undefined;
            requestRef.current = requestAnimationFrame(animate);
        }, 200);
        return () => {
            clearTimeout(timeoutId);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [viewState]);

    const calculateFinalPrice = (basePrice: number, percent: number) => Math.round((basePrice * (1 - percent / 100)) * 100) / 100;

    // --- SAFE ACCESSORS based on viewState ---
    const isLoading = viewState.status === 'loading';
    const safeProduct = viewState.status === 'ready' ? viewState.product : {
        id: "fallback-id", title: "", description: "", price: 0, salePrice: undefined, images: [], image: "", stock: 0, isOutOfStock: false, sku: "", isNew: false, category: "Allgemein", slug: "fallback", world: undefined, subcategory: undefined
    };

    // CRITICAL: Safe image array with guards
    const displayImages = Array.isArray(safeProduct.images) && safeProduct.images.length > 0
        ? safeProduct.images
        : (safeProduct.image ? [safeProduct.image] : []);
    const activeImage = displayImages[activeImageIndex] || "";

    // Domain-based price selection
    const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');
    const price = isCH ? (safeProduct as any).price_ch ?? safeProduct.price : safeProduct.price;

    const pricePrev = isCH
        ? (safeProduct as any).pricePrev_ch ?? (safeProduct as any).pricePrev
        : (safeProduct as any).pricePrev;

    const showStrikePrice = pricePrev > price;

    const currentPrice = price;
    const discountPercentage = showStrikePrice ? Math.round(((pricePrev - price) / pricePrev) * 100) : 0;



    // --- RECOMMENDATIONS LOGIC MOVED TO COMPONENT ---

    // --- DYNAMIC COUPONS ---
    const coupons: Coupon[] = useMemo(() => {
        if (isLoading || safeProduct.isOutOfStock || !shopSettings?.showCouponBox) return [];

        const limit = shopSettings?.maxCouponsInBox || 2;

        return dynamicCoupons
            .slice(0, limit)
            .map(c => ({
                discount: c.discount,
                code: c.code,
                description: c.description,
                finalPrice: convertPrice(calculateFinalPrice(currentPrice, c.discount))
            }));
    }, [currentPrice, isLoading, safeProduct.isOutOfStock, dynamicCoupons, shopSettings]);

    const handleAddToCart = () => {
        if (safeProduct.isOutOfStock) return;
        const firstImage = displayImages.length > 0 ? displayImages[0] : '';
        for (let i = 0; i < quantity; i++) addToCart({ ...safeProduct, image: firstImage });

        // Track add_to_cart event
        const currency = getCurrency();
        const displayPrice = safeProduct.salePrice || safeProduct.price;

        trackEvent('add_to_cart', {
            currency: currency,
            value: displayPrice * quantity,
            items: [{
                item_id: safeProduct.sku,
                item_name: safeProduct.title,
                price: displayPrice,
                quantity: quantity
            }]
        });

        trackShopEvent({
            event: 'add_to_cart',
            productId: safeProduct.sku,
            productName: safeProduct.title,
            price: displayPrice,
            quantity: quantity,
            total: displayPrice * quantity
        });
    };

    const handleBuyNow = () => {
        if (safeProduct.isOutOfStock) return;
        const firstImage = displayImages.length > 0 ? displayImages[0] : '';
        // Reuse addToCart logic but silent
        for (let i = 0; i < quantity; i++) addToCart({ ...safeProduct, image: firstImage }, { silent: true });

        // Track add_to_cart for Buy Now
        trackShopEvent({
            event: 'add_to_cart',
            productId: safeProduct.sku,
            productName: safeProduct.title,
            price: safeProduct.salePrice || safeProduct.price,
            quantity: quantity,
            total: (safeProduct.salePrice || safeProduct.price) * quantity
        });

        navigate('/checkout');
    };

    const scrollToReviews = () => {
        setActiveTab('reviews');
        // Wait for the next render for the tab content to be in the DOM
        setTimeout(() => {
            const element = document.getElementById('reviews-tab-content');
            if (element) {
                // Account for the sticky header (~144px) + some extra breathing room
                const headerOffset = 160;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    const increaseQuantity = () => setQuantity(prev => {
        if (safeProduct.stock && prev >= safeProduct.stock) return prev;
        return prev + 1;
    });

    const goNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveImageIndex((prev) => prev === displayImages.length - 1 ? 0 : prev + 1);
    };
    const goPrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveImageIndex((prev) => prev === 0 ? displayImages.length - 1 : prev - 1);
    };

    const handleScrollThumbs = (direction: 'up' | 'down') => {
        if (thumbsRef.current) {
            // Vertical step: 150px (height) + 12px (gap) = 162
            const scrollAmount = 162;
            thumbsRef.current.scrollBy({
                top: direction === 'up' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Touch handlers for swipe
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
        setIsSwipeTransitioning(false);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchStart) return;
        const currentTouch = e.targetTouches[0].clientX;
        setTouchEnd(currentTouch);
        const offset = currentTouch - touchStart;
        // Apply drag with some resistance (30% of actual movement)
        setDragOffset(offset * 0.3);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) {
            setDragOffset(0);
            return;
        }
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        setIsSwipeTransitioning(true);

        if (isLeftSwipe) {
            goNext();
        } else if (isRightSwipe) {
            goPrev();
        }

        // Reset drag offset with smooth transition
        setTimeout(() => {
            setDragOffset(0);
            setIsSwipeTransitioning(false);
        }, 50);
    };

    // handleReviewSubmit removed

    return (
        <>
            <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-8">
                {/* Breadcrumbs - DYNAMIC based on World & Subcategory */}
                <nav className="flex items-center text-xs text-gray-500 font-medium uppercase tracking-wide mb-8">
                    <Link to="/" className="opacity-60 hover:opacity-100">Home</Link>

                    {safeProduct.world && (
                        <>
                            <span className="mx-2">/</span>
                            <Link to={`/${safeProduct.world}`} className="opacity-60 hover:opacity-100 text-[#2b4736]">
                                {safeProduct.world === 'work' ? 'Büro & Office' : 'Wohnen & Style'}
                            </Link>
                        </>
                    )}

                    {safeProduct.world && safeProduct.subcategory && (
                        <>
                            <span className="mx-2">/</span>
                            <Link to={`/${safeProduct.world}/${safeProduct.subcategory}`} className="opacity-60 hover:opacity-100">
                                {safeProduct.category}
                            </Link>
                        </>
                    )}

                    <span className="mx-2">/</span>
                    {isLoading ? (
                        <div className="h-4 w-32 bg-gray-200 rounded skeleton"></div>
                    ) : (
                        <span className="text-[#2b4736] truncate max-w-[200px] sm:max-w-md">{String(safeProduct.title || '')}</span>
                    )}
                </nav>

                {/* ATOMIC STATE-BASED RENDERING - No race conditions */}
                {viewState.status === 'not_found' ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Produkt nicht gefunden</h2>
                        <p className="text-gray-600 mb-8">Das gesuchte Produkt konnte leider nicht gefunden werden.</p>
                        <Button onClick={() => navigate('/shop')} variant="primary">Zurück zum Shop</Button>
                    </div>
                ) : (
                    /* ALWAYS show product section for 'loading' and 'ready' states */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 relative">


                        {/* --- LEFT: IMAGES (STICKY ON DESKTOP) --- */}
                        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 lg:gap-6 h-fit lg:sticky lg:top-[80px] lg:self-start">

                            {/* Thumbnails (Songmics Style: Wide, Vertical, Hidden Scrollbar, Rectangular) */}
                            <div className="order-2 md:order-1 relative flex flex-col items-center">

                                {/* Up Arrow (Desktop) */}
                                {displayImages.length > 3 && (
                                    <button
                                        onClick={() => handleScrollThumbs('up')}
                                        className="hidden md:flex w-full items-center justify-center pb-2 text-gray-400 hover:text-[#2b4736] transition-colors z-10"
                                        disabled={isLoading}
                                    >
                                        <ChevronUp className="w-6 h-6" />
                                    </button>
                                )}

                                {/* Thumbnails Container */}
                                {/* Songmics Style: Dynamic height, image-driven, 5 visible */}
                                <div
                                    ref={thumbsRef}
                                    className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto w-full md:w-[120px] md:max-h-[600px] scrollbar-hide py-1 px-1 scroll-smooth"
                                >
                                    {isLoading ? (
                                        [1, 2, 3].map(i => <div key={i} className="w-[120px] min-h-[80px] flex-shrink-0 bg-gray-200 rounded-md skeleton"></div>)
                                    ) : (
                                        displayImages.length > 0 && displayImages.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImageIndex(idx)}
                                                // Songmics Style: Width fixed, height auto (image-driven)
                                                className={`relative w-[120px] flex-shrink-0 bg-[#f7f7f7] rounded-[4px] transition-all duration-200 box-border p-2 ${idx === activeImageIndex ? "border-2 border-[#2b4736]" : "border-2 border-transparent hover:border-gray-300"}`}
                                            >
                                                <OptimizedImage
                                                    src={img || ''}
                                                    variant="small"
                                                    className="w-full"
                                                    imgClassName="!w-full !h-auto !object-contain !block"
                                                />
                                            </button>
                                        ))
                                    )}
                                </div>

                                {/* Down Arrow (Desktop) */}
                                {displayImages.length > 3 && (
                                    <button
                                        onClick={() => handleScrollThumbs('down')}
                                        className="hidden md:flex w-full items-center justify-center pt-2 text-gray-400 hover:text-[#2b4736] transition-colors z-10"
                                        disabled={isLoading}
                                    >
                                        <ChevronDown className="w-6 h-6" />
                                    </button>
                                )}
                            </div>

                            {/* Main Image (Songmics Style: Flexible Container, NOT Square, Object Contain) */}
                            <div
                                className={`order-1 md:order-2 flex-1 relative bg-white border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[500px] group select-none ${isLoading ? '' : 'cursor-zoom-in'}`}
                                onClick={() => !isLoading && setIsLightboxOpen(true)}
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                            >
                                {/* --- DISCOUNT BADGE (New Request) --- */}
                                {discountPercentage > 0 && !safeProduct.isOutOfStock && (
                                    <div className="absolute top-4 left-4 z-20 bg-[#d9534f] shadow-[#d9534f]/20 shadow-md text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded">
                                        -{discountPercentage}%
                                    </div>
                                )}
                                {isLoading ? (
                                    <div className="w-full h-full bg-gray-200 skeleton absolute inset-0"></div>
                                ) : (
                                    <>
                                        {displayImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); goPrev(e); }}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#2b4736] z-20 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <ChevronLeft className="w-6 h-6" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); goNext(e); }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#2b4736] z-20 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <ChevronRight className="w-6 h-6" />
                                                </button>
                                            </>
                                        )}
                                        <OptimizedImage
                                            src={activeImage}
                                            alt={safeProduct.title}
                                            variant="full"
                                            loading="eager"
                                            fetchPriority="high"
                                            width={800}
                                            height={800}
                                            className="w-full h-full"
                                            imgClassName={`w-full h-full !object-cover !object-center ${safeProduct.isOutOfStock ? 'grayscale' : ''}`}
                                            style={{
                                                transform: `translateX(${dragOffset}px)`,
                                                transition: isSwipeTransitioning ? 'transform 0.3s ease-out' : 'none'
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* --- RIGHT: INFO --- */}
                        <div className="lg:col-span-5 flex flex-col gap-3">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    {isLoading ? (
                                        <div className="h-4 w-32 bg-gray-200 rounded skeleton"></div>
                                    ) : (
                                        <>
                                            {hasReviews && amazonStats ? (
                                                <button onClick={scrollToReviews} className="flex items-center gap-1 text-[#FF9900] hover:opacity-80 transition-opacity">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < Math.round((amazonStats as any).averageRating) ? 'fill-current' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                    <span className="text-gray-400 text-xs ml-2 font-medium underline decoration-dotted">({(amazonStats as any).totalReviews} Bewertungen)</span>
                                                </button>
                                            ) : (
                                                /* No reviews - show nothing or empty stars? User wants honest. No fake stars. */
                                                <div className="h-4"></div>
                                            )}
                                        </>
                                    )}
                                    {isLoading ? <div className="h-4 w-20 bg-gray-200 rounded skeleton"></div> : <span className="text-gray-400 text-xs">SKU: {String(safeProduct.sku || '')}</span>}
                                </div>

                                {/* --- STAR RATING ABOVE TITLE --- */}
                                {!isLoading && safeProduct.reviews && safeProduct.reviews.length > 0 && (
                                    <div
                                        className="flex items-center gap-2 mb-2 cursor-pointer group"
                                        onClick={scrollToReviews}
                                    >
                                        <StarRating
                                            rating={safeProduct.reviews.reduce((acc, r) => acc + r.rating, 0) / safeProduct.reviews.length}
                                            sizeClass="w-4 h-4"
                                        />
                                        <span className="text-gray-500 text-sm font-medium group-hover:text-[#eebb0e] transition-colors">
                                            {safeProduct.reviews.length} Bewertungen
                                        </span>
                                    </div>
                                )}

                                {isLoading ? (
                                    <div className="h-10 w-3/4 bg-gray-200 rounded skeleton mb-3"></div>
                                ) : (
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#333] mb-2 leading-tight block opacity-100">{String(safeProduct.title || '')}</h1>
                                )}

                                <div className="flex items-baseline gap-3 mb-2">
                                    {isLoading ? (
                                        <div className="h-8 w-24 bg-gray-200 rounded skeleton"></div>
                                    ) : (
                                        <>
                                            <span className={`text-3xl font-bold ${safeProduct.isOutOfStock ? 'text-gray-400' : 'text-[#333]'}`}>
                                                {formatPrice(price)}
                                            </span>
                                            {showStrikePrice && (
                                                <span className="text-lg text-gray-400 line-through decoration-gray-400">
                                                    {formatPrice(pricePrev)}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500 font-normal">inkl. MwSt.</span>
                                        </>
                                    )}
                                </div>

                                {/* --- BANNER (Dynamic from Admin) --- */}
                                {!isLoading && !safeProduct.isOutOfStock && shopSettings?.showProductBanner && (
                                    <div className="w-full sm:w-auto inline-flex items-center gap-2.5 bg-[#FFF7EE] border border-[#F0E0D0] rounded-lg px-4 py-2.5 mt-1 mb-3 shadow-sm">
                                        <Sparkles className="w-[18px] h-[18px] text-[#E87E24] flex-shrink-0" />
                                        <div className="text-[13px] sm:text-[14px] leading-tight text-[#333]">
                                            <div className="inline" dangerouslySetInnerHTML={{ __html: shopSettings.productBannerText || '' }} />
                                            {!shopSettings.productBannerText && (
                                                <>
                                                    <span className="font-bold text-[#D24A43]">AKTION</span> – Jetzt exklusive Vorteile sichern!
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* --- STOCK INDICATOR (Simplified & Clean) --- */}
                            <div className="mb-8">
                                {isLoading ? (
                                    <div className="h-6 w-full bg-gray-200 rounded skeleton"></div>
                                ) : (
                                    safeProduct.isOutOfStock || safeProduct.stock === 0 ? (
                                        <div className="inline-flex items-center gap-2 text-[#d9534f] bg-[#d9534f]/10 px-3 py-1.5 rounded-full font-bold text-sm">
                                            <X className="w-4 h-4" />
                                            Ausverkauft
                                        </div>
                                    ) : (safeProduct.stock ?? 0) >= 30 ? (
                                        <div className="flex items-center gap-2 text-[#2b4736] font-medium text-sm bg-[#e8ece9] px-3 py-1.5 rounded-full w-fit">
                                            <div className="w-2 h-2 rounded-full bg-[#2b4736]"></div>
                                            <span>Auf Lager</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-w-md">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-[#c2410c]">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#fa5a2a]"></div>
                                                Nur noch <span className="font-bold">{safeProduct.stock}</span> Artikel verfügbar
                                            </div>
                                            {/* Slim Elegant Bar */}
                                            <div className="w-full h-[4px] bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-[#fa5a2a]"
                                                    style={{ width: `${Math.min(100, ((safeProduct.stock || 0) / 30) * 100)}%` }}
                                                >
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                            {/* Add To Cart & Quantity */}
                            <div className="flex flex-col gap-4 w-full">
                                {isLoading ? (
                                    <div className="h-14 w-full bg-gray-200 rounded-full skeleton"></div>
                                ) : (safeProduct.isOutOfStock || safeProduct.stock === 0) ? (
                                    <button disabled className="bg-gray-100 text-gray-400 rounded-full px-6 py-4 font-bold text-base w-full cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200">
                                        <Bell className="w-5 h-5" /> Benachrichtigung aktivieren
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Quantity Selector - Now on top */}
                                        <div className="flex items-center justify-start">
                                            <div className="flex items-center border border-gray-300 rounded-full h-[52px] w-[160px] justify-between px-1 bg-white">
                                                <button onClick={decreaseQuantity} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#2b4736] hover:bg-gray-100 rounded-full transition-colors"><Minus size={18} /></button>
                                                <span className="flex-1 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                                                <button onClick={increaseQuantity} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#2b4736] hover:bg-gray-100 rounded-full transition-colors"><Plus size={18} /></button>
                                            </div>
                                        </div>

                                        {/* Buttons - Now below quantity */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button
                                                onClick={handleAddToCart}
                                                variant="primary"
                                                size="lg"
                                                className="flex-1 h-[52px]"
                                                disabled={safeProduct.isOutOfStock}
                                            >
                                                In den Warenkorb
                                            </Button>
                                            <Button
                                                onClick={handleBuyNow}
                                                variant="outline"
                                                size="lg"
                                                className="flex-1 h-[52px]"
                                                disabled={safeProduct.isOutOfStock}
                                            >
                                                Jetzt kaufen
                                            </Button>
                                        </div>

                                        {/* Removed Micro-Trust Text as requested */}
                                    </div>
                                )}
                            </div>

                            {/* COUPONS (Dynamic from Admin) */}
                            {!isLoading && !safeProduct.isOutOfStock && shopSettings?.showCouponBox && coupons.length > 0 && (
                                <CouponBox
                                    coupons={coupons}
                                    currency={getCurrency()}
                                    footerText={shopSettings?.couponBoxFooterText}
                                />
                            )}

                            {/* Trust Badges - Vertical List (New Request) */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex flex-col gap-3">
                                    {[
                                        { icon: Truck, title: "Kostenloser Versand", desc: isCH ? "Innerhalb der Schweiz" : "Innerhalb Deutschlands" },
                                        { icon: Headset, title: "24/5 Support", desc: "Top Kundenservice" },
                                        { icon: Undo2, title: "30 Tage Rückgaberecht", desc: "Einfache Rücksendung" },
                                        { icon: ShieldCheck, title: "Sichere Zahlung", desc: "Verschlüsselt per SSL" }
                                    ].map((usp, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-gray-200 transition-colors">
                                            <div className="flex-shrink-0 text-[#2b4736] bg-gray-50 p-2 rounded-full">
                                                <usp.icon className="w-5 h-5 stroke-[1.5]" />
                                            </div>
                                            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                                                <h4 className="text-sm font-bold text-[#222]">{usp.title}</h4>
                                                <span className="hidden md:inline text-gray-300">|</span>
                                                <p className="text-xs text-gray-500">{usp.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TABS --- */}
                <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row border-b border-gray-200">
                        {[
                            { id: 'description', label: 'Beschreibung' },
                            ...(safeProduct.reviews && safeProduct.reviews.length > 0 ? [{ id: 'reviews', label: 'Kundenbewertungen' }] : []),
                            { id: 'qa', label: 'Fragen & Antworten' },
                            { id: 'shipping', label: 'Versand & Lieferung' }
                        ].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`relative w-full md:w-auto px-6 md:px-10 py-5 text-xs font-bold uppercase tracking-wide transition-all text-left md:text-center ${activeTab === tab.id ? 'bg-white' : 'text-gray-500 hover:text-gray-800 bg-gray-50/50 hover:bg-gray-50'}`} style={{ color: activeTab === tab.id ? PRIMARY_GREEN : undefined }}>
                                {tab.label}
                                {activeTab === tab.id && <span className="absolute bottom-0 left-0 md:left-0 md:w-full w-1 md:w-full h-full md:h-[3px]" style={{ backgroundColor: PRIMARY_GREEN }}></span>}
                            </button>
                        ))}
                    </div>
                    <div className="p-8 md:p-12 min-h-[300px] text-gray-600 leading-relaxed text-[15px]">
                        {activeTab === 'description' && (
                            <div className="border border-[#E5E5E5] rounded-[8px] bg-white p-6 md:p-8 animate-in fade-in duration-300">
                                {isLoading ? (
                                    <div className="space-y-4 max-w-2xl">
                                        <div className="h-4 bg-gray-200 rounded skeleton w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded skeleton w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded skeleton w-5/6"></div>
                                    </div>
                                ) : (
                                    <div className="text-[0.95rem] leading-[1.6] text-[#444]">
                                        {safeProduct.description && typeof safeProduct.description === 'string' && safeProduct.description.trim() ? (
                                            safeProduct.description.split('\n').map((line, idx) => {
                                                const trimmed = line.trim();
                                                if (!trimmed) return <br key={idx} />;

                                                // Simple heuristic: If line is short (< 60 chars) and mostly uppercase, treat as subheader
                                                const isUppercase = trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);

                                                if (isUppercase) {
                                                    return <h4 key={idx} className="font-bold text-[#1C1C1C] mt-6 first:mt-0 mb-2 text-[1rem] uppercase tracking-wide">{trimmed}</h4>;
                                                }

                                                return <p key={idx} className="mb-4 last:mb-0">{trimmed}</p>;
                                            })
                                        ) : (
                                            <p className="text-gray-500 italic">Keine Beschreibung verfügbar.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'reviews' && safeProduct.reviews && (
                            <div id="reviews-tab-content" className="animate-in fade-in duration-300">
                                <ReviewsSection reviews={safeProduct.reviews} />
                            </div>
                        )}
                        {activeTab === 'qa' && (
                            <div className="border border-[#E5E5E5] rounded-[8px] bg-white p-6 md:p-8 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 lg:divide-x divide-gray-100">

                                    {/* Left Column (Q1 & Q2) */}
                                    <div className="lg:pr-8 space-y-8">
                                        {/* Q1 */}
                                        <div>
                                            <h4 className="text-[1.05rem] font-bold text-[#1C1C1C] mb-3">
                                                Q: Wie kann ich für meine Bestellung bezahlen?
                                            </h4>
                                            <p className="text-[0.95rem] leading-[1.6] text-[#444]">
                                                A: Derzeit akzeptieren wir Bezahlungen via PayPal, Kreditkarte{isCH ? ', TWINT' : ''} und Vorkasse. Bei Zahlung per Vorkasse muss der Gesamtbetrag der Bestellung innerhalb von 10 Tagen auf unser Konto eingehen. Unsere Kontoinformationen erhalten Sie nach Aufgabe der Bestellung. Es können bis zu 3 Tage vergehen, bis wir den Eingang Ihre Überweisung nachprüfen können. Nach Erhalt Ihrer Zahlung versenden wir die Bestellung.
                                            </p>
                                        </div>

                                        {/* Q2 */}
                                        <div>
                                            <h4 className="text-[1.05rem] font-bold text-[#1C1C1C] mb-3">
                                                Q: Wo kann ich die Aufbauanleitung zu dem von mir bestellten Produkt finden?
                                            </h4>
                                            <p className="text-[0.95rem] leading-[1.6] text-[#444]">
                                                A: Jedem Produkt, das vor dem Gebrauch zusammengebaut werden muss, liegt eine Anleitung bei. Sie können zudem unseren Kundenservice per E-Mail kontaktieren, um eine Anleitung zu erhalten.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Column (Q3 & Q4) */}
                                    <div className="lg:pl-8 space-y-8 pt-8 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                        {/* Q3 */}
                                        <div>
                                            <h4 className="text-[1.05rem] font-bold text-[#1C1C1C] mb-3">
                                                Q: Wird eine Umsatzsteuer berechnet?
                                            </h4>
                                            <p className="text-[0.95rem] leading-[1.6] text-[#444]">
                                                A: Die {isCH ? 'Mehrwertsteuer von 8.1%' : 'Umsatzsteuer von 19%'} ist bereits im Preis der Produkte enthalten. Bitte kontaktieren Sie unseren Kundenservice per E-Mail oder telefonisch unter +41 76 200 46 78 (Mo. bis Fr. 10–17 Uhr) wenn Sie weitere Informationen benötigen.
                                            </p>
                                        </div>

                                        {/* Q4 */}
                                        <div>
                                            <h4 className="text-[1.05rem] font-bold text-[#1C1C1C] mb-3">
                                                Q: Wie kann ich meine Sendung verfolgen?
                                            </h4>
                                            <p className="text-[0.95rem] leading-[1.6] text-[#444]">
                                                A: Nach Bestellung wird Ihnen eine zunächst eine "Bestellbestätigung" zugeschickt. Später erhalten Sie zudem eine "Versandbestätigung", die alle notwendigen Tracking-Informationen enthält. Mit der Paket-Nr. können Sie den Paketstatus auf der Webseite der Zusteller-Firma nachverfolgen.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'shipping' && (
                            <div className="border border-[#E5E5E5] rounded-[8px] bg-white p-6 md:p-8 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 lg:divide-x-0 divide-y lg:divide-y-0 divide-gray-100">
                                    {/* Left Column */}
                                    <div className="lg:pr-8">
                                        <h4 className="text-[1.1rem] font-semibold text-[#1C1C1C] mb-4">
                                            {isCH ? 'Kostenloser Versand innerhalb der Schweiz' : 'Kostenloser Versand innerhalb Deutschlands'}
                                        </h4>
                                        <div className="text-[0.95rem] leading-[1.6] text-[#444] space-y-4">
                                            <p>
                                                {isCH ? 'Wir versenden Ihre Bestellung kostenlos innerhalb der Schweiz.' : 'Wir versenden Ihre Bestellung kostenlos innerhalb Deutschlands.'}
                                            </p>
                                            <p>
                                                Sobald alle Artikel Ihrer Bestellung versandbereit sind, wird das Paket verschickt.
                                                <br />
                                                <span className="font-medium text-[#222]">Versanddauer:</span> In der Regel 2–4 Werktage.
                                            </p>
                                            <p>
                                                Weitere Details finden Sie auf unserer Seite{' '}
                                                <Link to="/lieferung-versand" className="text-[#0E4F34] hover:underline font-medium">
                                                    „Versand- und Lieferinformationen“
                                                </Link>.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="pt-8 lg:pt-0 lg:pl-8">
                                        <h4 className="text-[1.1rem] font-semibold text-[#1C1C1C] mb-4">
                                            Rückgabe innerhalb von 30 Tagen
                                        </h4>
                                        <div className="text-[0.95rem] leading-[1.6] text-[#444] space-y-4">
                                            <p>
                                                Sie können Ihre Bestellung innerhalb von 30 Tagen ohne Angabe von Gründen zurückgeben.
                                            </p>
                                            <p>
                                                Kontaktieren Sie uns, wenn Ihre Sendung beschädigt ankommt oder Teile fehlen – wir lösen das Problem schnell und unkompliziert.
                                            </p>
                                            <p>
                                                Die vollständigen Bedingungen finden Sie auf unserer Seite{' '}
                                                <Link to="/rueckgabe" className="text-[#0E4F34] hover:underline font-medium">
                                                    „Rückgabe- und Umtauschrichtlinien“
                                                </Link>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- REVIEWS SECTION Removed (Moved to Tabs) --- */}
                {/* {viewState.status === 'ready' && viewState.product.reviews && (
                    <ReviewsSection reviews={viewState.product.reviews} />
                )} */}

                {/* --- RELATED PRODUCTS --- */}

                {/* --- RECOMMENDATIONS SLIDER --- */}
                {/* --- RECOMMENDATIONS SLIDER (LAZY LOADED) --- */}
                {viewState.status === 'ready' && (
                    <RelatedProducts currentProduct={safeProduct} />
                )}
            </div>

            {/* SEO Schema Markup */}
            <ProductSchema
                productName={safeProduct.title || ""}
                productSku={safeProduct.sku || ""}
                productDescription={safeProduct.description || ""}
                productPrice={currentPrice}
                productImage={activeImage}
                reviews={[]}
                productUrl={window.location.href}
            />

            {/* Newsletter Section - Placed outside the max-w container to allow full width background, consistent with HomePage */}
            < NewsletterSection />

            {/* Lightbox */}
            {
                isLightboxOpen && !isLoading && (
                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                        <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white z-50 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={32} /></button>
                        <div className="relative w-full h-full flex items-center justify-center p-8" onClick={() => setIsZoomed(!isZoomed)} onMouseMove={(e) => {
                            if (!isZoomed) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
                        }} style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}>
                            <OptimizedImage src={activeImage} alt={safeProduct.title} variant="full" className="w-full h-full" imgClassName="!w-full !h-full !object-contain" style={{ transform: isZoomed ? 'scale(2.5)' : 'scale(1)', transformOrigin: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center center', transition: isZoomed ? 'none' : 'transform 0.2s ease-out' }} />
                        </div>
                    </div>
                )
            }

            {/* C) REVIEW MODAL - Removed */}
        </>
    );
};

export default ProductDetailPage;
