import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { OptimizedImage } from './OptimizedImage';
import { prefetchProducts } from '../hooks/useSheetsApi';
import { formatPrice } from '../utils/currency';
import { StarRating } from './StarRating';
import { productReviews } from '../data/productsReviews';

interface ProductCardProps {
  product: Product;
  rank?: number;
  extraInfo?: React.ReactNode;
  imageLoading?: 'lazy' | 'eager';
  imageFetchPriority?: 'high' | 'low' | 'auto';
}

export const ProductCard = React.memo<ProductCardProps>(({
  product,
  rank,
  extraInfo,
  imageLoading = 'lazy',
  imageFetchPriority = 'auto'
}) => {
  const { addToCart } = useCart();

  // Domain-based price selection
  const isCH = window.location.hostname.includes('.ch');
  const price = isCH ? (product as any).price_ch ?? product.price : product.price;

  const pricePrev = isCH
    ? (product as any).pricePrev_ch ?? (product as any).pricePrev
    : (product as any).pricePrev;

  const showStrikePrice = pricePrev > price;

  const hasSale = showStrikePrice;
  const isOOS = product.isOutOfStock || product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOOS) return;
    addToCart(product);
  };

  const handleMouseEnter = () => {
    prefetchProducts();
  };

  // SAFE LINK GENERATION — with fallback for products missing world/subcategory
  const linkTo = (product.world && product.subcategory && product.slug)
    ? `/${product.world}/${product.subcategory}/${product.slug}`
    : product.slug
      ? `/product/${product.slug}`
      : product.sku
        ? `/product/${product.sku}`
        : '#';

  if (linkTo === '#') return null; // Only skip truly broken products

  const reviewsForProduct = product.sku ? productReviews[product.sku] : null;
  const averageRating = reviewsForProduct && reviewsForProduct.length > 0
    ? reviewsForProduct.reduce((acc, r) => acc + r.rating, 0) / reviewsForProduct.length
    : 0;

  return (
    <Link
      to={linkTo}
      className={`group block h-full ${isOOS ? 'cursor-not-allowed' : ''} transition-all duration-500 ease-out hover:-translate-y-1.5`}
      onMouseEnter={handleMouseEnter}
    >
      <div className="flex flex-col h-full relative">

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-[#f5f5f5] rounded-xl transition-all duration-500 ease-out">

          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 pointer-events-none">
            {rank && (
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-lg
                ${rank === 1 ? 'bg-[#ffca28] text-white' :
                  rank === 2 ? 'bg-[#e0e0e0] text-[#555]' :
                    rank === 3 ? 'bg-[#cd7f32] text-white' :
                      'bg-gray-800 text-white'}
              `}>
                {rank}
              </div>
            )}
            {isOOS ? (
              <span className="bg-gray-800/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-[0.1em] rounded-md shadow-lg">
                Ausverkauft
              </span>
            ) : (
              <>
                {product.isNew && !rank && (
                  <span className="bg-[#2b4736] shadow-lg text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-[0.1em] rounded-md">
                    Neu
                  </span>
                )}
                {hasSale && (
                  <span className="bg-[#E94E34] shadow-lg text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-[0.1em] rounded-md">
                    -{Math.round(((pricePrev - price) / pricePrev) * 100)}%
                  </span>
                )}
              </>
            )}
          </div>

          <OptimizedImage
            src={product.image}
            alt={product.title}
            variant="small"
            width={400}
            height={400}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading={imageLoading}
            fetchPriority={imageFetchPriority}
            className="w-full h-full absolute inset-0"
            imgClassName={`w-full h-full object-contain p-4 md:p-6 transition-transform duration-1000 ease-out ${!isOOS ? 'group-hover:scale-[1.05]' : 'grayscale opacity-60'}`}
          />

          {/* Quick add to cart */}
          {!isOOS && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 z-20 w-11 h-11 rounded-full bg-[#2b4736] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 ease-out shadow-lg hover:scale-110 hover:shadow-xl pointer-events-auto"
              aria-label="In den Warenkorb"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Content — tight spacing */}
        <div className="flex flex-col pt-3 pb-1 px-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B6E] mb-1">
            {product.category}
          </span>
          <h3 className="text-base font-semibold text-[#111] leading-snug group-hover:text-[#2b4736] transition-colors line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            {isOOS ? (
              <span className="text-gray-400 text-sm font-medium">Nicht verfügbar</span>
            ) : (
              <>
                <span className={`font-bold text-xl ${hasSale ? 'text-[#E94E34]' : 'text-[#111]'}`}>
                  {formatPrice(price || 0)}
                </span>
                {hasSale && (
                  <span className="text-gray-400 text-sm line-through font-medium">
                    {formatPrice(pricePrev || 0)}
                  </span>
                )}
              </>
            )}
          </div>

          {reviewsForProduct && reviewsForProduct.length > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <StarRating rating={averageRating} sizeClass="w-3.5 h-3.5" />
              <span className="text-xs text-gray-500 font-medium pb-[1px]">({reviewsForProduct.length})</span>
            </div>
          )}

          {extraInfo && (
            <div className="mt-2 pt-2 border-t border-gray-100 italic text-sm text-gray-600">
              {extraInfo}
            </div>
          )}
        </div>

      </div>
    </Link>
  );
});
