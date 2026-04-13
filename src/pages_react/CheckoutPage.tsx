
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StripePaymentForm } from '../components/StripePaymentForm';
import {
  CreditCard,
  Smartphone,
  Landmark,
  ChevronDown,
  ChevronUp,
  Lock,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Tag
} from 'lucide-react';

import { PageTransition } from '../components/PageTransition';
import { formatPrice, getCurrency, getSite } from '../utils/currency';
import { trackEvent } from '../analytics/analytics';
import { trackCheckoutState, hashString } from '../utils/shopEvents';

// --- UI Components ---

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className, ...props }) => (
  <div className="relative w-full group">
    <input
      {...props}
      placeholder=" "
      className={`peer w-full pt-6 pb-2 px-3 rounded-lg border border-gray-200 focus:border-[#2b4736] focus:ring-1 focus:ring-[#2b4736] outline-none transition-all text-[14px] bg-white text-[#333] shadow-sm placeholder-transparent ${className || ''}`}
    />
    <label className="absolute left-3 top-4 text-gray-500 text-[14px] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-[#2b4736] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px] pointer-events-none">
      {label}
    </label>
  </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, className, ...props }) => (
  <div className="relative w-full group">
    <select
      {...props}
      className={`peer w-full pt-6 pb-2 px-3 pr-10 rounded-lg border border-gray-200 focus:border-[#2b4736] focus:ring-1 focus:ring-[#2b4736] outline-none transition-all text-[14px] bg-white appearance-none text-[#333] shadow-sm cursor-pointer ${className || ''}`}
    >
      {children}
    </select>
    <label className="absolute left-3 top-1.5 text-[11px] text-gray-500 pointer-events-none">
      {label}
    </label>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[18px] font-bold text-[#1f3a34] mb-4 tracking-tight flex items-center gap-2">
    {children}
  </h2>
);

// --- Main Page ---

export const CheckoutPage: React.FC = () => {
  const {
    items,
    cartTotal,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    finalTotal
  } = useCart();
  const { user } = useAuth(); // Get current user
  const [isOrderSummaryOpenMobile, setIsOrderSummaryOpenMobile] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');

  // Tracking Handler
  const handleEmailBlur = async () => {
    if (email && email.includes('@')) {
      const hash = await hashString(email);
      trackCheckoutState({
        customer: {
          emailEntered: true,
          emailHash: hash
        }
      });
    }
  };

  // Form State
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState(() => {
    // Domain-based country selection
    const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');
    return isCH ? 'Schweiz' : 'Deutschland';
  });

  const shippingCost = 0;
  const total = cartTotal + shippingCost;

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [validationMessage, setValidationMessage] = useState<string>('');

  // Refs for scrolling to first error
  const emailRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLDivElement>(null);
  const lastNameRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const zipRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load: No more automatic creation. We call on click.
  // 1. Initial Load: Track begin_checkout
  const hasTrackedCheckout = useRef(false);
  useEffect(() => {
    if (cartTotal > 0 && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true;
      trackEvent('begin_checkout', {
        currency: getCurrency(),
        value: finalTotal || cartTotal
      });

      import('../utils/shopEvents').then(({ trackShopEvent }) => {
        trackShopEvent({
          event: 'begin_checkout',
          total: finalTotal || cartTotal,
          quantity: items.reduce((acc, item) => acc + item.quantity, 0),
          cart_total: finalTotal || cartTotal,
          currency: getCurrency(),
          items: items.map(item => ({
            product_id: item.sku || item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price
          }))
        });

        // NEW: Live Checkout State
        trackCheckoutState({
          status: 'active',
          step: 'address',
          cart: {
            total: finalTotal || cartTotal,
            currency: getCurrency(),
            items: items.map(item => ({
              product_id: item.sku || item.id,
              title: item.title,
              quantity: item.quantity,
              price: item.price
            }))
          }
        });
      });
    }
  }, [cartTotal, finalTotal, items]);

  // 3. Update Payment Intent with Address (Debounced)
  useEffect(() => {
    if (!clientSecret) return;

    // Extract ID (pi_...) from clientSecret (pi_..._secret_...)
    const paymentIntentId = clientSecret.split('_secret')[0];

    const timer = setTimeout(() => {
      // Only update if we have at least partial useful info
      if (firstName && lastName) {
        console.log("🔵 Updating PI with address metadata...");
        fetch('https://apiv2-tbtmo7azvq-uc.a.run.app/update-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId,
            shipping: {
              name: `${firstName} ${lastName}`,
              street: address,
              zip: zip,
              city: city,
              country: country
            }
          })
        })
          .then(res => res.json())
          .then(d => {
            if (d.success) console.log("🟢 Shipping Address synced to Stripe");
          })
          .catch(err => console.error("❌ Failed to update PI address", err));
      }
    }, 1500); // 1.5s Debounce to avoid spamming while typing

    return () => clearTimeout(timer);
  }, [firstName, lastName, address, zip, city, country, clientSecret]);

  // 2. Validation Helper
  const validateForm = () => {
    const newErrors: any = {};
    if (!email || !email.includes('@')) newErrors.email = true;
    if (firstName.length < 2) newErrors.firstName = true;
    if (lastName.length < 2) newErrors.lastName = true;
    if (address.length < 3) newErrors.address = true;
    if (city.length < 2) newErrors.city = true;
    if (zip.length < 4) newErrors.zip = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setValidationMessage('Bitte fülle alle markierten Pflichtfelder aus.');

      // Scroll to first error field
      const firstErrorField = Object.keys(newErrors)[0];
      const refMap: { [key: string]: React.RefObject<HTMLDivElement> } = {
        email: emailRef,
        firstName: firstNameRef,
        lastName: lastNameRef,
        address: addressRef,
        zip: zipRef,
        city: cityRef
      };

      const targetRef = refMap[firstErrorField];
      if (targetRef?.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setValidationMessage('');
    }

    return Object.keys(newErrors).length === 0;
  };

  // Clear individual field error on change
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });

      // Clear validation message if no more errors
      if (Object.keys(errors).length === 1) {
        setValidationMessage('');
      }
    }
  };

  const billingDetails = {
    name: `${firstName} ${lastName}`,
    email: email,
    address: {
      line1: address,
      city: city,
      postal_code: zip,
      country: country === 'Deutschland' ? 'DE' : (country === 'Österreich' ? 'AT' : 'CH'),
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-[#333]">

      {/* Header Strip */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-[1150px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img
              src="/logo-mamoru.png"
              alt="MAMORU MOEBEL"
              className="h-[38px] md:h-[50px] w-auto"
            />
          </Link>
          <Link to="/cart" className="text-gray-500 hover:text-[#2b4736] hover:bg-gray-50 px-3 py-1.5 rounded-full transition-all text-[13px] font-bold flex items-center gap-2 group">
            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Warenkorb</span>
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
            <span className="text-[13px]">{isOrderSummaryOpenMobile ? 'Bestellübersicht ausblenden' : 'Bestellübersicht anzeigen'}</span>
            {isOrderSummaryOpenMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
          <span className="text-[17px] font-bold text-[#333]">{formatPrice(total || 0)}</span>
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
          />
        </div>
      )}

      {/* Main Layout: Split Screen Container */}
      <div className="max-w-[1150px] mx-auto min-h-screen lg:grid lg:grid-cols-[58%_42%]">

        {/* LEFT COLUMN: Checkout Form */}
        <div className="w-full pt-8 pb-20 px-4 md:px-8 lg:pr-14 bg-white border-r border-transparent lg:border-gray-100">

          {/* Form Content */}
          <div className="space-y-10 animate-fade-in">

            {/* Kontakt */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <SectionTitle>Kontakt</SectionTitle>
                <span className="text-[13px] text-gray-500">Haben Sie ein Konto? <Link to="/login" className="text-[#2b4736] font-medium hover:underline">Anmelden</Link></span>
              </div>
              <div className="space-y-4">
                <div ref={emailRef}>
                  <InputField
                    label="E-Mail-Adresse"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    className={errors.email ? "border-red-400 bg-red-50/50" : ""}
                    onBlur={handleEmailBlur}
                  />
                </div>
                <div className="flex items-center gap-3 ml-1 group cursor-pointer">
                  <div className="relative flex items-center">
                    <input type="checkbox" id="newsletter" className="peer w-5 h-5 rounded border-gray-300 text-[#2b4736] focus:ring-[#2b4736] cursor-pointer transition-all checked:bg-[#2b4736] checked:border-transparent" />
                  </div>
                  <label htmlFor="newsletter" className="text-[13px] text-gray-600 cursor-pointer select-none group-hover:text-[#2b4736] transition-colors font-medium">Ich möchte exklusive Angebote & Neuigkeiten erhalten</label>
                </div>
              </div>
            </section>

            {/* Lieferadresse */}
            <section>
              <SectionTitle>Lieferadresse</SectionTitle>
              <div className="space-y-4">
                {/* Domain-based country - read-only */}
                <div className="relative w-full group">
                  <input
                    type="text"
                    value={country}
                    readOnly
                    className="peer w-full pt-6 pb-2 px-3 rounded-lg border border-gray-200 outline-none text-[14px] bg-gray-50 text-[#333] cursor-not-allowed"
                  />
                  <label className="absolute left-3 top-1.5 text-[11px] text-gray-500 pointer-events-none">
                    Land / Region
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div ref={firstNameRef}>
                    <InputField
                      label="Vorname"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        clearFieldError('firstName');
                      }}
                      className={errors.firstName ? "border-red-400 bg-red-50/50" : ""}
                    />
                  </div>
                  <div ref={lastNameRef}>
                    <InputField
                      label="Nachname"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        clearFieldError('lastName');
                      }}
                      className={errors.lastName ? "border-red-400 bg-red-50/50" : ""}
                    />
                  </div>
                </div>

                <InputField label="Firma (optional)" />
                <div ref={addressRef}>
                  <InputField
                    label="Adresse"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      clearFieldError('address');
                    }}
                    className={errors.address ? "border-red-400 bg-red-50/50" : ""}
                  />
                </div>
                <InputField label="Wohnung, Zimmer, usw. (optional)" />

                <div className="grid grid-cols-[1fr_2fr] gap-4">
                  <div ref={zipRef}>
                    <InputField
                      label="PLZ"
                      value={zip}
                      onChange={(e) => {
                        setZip(e.target.value);
                        clearFieldError('zip');
                      }}
                      className={errors.zip ? "border-red-400 bg-red-50/50" : ""}
                    />
                  </div>
                  <div ref={cityRef}>
                    <InputField
                      label="Stadt"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        clearFieldError('city');
                      }}
                      className={errors.city ? "border-red-400 bg-red-50/50" : ""}
                    />
                  </div>
                </div>

                <div className="relative">
                  <InputField label="Telefon (für Rückfragen)" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 group/tooltip">
                    <span className="text-[10px] font-bold border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 text-gray-400 cursor-help">?</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Versandart */}
            <section>
              <SectionTitle>Versandart</SectionTitle>
              <div className="border border-[#e5e5e5] rounded-lg overflow-hidden bg-gray-50/50 p-1">
                <div className="flex items-center justify-between p-4 bg-white rounded-[4px] shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f0f9f4] flex items-center justify-center text-[#2b4736]">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-[#111]">Standardversand</span>
                      <span className="text-[11px] text-gray-500 font-medium">2-5 Werktage • Mit Sendungsverfolgung</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#1f3a34] text-[14px]">Kostenlos</span>
                </div>
              </div>
            </section>

            {/* Zahlung */}
            <section className="animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <SectionTitle>Zahlung</SectionTitle>
                <div className="flex items-center gap-1 text-gray-400">
                  <Lock className="w-3 h-3" />
                  <span className="text-[11px] font-medium">SSL-Verschlüsselt</span>
                </div>
              </div>

              <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 shadow-sm">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 font-medium">Ihr Warenkorb ist leer.</p>
                    <Link to="/shop" className="text-[#2b4736] text-xs font-bold hover:underline mt-2 inline-block">Zurück zum Shop</Link>
                  </div>
                ) : items.length > 0 ? (
                  <StripePaymentForm
                    billingDetails={billingDetails}
                    validateForm={validateForm}
                    items={items}
                    userId={user?.uid || null}
                    site={getSite()}
                    couponCode={couponCode}
                    finalTotal={finalTotal}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 font-medium">Ihr Warenkorb ist leer.</p>
                    <Link to="/shop" className="text-[#2b4736] text-xs font-bold hover:underline mt-2 inline-block">Zurück zum Shop</Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>


        {/* RIGHT COLUMN: Order Summary */}
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
            />

            {/* Trust Badges in Sidebar */}
            <div className="mt-8 grid grid-cols-2 gap-3 opacity-60">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                <ShieldCheck className="w-4 h-4" /> Sicherer Checkout
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                <Lock className="w-4 h-4" /> 256-bit SSL
              </div>
            </div>
          </div>
        </div>

      </div >
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
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items, subtotal, shipping, total, finalTotal,
  couponCode, couponDiscount, applyCoupon, removeCoupon
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  return (
    <div className="space-y-6">

      {/* Product List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar py-4 pl-1">
        {items.map((item) => {
          // Domain-based price selection (same as CartContext)
          const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');
          const price = isCH ? (item as any).price_ch ?? item.price : item.price;
          const pricePrev = isCH ? (item as any).pricePrev_ch ?? (item as any).pricePrev : (item as any).pricePrev;
          const effectivePrice = (pricePrev && pricePrev < price) ? pricePrev : price;

          return (
            <div key={item.id} className="flex gap-4 items-center group">
              <div className="relative w-16 h-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 shadow-sm overflow-visible">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                <span className="absolute -top-2.5 -right-2.5 bg-[#666] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white z-10">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[13px] font-bold text-[#333] leading-snug line-clamp-2 mb-0.5 group-hover:text-[#2b4736] transition-colors">{item.title}</p>
                <p className="text-[11px] text-gray-500 truncate font-medium">{item.category}</p>
              </div>
              <div className="text-[14px] font-bold text-[#333] whitespace-nowrap">
                {formatPrice(effectivePrice * item.quantity)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-gray-200 w-full my-4"></div>

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
              <span className="text-[#1f3a34] text-[13px] font-bold">Aktiv</span>
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
            <span>Rabatt ({couponCode})</span>
            {/* Dynamic calculation of actual discount amount based on totals */}
            <span>-{formatPrice(Math.max(0, (subtotal + shipping) - finalTotal))}</span>
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
    </div>
  );
};

export default CheckoutPage;
