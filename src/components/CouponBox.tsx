
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

// Color Constants based on new design requirements
const COLORS = {
  border: '#2b4736',      // Mamoru Green border (changed from orange)
  brandGreen: '#0E4F34',  // Webseiten-Grün (Left block & Button)
  priceRed: '#D63C1E',    // Signal Red for price
  textMain: '#1C1C1C',    // Dark text
  textGray: '#4B5563',    // Description text
  background: '#ffffff',  // White inner background
  pageBg: '#f7f7f7',      // Matches the global page background for the notch effect
};

export interface Coupon {
  discount: number;
  code: string;
  description: string;
  finalPrice: number;
}

interface CouponBoxProps {
  coupons: Coupon[];
  currency?: string;
  footerText?: string;
}

export const CouponBox: React.FC<CouponBoxProps> = ({ coupons, currency = '€', footerText }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!coupons || coupons.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full mt-4 mb-2">
      {coupons.map((coupon, index) => (
        <div
          key={index}
          className="relative flex w-full min-h-[65px] rounded-lg overflow-hidden shadow-sm"
        >
          {/* Left Block: Significantly Narrower (Pink Rectangle Size) */}
          <div
            className="w-[55px] sm:w-[65px] flex-shrink-0 flex flex-col items-center justify-center text-white relative z-10 p-1 text-center"
            style={{ backgroundColor: COLORS.brandGreen }}
          >
            <span className="text-lg sm:text-xl font-black leading-none tracking-tight">-{coupon.discount}%</span>

            {/* Dashed Separator Line Overlay */}
            <div className="absolute right-0 top-1 bottom-1 border-r-2 border-dashed border-white/30"></div>
          </div>

          {/* Right Block: Content */}
          <div
            className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:pr-4 bg-white border-y border-r rounded-r-lg relative z-0 gap-2"
            style={{ borderColor: COLORS.border }}
          >
            {/* Info Text Area */}
            <div className="flex flex-col justify-center min-w-0 flex-1 ml-1 self-center w-full">
              <p className="text-[11px] sm:text-[12px] leading-snug font-medium mb-1 line-clamp-1" style={{ color: COLORS.textGray }}>
                {coupon.description}
              </p>

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-xs font-bold whitespace-nowrap bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 tracking-wide">
                  Code: {coupon.code}
                </span>
                <span
                  className="text-sm sm:text-base font-black whitespace-nowrap tracking-tight"
                  style={{ color: COLORS.priceRed }}
                >
                  Endpreis: {coupon.finalPrice.toFixed(2)} {currency}
                </span>
              </div>
            </div>

            {/* Copy Button - Adjusted to 'Kopieren' and size */}
            <button
              onClick={() => handleCopy(coupon.code)}
              className="flex-shrink-0 flex items-center justify-center px-4 py-1.5 rounded-md text-[11px] font-bold active:scale-[0.98] shadow-sm w-auto mt-0 h-fit self-end sm:self-center"
              style={{
                backgroundColor: copiedCode === coupon.code ? '#d1fae5' : COLORS.brandGreen,
                color: copiedCode === coupon.code ? '#065f46' : '#ffffff'
              }}
            >
              {copiedCode === coupon.code ? (
                <>
                  <Check className="w-3 h-3 mr-1.5" />
                  Kopiert
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1.5 opacity-90" />
                  Kopieren
                </>
              )}
            </button>

            {/* Ticket Notch (Circle Cutout) */}
            <div
              className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full z-10"
              style={{
                backgroundColor: COLORS.pageBg,
                border: `1px solid ${COLORS.border}`,
                boxShadow: 'inset 2px 0 3px rgba(0,0,0,0.05)'
              }}
            ></div>

            {/* Fix border overlap of notch */}
            <div
              className="absolute -right-[8px] top-1/2 -translate-y-1/2 w-[10px] h-[16px] z-20"
              style={{ backgroundColor: COLORS.pageBg }}
            ></div>
          </div>
        </div>
      ))}

      {/* Subtle Helper Text */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        {footerText || 'Code im Warenkorb oder an der Kasse einfügen.'}
      </p>
    </div>
  );
};
