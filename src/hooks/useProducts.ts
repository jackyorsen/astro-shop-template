import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const API_BASE = "https://www.mamoru.shop/wp-json/wc/store/v1";

interface UseProductsOptions {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'price' | 'popularity' | 'rating' | 'title';
  slug?: string;
}

// Helper: Strip HTML tags for cleaner descriptions
const stripHtml = (html: string) => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const {
    page = 1,
    per_page = 20,
    category = null,
    search = null,
    order = "asc",
    orderby = "date",
    slug = null,
  } = options;

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        // Try fetching from API
        let url = `${API_BASE}/products?page=${page}&per_page=${per_page}&orderby=${orderby}&order=${order}`;

        if (category) url += `&category=${category}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (slug) url += `&slug=${slug}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Fehler beim Laden der Produkte");

        const data = await res.json();

        if (!isMounted) return;

        const mapped: Product[] = data.map((p: any) => {
          const price = parseInt(p.prices?.price || '0', 10) / 100;
          const regularPrice = parseInt(p.prices?.regular_price || '0', 10) / 100;

          // Check if new (created within last 30 days)
          const created = new Date(p.date_created_gmt || p.date_created);
          const isNew = (new Date().getTime() - created.getTime()) < (30 * 24 * 60 * 60 * 1000);

          return {
            id: String(p.id),
            title: p.name,
            slug: p.slug,
            image: p.images?.[0]?.src ?? "https://via.placeholder.com/800x1000?text=No+Image",
            // App logic: price is regular price, salePrice is active price if lower
            price: regularPrice > 0 ? regularPrice : price,
            salePrice: price < regularPrice ? price : undefined,
            category: p.categories?.[0]?.name ?? "Allgemein",
            description: stripHtml(p.short_description || p.description),
            isNew: isNew,
          };
        });

        setProducts(mapped);
      } catch (err) {
        if (isMounted) {
          console.warn("API Fetch failed, utilizing MOCK data fallback.", err);

          // FALLBACK LOGIC
          let mockData = [...MOCK_PRODUCTS];

          // 1. Filter by Slug
          if (slug) {
            mockData = mockData.filter(p => p.slug === slug);
          }

          // 2. Filter by Category
          if (category) {
            mockData = mockData.filter(p =>
              p.category.toLowerCase().includes(category.toLowerCase())
            );
          }

          // 3. Search
          if (search) {
            const lowerSearch = search.toLowerCase();
            mockData = mockData.filter(p =>
              p.title.toLowerCase().includes(lowerSearch) ||
              p.description.toLowerCase().includes(lowerSearch)
            );
          }

          // 4. Sort
          if (orderby === 'price') {
            mockData.sort((a, b) => {
              const pA = a.salePrice ?? a.price;
              const pB = b.salePrice ?? b.price;
              return order === 'asc' ? pA - pB : pB - pA;
            });
          }
          // (Other sort orders ignored for simple mock fallback)

          // 5. Pagination
          const startIndex = (page - 1) * per_page;
          const slicedData = mockData.slice(startIndex, startIndex + per_page);

          setProducts(slicedData);
          // We intentionally do NOT set setError here, so the UI displays the fallback data instead of an error message.
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [page, per_page, category, search, order, orderby, slug]);

  return { products, loading, error };
}

// Helper hook for single product
export function useProduct(slug: string | undefined) {
  const { products, loading, error } = useProducts({
    slug: slug,
    per_page: 1
  });

  return {
    product: products[0] || null,
    loading,
    error
  };
}