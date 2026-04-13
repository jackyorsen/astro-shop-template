import React, { useEffect, useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import { OptimizedImage } from './OptimizedImage';
import { formatPrice } from '../utils/currency';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    items,
    removeFromCart,
    updateQuantity,
    cartTotal,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    finalTotal
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 60,
          backdropFilter: 'blur(2px)',
          transition: 'opacity 500ms ease',
          opacity: isCartOpen ? 1 : 0,
          pointerEvents: isCartOpen ? 'auto' : 'none',
        }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="flex flex-col"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 70,
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#fff',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.1)',
          transition: 'transform 600ms cubic-bezier(0.32, 0.72, 0, 1)',
          transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-sm font-bold text-[#1f3a34] uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Warenkorb <span>({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
          </h2>
          <button
            onClick={closeCart}
            className="group flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-[#d9534f]/10 text-gray-400 hover:text-[#d9534f] transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#f9fafb]">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-gray-200 shadow-sm">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <p className="text-[#1f3a34] font-bold text-lg mb-2">Dein Warenkorb ist leer</p>
              <p className="text-gray-500 text-sm mb-8 max-w-[240px] leading-relaxed">
                Stöbere durch unser Sortiment und lass dich inspirieren.
              </p>
              <Button onClick={closeCart} size="lg" className="shadow-lg shadow-[#2b4736]/20 transform hover:-translate-y-1 transition-all duration-300">
                Jetzt einkaufen
              </Button>
            </div>
          ) : (
            <div className="px-6 py-4 space-y-6">
              {items.map((item, index) => {
                const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');
                const price = isCH ? (item as any).price_ch ?? item.price : item.price;
                const pricePrev = isCH ? (item as any).pricePrev_ch ?? (item as any).pricePrev : (item as any).pricePrev;
                const effectivePrice = (pricePrev && pricePrev < price) ? pricePrev : price;
                const hasDiscount = pricePrev && pricePrev < price;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 group"
                    style={{
                      animation: isCartOpen ? `fadeSlideIn 0.4s ease-out ${index * 0.06}s both` : 'none'
                    }}
                  >
                    <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-100 relative shadow-sm">
                      <OptimizedImage
                        src={item.image}
                        alt={item.title}
                        variant="small"
                        width={80}
                        height={80}
                        className="w-full h-full absolute inset-0"
                        imgClassName="w-full h-full object-contain p-1.5 transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                      <div>
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-bold text-[#333] hover:text-[#2b4736] transition-colors line-clamp-2 mb-1 leading-snug"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-gray-500 font-medium">{item.category}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-1 py-1 border border-gray-100">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#2b4736] hover:bg-white rounded-full transition-all shadow-sm disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#2b4736] hover:bg-white rounded-full transition-all shadow-sm"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          {hasDiscount && (
                            <span className="block text-[10px] text-gray-400 line-through">
                              {formatPrice(price * item.quantity)}
                            </span>
                          )}
                          <span className={`text-sm font-bold ${hasDiscount ? 'text-[#d9534f]' : 'text-[#2b4736]'}`}>
                            {formatPrice(effectivePrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-[#d9534f] self-start p-1 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 duration-200"
                      aria-label="Entfernen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-white/95 backdrop-blur-md shadow-[0_-4px_30px_rgba(0,0,0,0.04)] z-10">

            {/* Coupon Section */}
            <div className="mb-6">
              <div className={`relative flex items-center transition-all duration-300 ${couponCode ? 'opacity-70 pointer-events-none' : ''}`}>
                <div className="absolute left-3 text-gray-400 pointer-events-none">
                  <Tag className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={!!couponCode}
                  placeholder="Gutscheincode"
                  className="w-full pl-10 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4736] focus:bg-white focus:shadow-sm transition-all placeholder-gray-400 font-medium"
                />
                <button
                  onClick={() => {
                    const result = applyCoupon(couponInput);
                    setCouponMessage({
                      text: result.message,
                      type: result.success ? 'success' : 'error'
                    });
                    if (result.success) {
                      setCouponInput('');
                    }
                    setTimeout(() => setCouponMessage(null), 3000);
                  }}
                  disabled={!couponInput.trim() || !!couponCode}
                  className="absolute right-1 top-1 bottom-1 px-4 text-xs font-bold bg-white text-[#2b4736] border border-gray-200 hover:border-[#2b4736] rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  Einlösen
                </button>
              </div>

              {/* Coupon Active State */}
              {couponCode && (
                <div className="mt-3 flex items-center justify-between p-3 bg-[#2b4736]/5 border border-[#2b4736]/10 rounded-lg animate-scale-in">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#2b4736] rounded-full flex items-center justify-center text-white">
                      <Tag className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-bold text-[#1f3a34]">{couponCode}</span>
                  </div>
                  <button
                    onClick={() => {
                      removeCoupon();
                      setCouponInput('');
                      setCouponMessage(null);
                    }}
                    className="text-xs font-medium text-red-500 hover:text-red-700 underline decoration-red-200 hover:decoration-red-500 transition-all cursor-pointer" // cursor-pointer added explicitely
                    style={{ pointerEvents: 'auto' }} // Force pointer events
                  >
                    Entfernen
                  </button>
                </div>
              )}

              {/* Coupon Message */}
              {couponMessage && (
                <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {couponMessage.type === 'success' ? '✨ ' : '⚠️ '}
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
                <span>Zwischensumme</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              {couponCode && (
                <div className="flex justify-between items-center text-sm text-[#2b4736] font-medium bg-[#2b4736]/5 px-2 py-1 rounded">
                  <span>Rabatt ({couponDiscount}%)</span>
                  <span>-{formatPrice((cartTotal * couponDiscount) / 100)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="font-bold text-base text-[#1f3a34]">Gesamtsumme</span>
                <span className="font-extrabold text-xl text-[#1f3a34]">{formatPrice(finalTotal)}</span>
              </div>
              <p className="text-[10px] text-gray-400 text-right">Inkl. MwSt, zzgl. Versand</p>
            </div>

            <div className="space-y-3">
              <Link to="/checkout" className="block w-full" onClick={closeCart}>
                <Button fullWidth size="lg" className="uppercase tracking-widest text-xs font-bold py-4 shadow-lg shadow-[#2b4736]/20 hover:shadow-[#2b4736]/30 transform hover:-translate-y-0.5 transition-all duration-300">
                  Sicher zur Kasse
                </Button>
              </Link>
              <Link to="/cart" className="block w-full" onClick={closeCart}>
                <Button fullWidth variant="outline" className="uppercase tracking-widest text-xs font-bold py-3 border-gray-200 text-gray-600 hover:text-[#333] hover:border-gray-400 hover:bg-transparent">
                  Warenkorb bearbeiten
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
