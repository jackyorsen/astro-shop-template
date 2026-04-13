import type { Product } from '../types';

/**
 * Get domain-based price for a product
 * Returns the appropriate price based on current domain (.ch vs .de)
 */
export const getDomainPrice = (product: any): { displayPrice: number; displayPricePrev: number | undefined } => {
    const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');

    const displayPrice = isCH
        ? (product.price_ch ?? product.price)
        : product.price;

    const displayPricePrev = isCH
        ? (product.pricePrev_ch ?? product.pricePrev)
        : product.pricePrev;

    return {
        displayPrice,
        displayPricePrev
    };
};

/**
 * Get effective price (sale price if available, otherwise regular price)
 */
export const getEffectivePrice = (product: any): number => {
    const { displayPrice, displayPricePrev } = getDomainPrice(product);
    return displayPricePrev ?? displayPrice;
};

/**
 * Check if product has a discount
 */
export const hasDiscount = (product: any): boolean => {
    const { displayPrice, displayPricePrev } = getDomainPrice(product);
    return !!displayPricePrev && displayPricePrev < displayPrice;
};

/**
 * Calculate discount percentage
 */
export const getDiscountPercentage = (product: any): number => {
    const { displayPrice, displayPricePrev } = getDomainPrice(product);
    if (!displayPricePrev || displayPricePrev >= displayPrice) return 0;
    return Math.round(((displayPrice - displayPricePrev) / displayPrice) * 100);
};
