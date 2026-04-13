import type { Product } from '../types';

/**
 * Filter products for public shop display
 * Only shows Songmics products, filters out Galaxus and other sources
 * 
 * Galaxus products should only appear in the Ricardo Poster (admin area)
 */
export const filterShopProducts = (products: Product[]): Product[] => {
    return products.filter(p => p.source === 'songmics');
};
