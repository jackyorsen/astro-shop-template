
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OptimizedImage } from '../components/OptimizedImage';

import { formatPrice, getCurrency } from '../utils/currency';

export const CartPage: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    cartTotal,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    finalTotal
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isOrderSummaryOpenMobile, setIsOrderSummaryOpenMobile] = useState(false);

  const shippingCost = 0;
  const total = cartTotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-screen font-sans text-[#333]">
        {/* Header Strip */}
        <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-[1150px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/logo-mamoru.png"
                alt="MAMORU MOEBEL"
                className="h-[38px] md:h-[50px] w-auto"
              />
            </Link>
            <Link to="/shop" className="text-gray-500 hover:text-[#2b4736] hover:bg-gray-50 px-3 py-1.5 rounded-full transition-all text-[13px] font-bold">
              Weiter einkaufen
            </Link>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#1f3a34] mb-3">Ihr Warenkorb ist leer</h2>
          <p className="text-gray-500 mb-8">Stöbern Sie durch unser Sortiment und entdecken Sie einzigartige Produkte.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#1f3a34] text-white px-8 py-3.5 rounded-md font-bold hover:bg-[#162925] transition-all shadow-md"
          >
            Zum Shop <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans text-[#333]">
      {/* Header Strip - Checkout Style */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-[1150px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img
              src="/logo-mamoru.png"
              alt="MAMORU MOEBEL"
              className="h-[38px] md:h-[50px] w-auto"
            />
          </Link>
          <Link to="/shop" className="text-gray-400 hover:text-gray-600 transition-all text-[12px] font-medium underline decoration-gray-300 hover:decoration-gray-500">
            Weiter einkaufen
          </Link>
        </div>
      </div>

      {/* Mobile Order Summary Toggle */}
      <div className="lg:hidden bg-[#fafafa] border-b border-[#e5e5e5] px-4 py-4 sticky top-16 z-30">
        <button
          onClick={() => setIsOrderSummaryOpenMobile(!isOrderSummaryOpenMobile)}
          className="flex items-center justify-between w-full text-[#1f3a34] font-medium"
        >
          <span className="flex items-center gap-2 text-sm text-[#2b4736] font-bold">
            <span className="text-[13px]">{isOrderSummaryOpenMobile ? 'Zusammenfassung ausblenden' : 'Zusammenfassung anzeigen'}</span>
            {isOrderSummaryOpenMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
          <span className="text-[17px] font-bold text-[#333]">{formatPrice(finalTotal || total || 0)}</span>
        </button>
      </div>

      {/* Mobile Order Summary Content */}
      {isOrderSummaryOpenMobile && (
        <div className="lg:hidden bg-[#fafafa] px-4 py-6 border-b border-[#e5e5e5] animate-slide-up shadow-inner">
          <OrderSummary
            items={items}
            subtotal={cartTotal}
            shipping={shippingCost}
            total={total}
            finalTotal={finalTotal}
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            applyCoupon={applyCoupon}
            removeCoupon={removeCoupon}
            couponInput={couponInput}
            setCouponInput={setCouponInput}
            couponMessage={couponMessage}
            setCouponMessage={setCouponMessage}
          />
        </div>
      )}

      {/* Main Layout: Split Screen Container - Checkout Style */}
      <div className="max-w-[1150px] mx-auto min-h-screen lg:grid lg:grid-cols-[58%_42%]">

        {/* LEFT COLUMN: Cart Items */}
        <div className="w-full pt-8 pb-20 px-4 md:px-8 lg:pr-14 bg-white border-r border-transparent lg:border-gray-100">
          <div className="space-y-10 animate-fade-in">

            {/* Cart Items Section */}
            <section>
              <h2 className="text-[18px] font-bold text-[#1f3a34] mb-4 tracking-tight flex items-center gap-2">
                Warenkorb
              </h2>

              <div className="space-y-4">
                {items.map((item) => {
                  const effectivePrice = item.salePrice ?? item.price;
                  const hasDiscount = item.salePrice && item.salePrice < item.price;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-white p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-all shadow-sm"
                    >
                      {/* Product Image */}
                      <Link
                        to={`/product/${item.slug}`}
                        className="shrink-0 w-24 h-24 md:w-28 md:h-28 bg-gray-50 rounded-md overflow-hidden"
                      >
                        <OptimizedImage
                          src={item.image}
                          alt={item.title}
                          variant="small"
                          width={112}
                          height={112}
                          className="w-full h-full absolute inset-0"
                          imgClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex-1">
                            <Link
                              to={`/product/${item.slug}`}
                              className="font-bold text-base text-[#1f3a34] hover:text-[#2b4736] line-clamp-2 mb-1"
                            >
                              {item.title}
                            </Link>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            aria-label="Entfernen"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between gap-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-200 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-50 transition-colors"
                              aria-label="Menge verringern"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold text-[#333]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-50 transition-colors"
                              aria-label="Menge erhöhen"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            {hasDiscount && (
                              <span className="block text-xs text-gray-400 line-through mb-0.5">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            )}
                            <p className="font-bold text-lg text-[#1f3a34]">
                              {formatPrice(effectivePrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary - Checkout Style */}
        <div className="hidden lg:block w-full h-full bg-[#fafafa] border-l border-[#e5e5e5] pt-10 pl-10 pr-10">
          <div className="sticky top-28 max-w-[420px]">
            <OrderSummary
              items={items}
              subtotal={cartTotal}
              shipping={shippingCost}
              total={total}
              finalTotal={finalTotal}
              couponCode={couponCode}
              couponDiscount={couponDiscount}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
              couponInput={couponInput}
              setCouponInput={setCouponInput}
              couponMessage={couponMessage}
              setCouponMessage={setCouponMessage}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Helper Component: Order Summary ---

interface OrderSummaryProps {
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  finalTotal: number;
  couponCode: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  couponInput: string;
  setCouponInput: (value: string) => void;
  couponMessage: { text: string; type: 'success' | 'error' } | null;
  setCouponMessage: (value: { text: string; type: 'success' | 'error' } | null) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items, subtotal, shipping, total, finalTotal,
  couponCode, couponDiscount, applyCoupon, removeCoupon,
  couponInput, setCouponInput, couponMessage, setCouponMessage
}) => {
  return (
    <div className="space-y-6">
      {/* Discount Code */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 relative">
          <input
            type="text"
            placeholder="Rabattcode oder Gutschein"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            disabled={!!couponCode}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2b4736] focus:ring-1 focus:ring-[#2b4736] outline-none bg-white text-[14px] placeholder-gray-400 shadow-sm disabled:bg-gray-50 focus:shadow-md transition-all font-medium"
          />
          <button
            onClick={() => {
              const result = applyCoupon(couponInput);
              setCouponMessage({
                text: result.message,
                type: result.success ? 'success' : 'error'
              });
              if (result.success) setCouponInput('');
            }}
            disabled={!couponInput.trim() || !!couponCode}
            className="bg-[#2b4736] text-white hover:bg-[#233a2d] font-bold px-5 rounded-lg transition-all text-[13px] shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            Anwenden
          </button>
        </div>
        {couponMessage && (
          <p className={`text-[12px] font-medium flex items-center gap-1 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {couponMessage.type === 'success' ? '✨ ' : '⚠️ '} {couponMessage.text}
          </p>
        )}
        {couponCode && (
          <div className="flex justify-between items-center bg-[#2b4736]/5 p-3 rounded-lg border border-[#2b4736]/10 animate-scale-in">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#2b4736] rounded-full flex items-center justify-center text-white">
                <Tag className="w-3 h-3" />
              </div>
              <span className="text-[#1f3a34] text-[13px] font-bold">Gutschein {couponCode} aktiv</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#1f3a34] text-[13px] font-bold">-{couponDiscount}%</span>
              <button
                onClick={() => {
                  removeCoupon();
                  setCouponInput('');
                  setCouponMessage(null);
                }}
                className="text-[12px] font-medium text-red-500 hover:text-red-700 underline decoration-red-200 hover:decoration-red-500 transition-all cursor-pointer"
              >
                Entfernen
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200 w-full my-4"></div>

      {/* Totals Breakdown */}
      <div className="space-y-3 text-[14px] text-gray-600 font-medium">
        <div className="flex justify-between">
          <span>Zwischensumme</span>
          <span className="text-[#333]">{formatPrice(subtotal || 0)}</span>
        </div>

        {couponCode && (
          <div className="flex justify-between text-[#2b4736]">
            <span>Rabatt ({couponDiscount}%)</span>
            <span>-{formatPrice((subtotal * couponDiscount) / 100)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Versand</span>
          <span className="text-[#333] font-bold">{shipping === 0 ? 'Kostenlos' : formatPrice(shipping || 0)}</span>
        </div>
      </div>

      <div className="h-px bg-gray-200 w-full my-4"></div>

      {/* Grand Total */}
      <div className="flex justify-between items-baseline">
        <span className="text-[16px] font-bold text-[#333]">Gesamt</span>
        <div className="text-right flex items-baseline gap-2">
          <span className="text-[12px] text-gray-400 font-medium">{getCurrency()}</span>
          <span className="text-[24px] font-extrabold text-[#1f3a34] tracking-tight">{formatPrice(finalTotal || total || 0)}</span>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 text-right mt-1">Enthält MwSt. in Höhe von {formatPrice((finalTotal || total || 0) * 0.19)}</p>

      {/* Checkout Button */}
      <Link
        to="/checkout"
        className="block w-full bg-[#1f3a34] text-white text-center py-4 rounded-md font-bold text-[16px] hover:bg-[#162925] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
      >
        Zur Kasse
      </Link>
    </div>
  );
};

export default CartPage;
