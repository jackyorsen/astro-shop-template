import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const SuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    const { clearCart, cartTotal, items, finalTotal, couponCode } = useCart();

    useEffect(() => {
        // Clear cart on successful payment load
        if (paymentIntentClientSecret) {
            if (items.length > 0) {
                import('../utils/shopEvents').then(({ trackShopEvent, trackCheckoutState }) => {
                    const isCH = window.location.hostname.endsWith('.ch');
                    trackShopEvent({
                        event: 'purchase',
                        total: finalTotal,
                        quantity: items.reduce((acc, i) => acc + i.quantity, 0),
                        orderId: paymentIntentClientSecret.split('_secret')[0],
                        currency: isCH ? 'CHF' : 'EUR',

                        // Coupon Stats
                        coupon_used: !!couponCode,
                        coupon_code: couponCode || undefined,
                        original_price: cartTotal,
                        final_price: finalTotal,
                        discount_percent: (couponCode && cartTotal > 0) ? Math.round(((cartTotal - finalTotal) / cartTotal) * 100) : 0,

                        items: items.map(item => ({
                            product_id: item.sku || item.id,
                            title: item.title,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    });

                    // Update Session State -> Completed
                    trackCheckoutState({
                        status: 'completed',
                        step: 'confirm'
                    });
                });
            }
            clearCart();
        }
    }, [paymentIntentClientSecret, clearCart, items, cartTotal]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6">
                    <CheckCircle className="w-10 h-10 text-[#2b4736]" />
                </div>

                <h1 className="text-2xl font-bold text-[#111] mb-2">Zahlung erfolgreich!</h1>
                <p className="text-gray-600 mb-8">
                    Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
                </p>

                <Link
                    to="/shop"
                    className="block w-full bg-[#1f3a34] text-white font-bold py-3 rounded-[5px] hover:bg-[#162925] transition-colors"
                >
                    Weiter einkaufen
                </Link>
            </div>
        </div>
    );
};

export default SuccessPage;
