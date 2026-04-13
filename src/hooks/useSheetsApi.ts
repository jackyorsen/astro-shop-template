import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { getSite, Site } from '../utils/currency';
import { getSlug } from '../utils/categoryHelper';

// --- CONFIGURATION ---
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache
const API_URL = "/products.json";

// --- GLOBAL STATE ---
// This ensures we only fetch ONCE per session/page load across all components
interface CacheState {
  products: Product[];
  timestamp: number;
  site: Site | null;
  promise: Promise<Product[]> | null;
}

const GLOBAL_CACHE: CacheState = {
  products: [],
  timestamp: 0,
  site: null,
  promise: null
};

// --- HELPER FUNCTIONS ---
const safeParsePrice = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Core Fetch Function
const assignWorld = (category: string): 'work' | 'beauty' | undefined => {
  const lowerCat = category.toLowerCase();

  // WORK SPACE Categories
  if (
    lowerCat.includes('büro') ||
    lowerCat.includes('bueo') ||
    lowerCat.includes('schreibtisch') ||
    lowerCat.includes('stuhl') ||
    lowerCat.includes('stühle') ||
    lowerCat.includes('stuehle') ||
    lowerCat.includes('sessel') ||
    lowerCat.includes('computer') ||
    lowerCat.includes('container') ||
    lowerCat.includes('gaming') ||
    lowerCat.includes('akten') ||
    lowerCat.includes('hocker')
  ) {
    return 'work';
  }

  // BEAUTY SPACE Categories
  if (
    lowerCat.includes('schmink') ||
    lowerCat.includes('schmuck') ||
    lowerCat.includes('kleider') ||
    lowerCat.includes('schuh') ||
    lowerCat.includes('kosmetik') ||
    lowerCat.includes('spiegel')
  ) {
    return 'beauty';
  }

  return undefined;
};

const fetchAllProducts = async (site: Site): Promise<Product[]> => {
  // Return existing promise if a fetch is already in progress
  if (GLOBAL_CACHE.promise) {
    return GLOBAL_CACHE.promise;
  }

  // Check valid cache
  const now = Date.now();
  if (GLOBAL_CACHE.products.length > 0 && GLOBAL_CACHE.site === site && (now - GLOBAL_CACHE.timestamp) < CACHE_DURATION) {
    console.log('⚡ Using GLOBAL_CACHE products');
    return GLOBAL_CACHE.products;
  }

  console.log('🔄 STARTING SINGLE GLOBAL FETCH...');

  // Create new promise
  GLOBAL_CACHE.promise = (async () => {
    try {
      const cacheBuster = `?v=${Date.now()}`;
      const response = await fetch(`${API_URL}${cacheBuster}`, { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } });
      if (!response.ok) throw new Error("Failed to fetch products");

      const rawData = await response.json();
      // Unwrap if needed
      let data = rawData;
      if (rawData && !Array.isArray(rawData)) {
        if (Array.isArray(rawData.products)) data = rawData.products;
        else if (Array.isArray(rawData.data)) data = rawData.data;
      }

      if (!Array.isArray(data)) throw new Error("Invalid API response format");

      const mappedProducts: Product[] = data.map((item: any) => {
        const price = safeParsePrice(item.price);
        const pricePrev = safeParsePrice(item.pricePrev);
        const price_ch = safeParsePrice(item.price_ch || item.vp_ch); // fallback to vp_ch if price_ch missing
        const pricePrev_ch = safeParsePrice(item.pricePrev_ch);
        const ek_ch = safeParsePrice(item.ek_ch || item.ek || item.cost_ch);

        return {
          id: item.sku || '',
          sku: item.sku || '',
          title: item.name || 'Unbekanntes Produkt',
          name: item.name || 'Unbekanntes Produkt',
          description: item.description || "",
          category: item.category || "Sonstiges",
          image: item.images && item.images.length > 0 ? item.images[0] : (item.image || ""),
          images: item.images || [],
          price: price,
          pricePrev: pricePrev,
          price_ch: price_ch,
          pricePrev_ch: pricePrev_ch,
          vp_ch: safeParsePrice(item.vp_ch || item.price_ch),
          ek_ch: ek_ch,
          stock: item.stock || 0,
          isOutOfStock: (item.stock === 0 || item.isOutOfStock === true),
          slug: item.sku || '',
          source: item.source || 'songmics',
          supplierUrl: item.URL || item.url || "",
          displayScore: safeParsePrice(item.displayScore), // Ensure number
          ShopStatus: item.ShopStatus || 'hidden',
          world: assignWorld(item.category || ''),
          subcategory: getSlug(item.category || '') // Generate subcategory slug from category name
        };
      });
      // Update Cache
      GLOBAL_CACHE.products = mappedProducts;
      GLOBAL_CACHE.timestamp = Date.now();
      GLOBAL_CACHE.site = site;
      GLOBAL_CACHE.promise = null; // Reset promise so next call uses cache check

      console.log(`✅ GLOBAL FETCH COMPLETE: ${mappedProducts.length} products`);
      return mappedProducts;
    } catch (err) {
      GLOBAL_CACHE.promise = null; // Reset on error to allow retry
      throw err;
    }
  })();

  return GLOBAL_CACHE.promise;
};


// --- HOOKS ---

// 1. Hook for ALL products (e.g., Shop Page)
// By default, excludes 'hidden' products. Pass { includeHidden: true } to see all.
export function useProductsFromSheets(options: { includeHidden?: boolean; includeOOS?: boolean } = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const site = getSite();

    const doFilter = (all: Product[]) => {
      let filtered = all;

      // 1. Shop Status Filter
      if (!options.includeHidden) {
        filtered = filtered.filter(p => p.ShopStatus !== 'hidden');
      }

      // 2. Out-of-Stock Filter (Default: Hide OOS)
      if (!options.includeOOS) {
        filtered = filtered.filter(p => !p.isOutOfStock && p.stock > 0);
      }

      setProducts(filtered);
      setLoading(false);
    }

    // Use local check to avoid unnecessary async definition if cached
    if (GLOBAL_CACHE.products.length > 0 && GLOBAL_CACHE.site === site) {
      doFilter(GLOBAL_CACHE.products);
      // Only fetch in background if stale? No, strictly single fetch for now.
      return;
    }

    fetchAllProducts(site)
      .then(data => {
        doFilter(data);
      })
      .catch(err => {
        console.error(err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return { products, loading, error };
}

// 2. Hook for SINGLE product -> Filters LOCALLY
export function useProductFromSheets(sku: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !sku) return;
    const site = getSite();

    setLoading(true);

    const findProduct = (items: Product[]) => {
      const found = items.find(p => p.sku === sku);
      setProduct(found || null);
      setLoading(false);
    };

    // Check cache first
    if (GLOBAL_CACHE.products.length > 0 && GLOBAL_CACHE.site === site) {
      findProduct(GLOBAL_CACHE.products);
      return;
    }

    // Otherwise fetch all and then find
    fetchAllProducts(site)
      .then(items => findProduct(items))
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  }, [sku]);

  return { product, loading };
}

// 2b. Hook for SINGLE product by SLUG (New Routing)
export function useProductBySlug(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !slug) return;
    const site = getSite();

    setLoading(true);

    const findProduct = (items: Product[]) => {
      // Try to find by slug first
      let found = items.find(p => p.slug === slug);

      // Fallback: Check SKU if slug match fails (for legacy purposes or if slug === sku)
      if (!found) {
        found = items.find(p => p.sku === slug);
      }

      setProduct(found || null);
      setLoading(false);
    };

    // Check cache first
    if (GLOBAL_CACHE.products.length > 0 && GLOBAL_CACHE.site === site) {
      findProduct(GLOBAL_CACHE.products);
      return;
    }

    // Otherwise fetch all and then find
    fetchAllProducts(site)
      .then(items => findProduct(items))
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  }, [slug]);

  return { product, loading };
}

// 3. Hook for RELATED products -> Filters LOCALLY
export function useRelatedProducts(category: string, currentProductId: string, enabled: boolean = false) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled || !category) return;
    if (typeof window === 'undefined') return;
    const site = getSite();

    setLoading(true);

    const filterRelated = (items: Product[]) => {
      // Filter: Same category, In Stock, Not current, NOT HIDDEN
      const filtered = items
        .filter(p => p.ShopStatus !== 'hidden' && !p.isOutOfStock && p.stock > 0 && p.category === category && p.id !== currentProductId)
        .slice(0, 20);

      // Fallback: If not enough, fill with others
      if (filtered.length < 5) {
        const others = items
          .filter(p => p.ShopStatus !== 'hidden' && !p.isOutOfStock && p.stock > 0 && p.category !== category && p.id !== currentProductId)
          .slice(0, 20 - filtered.length);
        setRelatedProducts([...filtered, ...others]);
      } else {
        setRelatedProducts(filtered);
      }

      setLoading(false);
    };

    // Check cache
    if (GLOBAL_CACHE.products.length > 0 && GLOBAL_CACHE.site === site) {
      filterRelated(GLOBAL_CACHE.products);
      return;
    }

    // Fetch if needed
    fetchAllProducts(site)
      .then(items => filterRelated(items))
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  }, [enabled, category, currentProductId]);

  return { relatedProducts, loading };
}

// 4. Hook for BESTSELLERS -> Sorts LOCALLY
export function useBestsellers(limit: number = 20) {
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const site = getSite();

    const sortBestsellers = (items: Product[]) => {
      // Sort by displayScore (descending), filter out of stock AND HIDDEN
      const sorted = [...items]
        .filter(p => p.ShopStatus !== 'hidden' && !p.isOutOfStock && p.stock > 0)
        .sort((a, b) => (b.displayScore || 0) - (a.displayScore || 0))
        .slice(0, limit);

      setBestsellers(sorted);
      setLoading(false);
    };

    if (GLOBAL_CACHE.products.length > 0 && GLOBAL_CACHE.site === site) {
      sortBestsellers(GLOBAL_CACHE.products);
      return;
    }

    fetchAllProducts(site)
      .then(items => sortBestsellers(items))
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [limit]);

  return { bestsellers, loading };
}

// 5. Hook for HIGHLIGHTS (Replacement for useProductsWithLimit)
export function useHighlightedProducts(limit: number = 8) {
  // Currently using same logic as bestsellers for highlights, or just random/first N?
  // Homepage highlights usually just "first N" or "bestsellers". 
  // Previous implementation just sliced first N.
  // Let's use bestsellers logic for better quality highlights.
  const { bestsellers, loading } = useBestsellers(limit);
  return { products: bestsellers, loading };
}

// Prefetch helper (can be called on hover etc, safe because of global promise)
export function prefetchProducts() {
  if (typeof window === 'undefined') return;
  fetchAllProducts(getSite()).catch(console.error);
}

// 6. Hook for HERO product (Homepage)
export function useHeroProduct() {
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const site = getSite();

    const findHero = (items: Product[]) => {
      // Find the first product with ShopStatus === 'hero'
      const hero = items.find(p => p.ShopStatus === 'hero');
      setHeroProduct(hero || null);
      setLoading(false);
    };

    if (GLOBAL_CACHE.products.length > 0 && GLOBAL_CACHE.site === site) {
      findHero(GLOBAL_CACHE.products);
      return;
    }

    fetchAllProducts(site)
      .then(items => findHero(items))
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return { heroProduct, loading };
}
