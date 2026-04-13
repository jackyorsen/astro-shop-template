import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ShieldCheck, Truck } from 'lucide-react';
import { getSite, convertPrice, getCurrency } from '../utils/currency';

const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentFormProps {
    billingDetails: any;
    validateForm: () => boolean;
    items: any[];
    userId: string | null;
    site: string;
    couponCode: string | null;
    finalTotal: number;
}

// Inner Form Component
const PaymentForm = ({ billingDetails, validateForm, isUpdating }: { billingDetails: any, validateForm: () => boolean, isUpdating: boolean }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log("🔥 SUBMIT CLICKED - CONFIRMING PAYMENT");

        if (!stripe || !elements) {
            console.warn("⚠️ Stripe not ready");
            return;
        }

        // ✅ FRONTEND VALIDATION
        const isValid = validateForm();
        if (!isValid) {
            setValidationError('Bitte fülle alle markierten Pflichtfelder aus.');
            return;
        }
        setValidationError('');
        setErrorMessage('');
        setIsProcessing(true);

        // ❌ NO more deferred intent creation here. 
        // We strictly Confirm the existing PaymentIntent (from clientSecret)

        try {
            // Confirm Payment
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/success`,
                    receipt_email: billingDetails.email,
                    payment_method_data: {
                        billing_details: billingDetails
                    },
                    shipping: {
                        name: billingDetails.name,
                        address: billingDetails.address
                    }
                },
            });

            if (error) {
                console.error('Stripe Confirm Error:', error);
                setErrorMessage(error.message || 'Zahlung fehlgeschlagen.');
                setIsProcessing(false);
            }
            // If success, Stripe redirects automatically
        } catch (err: any) {
            console.error('Unexpected Error:', err);
            setErrorMessage(err.message || 'Ein unerwarteter Fehler ist aufgetreten.');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Custom Payment Method Selection with Radio Buttons */}
            <div className="space-y-3">
                <PaymentElement
                    options={{
                        layout: {
                            type: 'accordion',
                            defaultCollapsed: false,
                            radios: true,
                            spacedAccordionItems: true
                        }
                    }}
                />
            </div>

            {validationError && (
                <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded border border-amber-200 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">⚠️</span>
                    <span className="font-medium">{validationError}</span>
                </div>
            )}

            {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                    {errorMessage}
                </div>
            )}

            <div className="mt-8 mb-4">
                <button
                    type="submit"
                    disabled={!stripe || isProcessing || isUpdating}
                    className="w-full bg-[#1f3a34] text-white font-bold text-[17px] py-4 rounded-[5px] hover:bg-[#162925] transition-all transform active:scale-[0.99] shadow-lg hover:shadow-xl opacity-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUpdating ? 'Rabatt wird geladen...' : isProcessing ? 'Verarbeite...' : 'Jetzt bezahlen'}
                </button>
            </div>
        </form>
    );
};

// Main Component that manages state and fetches ClientSecret
export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ billingDetails, validateForm, items, userId, site, couponCode, finalTotal }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Track which couponCode the current PI was created with.
    // undefined = no PI fetched yet. Comparing to couponCode gives us synchronous isUpdating.
    const [piCouponCode, setPiCouponCode] = useState<string | null | undefined>(undefined);

    // isUpdating is true IMMEDIATELY when coupon changes (same render, no async gap)
    // This prevents TWINT from being clickable before the new PI is ready
    const isUpdating = piCouponCode === undefined || piCouponCode !== couponCode;

    // Fetch PaymentIntent on mount
    React.useEffect(() => {
        const fetchPaymentIntent = async () => {
            // Domain-based price selection for Payment Intent
            const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');

            // Use finalTotal passed from CheckoutPage instead of recalculating
            // CH needs to pass total, DE doesn't
            const requestTotal = site === 'CH' ? finalTotal : undefined;

            // Choose endpoint based on site
            const endpoint = site === 'CH'
                ? 'https://apiv2-tbtmo7azvq-uc.a.run.app/create-payment-intent-ch'
                : 'https://apiv2-tbtmo7azvq-uc.a.run.app/create-payment-intent-de';

            try {
                console.log(`🎫 PI Fetch: coupon=${couponCode}, total=${requestTotal}, site=${site}`);
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cartItems: items.map(item => {
                            // Send domain-based prices to backend
                            const price = isCH ? (item as any).price_ch ?? item.price : item.price;
                            const pricePrev = isCH ? (item as any).pricePrev_ch ?? (item as any).pricePrev : (item as any).pricePrev;

                            return {
                                id: item.id || item.sku,
                                quantity: item.quantity,
                                price: price,
                                pricePrev: pricePrev,
                                name: item.name,
                                title: item.title,
                                image: item.image
                            };
                        }),
                        userId: userId || 'guest',
                        shippingAddress: {
                            name: billingDetails.name,
                            ...billingDetails.address
                        },
                        couponCode: couponCode || null, // ✅ Pass Coupon Code
                        ...(site === 'CH' && { total: requestTotal }) // Only send total for CH
                    }),
                });

                const data = await response.json();
                console.log(`💳 PI Response:`, data);
                if (!response.ok) {
                    throw new Error(data.error || 'Fehler beim Laden der Zahlung');
                }
                setClientSecret(data.clientSecret);
                setPiCouponCode(couponCode); // Mark PI as created with this coupon → isUpdating becomes false
            } catch (err: any) {
                console.error("PI Creation Error:", err);
                setError("Zahlungssystem konnte nicht geladen werden. Bitte Seite neu laden.");
                setPiCouponCode(couponCode); // Even on error, unblock UI with current coupon
            }
        };

        if (items.length > 0) {
            fetchPaymentIntent();
        }
    }, [items, userId, site, couponCode, finalTotal]); // Re-fetch only if cart/user/site/coupon/total changes

    if (error) {
        return <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">{error}</div>;
    }

    if (!clientSecret) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3a34]"></div>
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#1f3a34',
                colorBackground: '#ffffff',
                colorText: '#111111',
                colorDanger: '#df1b41',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                spacingUnit: '4px',
                borderRadius: '5px',
                fontSizeBase: '14px',
                colorTextSecondary: '#6b7280',
            },
            rules: {
                '.Tab': {
                    border: '1px solid #e5e5e5',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                },
                '.Tab:hover': {
                    borderColor: '#2b4736',
                    backgroundColor: '#fafafa',
                },
                '.Tab--selected': {
                    backgroundColor: '#f0f9f4',
                    borderColor: '#2b4736',
                    boxShadow: '0 0 0 1px #2b4736',
                },
                '.Tab--selected:hover': {
                    backgroundColor: '#e8f5ee',
                },
                '.Input': {
                    borderRadius: '6px',
                    padding: '12px',
                },
                '.Label': {
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px',
                }
            }
        },
    };

    return (
        <div className="relative">
            {isUpdating && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3a34]"></div>
                </div>
            )}
            <div className={isUpdating ? 'pointer-events-none opacity-60 select-none' : ''}>
                <Elements key={clientSecret} stripe={stripePromise} options={options}>
                    <PaymentForm billingDetails={billingDetails} validateForm={validateForm} isUpdating={isUpdating} />
                </Elements>
            </div>
        </div>
    );
};
