
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firestore';
import type { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, options?: { silent?: boolean }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  // Coupon functionality
  couponCode: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  finalTotal: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validCoupons, setValidCoupons] = useState<Record<string, { discount: number; minAmount?: number; type?: 'percent' | 'fixed' }>>({});

  // Load coupons from Firestore on mount
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const couponsRef = collection(db, 'coupons');
        const snapshot = await getDocs(couponsRef);
        const couponsData: Record<string, { discount: number; minAmount?: number; type?: 'percent' | 'fixed' }> = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.active !== false) {
            couponsData[data.code] = {
              discount: data.discount,
              minAmount: data.minAmount || 0,
              type: data.type || 'percent'
            };
          }
        });
        setValidCoupons(couponsData);
        console.log('🎫 Loaded coupons from Firestore:', Object.keys(couponsData));
      } catch (error) {
        console.error('Error loading coupons:', error);
      }
    };
    loadCoupons();
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, options?: { silent?: boolean }) => {
    // 8. NEVER allow adding OOS products to cart
    if (product.isOutOfStock) {
      // Option: Show toast error here if your app has a toast system
      // alert("Dieser Artikel ist derzeit nicht verfügbar."); // fallback
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Optional: Open cart automatically when adding an item, unless silent
    if (!options?.silent) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  // Calculate subtotal with domain-based pricing
  const cartTotal = items.reduce((sum, item) => {
    // Domain-based price selection
    const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');

    const price = isCH
      ? (item as any).price_ch ?? item.price
      : item.price;

    const pricePrev = isCH
      ? (item as any).pricePrev_ch ?? (item as any).pricePrev
      : (item as any).pricePrev;

    // Use pricePrev if it exists and is lower (sale), otherwise regular price
    const effectivePrice = (pricePrev && pricePrev < price) ? pricePrev : price;

    return sum + effectivePrice * item.quantity;
  }, 0);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Apply coupon code
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const upperCode = code.toUpperCase().trim();
    const coupon = validCoupons[upperCode];

    if (!coupon) {
      return { success: false, message: 'Ungültiger Gutscheincode' };
    }

    if (coupon.minAmount && cartTotal < coupon.minAmount) {
      return {
        success: false,
        message: `Mindestbestellwert: ${coupon.minAmount.toFixed(2)} €`
      };
    }

    console.log(`🛒 CartContext: Applying coupon ${upperCode}`);
    setCouponCode(upperCode);
    setCouponDiscount(coupon.discount);

    const type = coupon.type || 'percent';
    const msg = type === 'fixed'
      ? `${coupon.discount} CHF/EUR Rabatt angewendet`
      : `${coupon.discount}% Rabatt angewendet`;

    return { success: true, message: msg };
  };

  // Remove coupon
  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
  };

  // Calculate final total with discount
  const activeCoupon = couponCode ? validCoupons[couponCode] : null;
  let discountAmount = 0;

  if (activeCoupon) {
    if (activeCoupon.type === 'fixed') {
      discountAmount = activeCoupon.discount;
    } else {
      // Default percent
      discountAmount = (cartTotal * activeCoupon.discount) / 100;
    }
  }

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      cartTotal,
      cartCount,
      isCartOpen,
      openCart,
      closeCart,
      couponCode,
      couponDiscount,
      applyCoupon,
      removeCoupon,
      finalTotal,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};