import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firestore';
import { Package, Search, Truck, MapPin, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface TrackingEvent {
    time: string;
    location: string;
    description: string;
}

interface Order {
    id: string;
    status: string;
    tracking?: {
        carrier: string;
        trackingNumbers: string[];
        shippedAt: any;
        status?: string;
        events?: TrackingEvent[];
        lastUpdate?: any;
    };
    customerEmail: string;
    shippingAddress?: any;
}

export const TrackingPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');
    const [externalTracking, setExternalTracking] = useState<{ number: string; carrier: string } | null>(null);

    const detectCarrier = (trackingNumber: string): string | null => {
        if (/^\d{14}$/.test(trackingNumber)) return 'DPD';
        if (/^\d{12,20}$/.test(trackingNumber)) return 'DHL';
        if (/^1Z[A-Z0-9]{16}$/i.test(trackingNumber)) return 'UPS';
        if (/^\d{12,15}$/.test(trackingNumber)) return 'FedEx';
        if (/^\d{11}$/.test(trackingNumber)) return 'GLS';
        if (/^\d+$/.test(trackingNumber)) return 'DPD';
        return null;
    };

    const getCarrierTrackingUrl = (carrier: string, trackingNumber: string): string => {
        const urls: Record<string, string> = {
            'DPD': `https://tracking.dpd.de/parcelstatus?query=${trackingNumber}&locale=de_DE`,
            'DHL': `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${trackingNumber}`,
            'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
            'Hermes': `https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#${trackingNumber}`,
            'GLS': `https://gls-group.eu/DE/de/paketverfolgung?match=${trackingNumber}`,
            'FedEx': `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`
        };
        return urls[carrier] || `https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`;
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError('Bitte Bestellnummer oder Sendungsnummer eingeben');
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);
        setExternalTracking(null);

        try {
            const ordersRef = collection(db, 'orders');
            let snapshot;

            // Try to find by order ID
            const orderIdQuery = query(ordersRef, where('__name__', '==', searchQuery.trim()));
            snapshot = await getDocs(orderIdQuery);

            // If not found, try by tracking number
            if (snapshot.empty) {
                const trackingQuery = query(
                    ordersRef,
                    where('tracking.trackingNumbers', 'array-contains', searchQuery.trim())
                );
                snapshot = await getDocs(trackingQuery);
            }

            if (!snapshot.empty) {
                // Order found in Firestore
                const orderData = {
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data()
                } as Order;

                setOrder(orderData);
            } else {
                // Not found - show external tracking option
                const carrier = detectCarrier(searchQuery.trim());

                if (!carrier) {
                    setError('Sendungsnummer-Format nicht erkannt. Bitte überprüfen Sie die Nummer.');
                } else {
                    setExternalTracking({
                        number: searchQuery.trim(),
                        carrier: carrier
                    });
                }
            }

        } catch (err: any) {
            console.error('Search error:', err);
            setError('Fehler bei der Suche.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'delivered':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (timestamp: any): string => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2b4736] rounded-full mb-4">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Sendungsverfolgung</h1>
                    <p className="text-gray-600">Verfolgen Sie Ihre Bestellung in Echtzeit</p>
                </div>

                {/* Search Box */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Bestellnummer oder Sendungsnummer..."
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#2b4736] focus:ring-2 focus:ring-[#2b4736]/20 transition-all text-lg"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-8 py-4 bg-[#2b4736] text-white rounded-xl font-semibold hover:bg-[#1f3a34] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Suchen...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Suchen
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* External Tracking (Ricardo/eBay etc.) */}
                {externalTracking && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Truck className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sendung gefunden!</h2>
                            <p className="text-gray-600">Ihre Sendung wird von <span className="font-semibold">{externalTracking.carrier}</span> zugestellt</p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-[#2b4736] rounded-xl p-8">
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-600 mb-2">Sendungsnummer</p>
                                <p className="text-2xl font-mono font-bold text-[#2b4736] mb-4">{externalTracking.number}</p>
                                <p className="text-lg font-semibold text-gray-700">Carrier: {externalTracking.carrier}</p>
                            </div>

                            <a
                                href={getCarrierTrackingUrl(externalTracking.carrier, externalTracking.number)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full bg-[#2b4736] text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-[#1f3a34] transition-all shadow-lg hover:shadow-xl"
                            >
                                <Truck className="w-6 h-6" />
                                Auf {externalTracking.carrier}.de verfolgen
                                <ExternalLink className="w-5 h-5" />
                            </a>

                            <p className="text-center text-sm text-gray-600 mt-4">
                                Klicken Sie hier, um die aktuelle Position und alle Details Ihrer Sendung direkt bei {externalTracking.carrier} zu sehen
                            </p>
                        </div>
                    </div>
                )}

                {/* Shop Order Results */}
                {order && (
                    <div className="space-y-6">
                        {/* Order Info */}
                        {order.customerEmail && (
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                            Bestellung #{order.id.slice(-8)}
                                        </h2>
                                        <p className="text-gray-600">{order.customerEmail}</p>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                                        {order.status === 'paid' && 'Bezahlt'}
                                        {order.status === 'shipped' && 'Versendet'}
                                        {order.status === 'delivered' && 'Zugestellt'}
                                    </span>
                                </div>

                                {/* Timeline */}
                                <div className="relative">
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    <div className="space-y-6">
                                        {[
                                            { label: 'Bezahlt', active: true, icon: CheckCircle },
                                            { label: 'Versendet', active: order.status === 'shipped' || order.status === 'delivered', icon: Truck },
                                            { label: 'Zugestellt', active: order.status === 'delivered', icon: Package }
                                        ].map((step, idx) => (
                                            <div key={idx} className="relative flex items-center gap-4">
                                                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${step.active ? 'bg-[#2b4736]' : 'bg-gray-200'
                                                    }`}>
                                                    <step.icon className={`w-6 h-6 ${step.active ? 'text-white' : 'text-gray-400'}`} />
                                                </div>
                                                <span className={`text-lg font-semibold ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tracking Info */}
                        {order.tracking && order.tracking.trackingNumbers && order.tracking.trackingNumbers.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Truck className="w-6 h-6 text-[#2b4736]" />
                                    Sendungsverfolgung
                                </h3>

                                {order.tracking.trackingNumbers.map((trackingNumber, idx) => {
                                    const trackingUrl = getCarrierTrackingUrl(order.tracking!.carrier, trackingNumber);
                                    const hasEvents = order.tracking?.events && order.tracking.events.length > 0;

                                    return (
                                        <div key={idx} className="mb-6 last:mb-0">
                                            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-[#2b4736] rounded-xl p-6 mb-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Sendungsnummer</p>
                                                        <p className="text-xl font-mono font-bold text-[#2b4736]">{trackingNumber}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600 mb-1">Carrier</p>
                                                        <p className="text-lg font-bold text-gray-900">{order.tracking!.carrier}</p>
                                                    </div>
                                                </div>

                                                {order.tracking?.status && (
                                                    <div className="mb-4 p-3 bg-white rounded-lg">
                                                        <p className="text-sm text-gray-600 mb-1">Status</p>
                                                        <p className="font-semibold text-gray-900">{order.tracking.status}</p>
                                                    </div>
                                                )}

                                                {order.tracking?.lastUpdate && (
                                                    <p className="text-xs text-gray-500 mb-4">
                                                        Letztes Update: {formatDate(order.tracking.lastUpdate)}
                                                    </p>
                                                )}

                                                <a
                                                    href={trackingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-3 w-full bg-[#2b4736] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#1f3a34] transition-all"
                                                >
                                                    <Truck className="w-5 h-5" />
                                                    Auf {order.tracking!.carrier}.de verfolgen
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>

                                            {/* Tracking Events from Webhook */}
                                            {hasEvents && (
                                                <div className="bg-gray-50 rounded-xl p-6">
                                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                                        <MapPin className="w-5 h-5 text-[#2b4736]" />
                                                        Sendungsverlauf
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {order.tracking!.events!.map((event, eventIdx) => (
                                                            <div key={eventIdx} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200">
                                                                <div className="flex-shrink-0">
                                                                    <div className="w-2 h-2 bg-[#2b4736] rounded-full mt-2"></div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <p className="font-semibold text-gray-900">{event.description}</p>
                                                                        <span className="text-sm text-gray-500 flex items-center gap-1 ml-4">
                                                                            <Clock className="w-3 h-3" />
                                                                            {event.time}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {event.location}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Lieferadresse</h3>
                                <div className="text-gray-700 leading-relaxed">
                                    <p className="font-semibold">{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>{order.shippingAddress.zip} {order.shippingAddress.city}</p>
                                    <p>{order.shippingAddress.country}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackingPage;
