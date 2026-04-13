import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, Timestamp, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firestore';
import { Package, Search, ChevronRight, CheckCircle, XCircle, RefreshCw, Clock, ExternalLink, Truck, X, Trash2, Square, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

interface Order {
    id: string; // The Document ID (e.g. pi_...)
    eventId?: string;
    status: 'paid' | 'failed' | 'refunded' | 'pending' | 'shipped';
    amount: number; // in cents or currency units? Firestore has amount_cents and amount. We should check.
    // Based on previous turn: amount is EUR (e.g. 50.00), amount_cents is integers.
    currency: string;
    customerEmail: string | null;
    customerId?: string;
    stripePaymentIntentId?: string;
    source?: string;
    userId?: string;
    createdAt: Timestamp | null;
    items?: any[];
    shippingAddress?: any;
    tracking?: {
        carrier: string;
        trackingNumbers: string[];
        shippedAt: Timestamp;
    };
    site?: string;
    metadata?: {
        coupon_code?: string;
        discount_amount?: string;
        [key: string]: any;
    };
}

export const AdminOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const { adminSite } = useAdmin();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Tracking Modal State
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [trackingNumbers, setTrackingNumbers] = useState<string[]>(['']);
    const [carrier, setCarrier] = useState('DPD');
    const [sendingShipment, setSendingShipment] = useState(false);

    // Bulk Actions State
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedOrderIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedOrderIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.size === filteredOrders.length) {
            setSelectedOrderIds(new Set());
        } else {
            setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
        }
    };

    const handleDeleteOrders = async (idsToDelete: string[]) => {
        if (idsToDelete.length === 0) return;

        const confirmMessage = idsToDelete.length === 1
            ? 'Möchten Sie diese Bestellung wirklich endgültig löschen?'
            : `Möchten Sie ${idsToDelete.length} Bestellungen wirklich endgültig löschen?`;

        if (!window.confirm(confirmMessage)) return;

        try {
            const batch = writeBatch(db);
            idsToDelete.forEach(id => {
                const ref = doc(db, 'orders', id);
                batch.delete(ref);
            });
            await batch.commit();

            // Cleanup local state
            const newSet = new Set(selectedOrderIds);
            idsToDelete.forEach(id => newSet.delete(id));
            setSelectedOrderIds(newSet);

            if (selectedOrder && idsToDelete.includes(selectedOrder.id)) {
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error("Error deleting orders:", error);
            alert("Fehler beim Löschen der Bestellungen.");
        }
    };


    // Realtime Listener
    useEffect(() => {
        console.log('🔐 AUTH CHECK:', {
            user: user,
            userId: user?.uid,
            userEmail: user?.email
        });

        if (!db) {
            console.error('❌ DB is null!');
            return;
        }

        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));

        console.log("Listening to orders in default DB...");

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("📊 Snapshot received, docs count:", snapshot.size);
            const fetchedOrders: Order[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                console.log("📦 Order doc:", doc.id, {
                    status: data.status,
                    amount: data.amount,
                    createdAt: data.createdAt,
                    createdAtType: data.createdAt?.constructor?.name,
                    customerEmail: data.customerEmail
                });
                fetchedOrders.push({
                    id: doc.id,
                    ...data
                } as Order);
            });
            console.log("✅ Orders fetched:", fetchedOrders.length);
            console.log("📋 Full orders array:", fetchedOrders);
            setOrders(fetchedOrders);
            setLoading(false);
        }, (error) => {
            console.error("❌ Error watching orders:", error);
            console.error("❌ Error code:", error.code);
            console.error("❌ Error message:", error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Filter Logic
    useEffect(() => {
        console.log('🔍 Filter Logic - Input:', {
            totalOrders: orders.length,
            statusFilter,
            searchTerm
        });

        let result = orders;

        if (statusFilter !== 'all') {
            const beforeFilter = result.length;
            result = result.filter(o => o.status === statusFilter);
            console.log(`📊 Status filter "${statusFilter}": ${beforeFilter} → ${result.length}`);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            const beforeSearch = result.length;
            result = result.filter(o =>
                o.id.toLowerCase().includes(lowerTerm) ||
                (o.customerEmail && o.customerEmail.toLowerCase().includes(lowerTerm)) ||
                (o.stripePaymentIntentId && o.stripePaymentIntentId.toLowerCase().includes(lowerTerm))
            );
            console.log(`🔎 Search filter "${searchTerm}": ${beforeSearch} → ${result.length}`);
        }

        console.log('✅ Final filtered orders:', result.length);
        setFilteredOrders(result);
    }, [orders, statusFilter, searchTerm]);

    const formatCurrency = (amount: number, currency: string) => {
        if (!amount && amount !== 0) return '0,00 €';

        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount);
    };

    const formatDate = (ts: Timestamp | null | undefined) => {
        if (!ts) {
            console.warn('⚠️ formatDate called with null/undefined timestamp');
            return '-';
        }

        try {
            // Check if it's a Firestore Timestamp
            if (ts && typeof ts.toDate === 'function') {
                return new Intl.DateTimeFormat('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                }).format(ts.toDate()) + ' Uhr';
            }

            // Fallback: try to parse as Date
            const date = new Date(ts as any);
            if (isNaN(date.getTime())) {
                console.error('❌ Invalid timestamp:', ts);
                return '-';
            }

            return new Intl.DateTimeFormat('de-DE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }).format(date) + ' Uhr';
        } catch (error) {
            console.error('❌ Error formatting date:', error, ts);
            return '-';
        }
    };

    const parseItems = (items?: any) => {
        if (Array.isArray(items)) {
            return items.map((item: any) => ({
                sku: item.id || item.sku || '-',
                quantity: item.quantity || 1,
                name: item.name || 'Unbekanntes Produkt',
                price: item.price !== undefined ? item.price : 0,
                image: item.image || null,
            }));
        }
        if (typeof items === 'string') {
            return items.split(',').map((entry: string) => {
                const [sku, qty] = entry.split(':');
                return {
                    sku,
                    quantity: Number(qty) || 1,
                    name: null,
                    price: null,
                    image: null
                };
            });
        }
        return [];
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" /> Paid
                    </span>
                );
            case 'refunded':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <RefreshCw className="w-3 h-3 mr-1" /> Refunded
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        <XCircle className="w-3 h-3 mr-1" /> Failed
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                    </span>
                );
            case 'shipped':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <Truck className="w-3 h-3 mr-1" /> Shipped
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {status}
                    </span>
                );
        }
    };

    const addTrackingNumberField = () => {
        setTrackingNumbers([...trackingNumbers, '']);
    };

    const removeTrackingNumberField = (index: number) => {
        if (trackingNumbers.length > 1) {
            setTrackingNumbers(trackingNumbers.filter((_, i) => i !== index));
        }
    };

    const updateTrackingNumber = (index: number, value: string) => {
        const updated = [...trackingNumbers];
        updated[index] = value;
        setTrackingNumbers(updated);
    };

    const handleDeleteTracking = async () => {
        if (!selectedOrder || !confirm('Tracking-Informationen wirklich löschen?')) return;

        try {
            const orderRef = doc(db, 'orders', selectedOrder.id);
            await updateDoc(orderRef, {
                tracking: null,
                status: 'paid'
            });
            alert('✅ Tracking-Informationen gelöscht');
        } catch (error) {
            console.error('Error deleting tracking:', error);
            alert('❌ Fehler beim Löschen');
        }
    };

    const handleSendShipmentConfirmation = async () => {
        const validNumbers = trackingNumbers.filter(n => n.trim());

        if (!selectedOrder || validNumbers.length === 0) {
            alert('Bitte mindestens eine Sendungsnummer eingeben');
            return;
        }

        setSendingShipment(true);

        try {
            // 1. Update Firestore with tracking info
            const orderRef = doc(db, 'orders', selectedOrder.id);
            await updateDoc(orderRef, {
                tracking: {
                    carrier: carrier,
                    trackingNumbers: validNumbers,
                    shippedAt: Timestamp.now()
                },
                status: 'shipped'
            });

            // 2. Call Firebase Function to send email
            const response = await fetch('https://apiv2-tbtmo7azvq-uc.a.run.app/send-shipping-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: selectedOrder.id,
                    trackingNumbers: validNumbers,
                    carrier: carrier
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || 'Failed to send shipping confirmation email');
            }

            alert('✅ Versandbestätigung erfolgreich versendet!');
            setShowTrackingModal(false);
            setTrackingNumbers(['']);
            setCarrier('DPD');

        } catch (error: any) {
            console.error('Error sending shipment confirmation:', error);
            alert(`❌ Fehler: ${error.message || 'Unbekannter Fehler'}`);
        } finally {
            setSendingShipment(false);
        }
    };

    const statusStats = {
        all: (orders || []).length,
        paid: (orders || []).filter(o => o.status === 'paid').length,
        refunded: (orders || []).filter(o => o.status === 'refunded').length,
        failed: (orders || []).filter(o => o.status === 'failed').length,
        pending: (orders || []).filter(o => o.status === 'pending').length,
    };

    return (
        <div className="h-full bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Orders</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage and track customer orders</p>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        <div>All: {statusStats.all}</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-8 py-6 overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-6 h-full">

                    {/* LEFT PANEL: LIST */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">

                        {/* Toolbar */}
                        <div className="p-4 border-b border-gray-100 space-y-4">
                            {/* Search & Bulk Actions */}
                            <div className="relative flex items-center gap-2">
                                {selectedOrderIds.size > 0 ? (
                                    <div className="flex-1 flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                        <span className="text-sm font-bold text-red-700">{selectedOrderIds.size} ausgewählt</span>
                                        <button
                                            onClick={() => handleDeleteOrders(Array.from(selectedOrderIds))}
                                            className="text-red-700 hover:text-red-900 bg-white border border-red-200 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                            title="Ausgewählte löschen"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search order ID, email..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2b4736] focus:border-transparent transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Status Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {['all', 'paid', 'refunded', 'failed'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setStatusFilter(st)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === st
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {st.charAt(0).toUpperCase() + st.slice(1)}
                                        <span className="ml-1.5 opacity-60">
                                            {statusStats[st as keyof typeof statusStats] || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="w-6 h-6 border-2 border-[#2b4736] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Package className="w-12 h-12 mb-2 opacity-20" />
                                    <p className="text-sm">No orders found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredOrders.map(order => (
                                        <div
                                            key={order.id}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors group border-l-4 ${selectedOrder?.id === order.id ? 'bg-blue-50/50 border-[#2b4736]' : 'border-transparent'}`}
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Checkbox */}
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelection(order.id);
                                                    }}
                                                    className="mt-0.5 text-gray-400 hover:text-[#2b4736] transition-colors"
                                                >
                                                    {selectedOrderIds.has(order.id) ? (
                                                        <CheckSquare className="w-5 h-5 text-[#2b4736]" />
                                                    ) : (
                                                        <Square className="w-5 h-5" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-mono text-xs text-gray-500 truncate">#{order.id ? String(order.id).slice(0, 14) : 'N/A'}...</span>
                                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{formatDate(order.createdAt)}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-semibold text-gray-900">
                                                            {formatCurrency((order.amount || 0) / 100, order.currency || 'EUR')}
                                                        </span>
                                                        {getStatusBadge(order.status || 'pending')}
                                                    </div>

                                                    <div className="flex justify-between items-end">
                                                        <div className="text-sm text-gray-600 truncate max-w-[180px]" title={order.customerEmail ? String(order.customerEmail) : ''}>
                                                            {order.customerEmail && typeof order.customerEmail === 'string' ? order.customerEmail : '—'}
                                                        </div>
                                                        <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${selectedOrder?.id === order.id ? 'translate-x-1 text-[#2b4736]' : 'group-hover:translate-x-1'
                                                            }`} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: DETAILS */}
                    <div className={`lg:w-[480px] xl:w-[550px] flex-none transition-all duration-300 ${selectedOrder ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-50 hidden lg:block'}`}>
                        {selectedOrder ? (
                            <div className={`bg-white rounded-xl border-2 shadow-xl h-full flex flex-col overflow-hidden ${selectedOrder.site === 'CH' ? 'border-red-100' : 'border-gray-200'}`}>

                                {/* (A) Header */}
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 relative overflow-hidden">
                                    {/* Site Badge */}
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-white border-b border-l border-gray-100 rounded-bl-lg text-[10px] font-bold shadow-sm z-10">
                                        {(selectedOrder.site || 'DE') === 'DE' ? '🇩🇪 DEUTSCHLAND' : '🇨🇭 SCHWEIZ'}
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h2 className="text-xl font-bold text-[#1f3a34]">Bestellung #{selectedOrder.id ? String(selectedOrder.id).slice(-8) : 'N/A'}</h2>
                                            <p className="font-mono text-xs text-gray-400 mt-1">{selectedOrder.id ? String(selectedOrder.id) : '—'}</p>
                                        </div>
                                        {getStatusBadge(selectedOrder.status || 'pending')}
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="text-sm text-gray-500">
                                            {formatDate(selectedOrder.createdAt)}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Gesamtbetrag</p>
                                            <p className="font-bold text-2xl text-[#1f3a34]">{formatCurrency((selectedOrder.amount || 0) / 100, selectedOrder.currency || 'EUR')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-0">

                                    {/* (B) Timeline / Stepper */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="relative flex items-center justify-between">
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
                                            {[
                                                { label: 'Bezahlt', key: 'paid' },
                                                { label: 'In Bearbeitung', key: 'processing' },
                                                { label: 'Versendet', key: 'shipped' },
                                                { label: 'Zugestellt', key: 'delivered' }
                                            ].map((step, idx) => {
                                                const isActive =
                                                    step.key === 'paid' ||
                                                    (step.key === 'processing' && selectedOrder.status === 'shipped') ||
                                                    (step.key === 'shipped' && selectedOrder.status === 'shipped');

                                                return (
                                                    <div key={idx} className="flex flex-col items-center bg-white px-2">
                                                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${isActive ? 'bg-[#2b4736] border-[#2b4736]' : 'bg-gray-200 border-gray-300'} mb-2`}></div>
                                                        <span className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? 'text-[#1f3a34]' : 'text-gray-400'}`}>{step.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* (C) Products */}
                                    <div className="divide-y divide-gray-100">
                                        {parseItems(selectedOrder.items).map((item: any, idx: number) => (
                                            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex gap-4">
                                                    {/* Image */}
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                                        {item.image ? (
                                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-6 h-6" /></div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-900 truncate pr-4">{item.name && typeof item.name === 'string' ? item.name : 'Unbekanntes Produkt'}</h4>
                                                        <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {item.sku && typeof item.sku === 'string' ? item.sku : '—'}</p>

                                                        {/* Admin Internal Info Line */}
                                                        <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400 bg-gray-50/80 inline-flex px-2 py-1 rounded border border-gray-100">
                                                            <span>EK: <span className="font-mono text-gray-600">- €</span></span>
                                                            <span className="w-px h-3 bg-gray-200"></span>
                                                            <span>Marge: <span className="font-mono text-gray-600">- %</span></span>
                                                            <span className="w-px h-3 bg-gray-200"></span>
                                                            <span>Lager: <span className="font-mono text-gray-600">Hauptlager</span></span>
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900 text-sm">
                                                            {item.price && typeof item.price === 'number' ? formatCurrency(item.price, selectedOrder.currency || 'EUR') : '—'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            × {item.quantity && typeof item.quantity === 'number' ? item.quantity : 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="h-2 bg-gray-50 border-t border-b border-gray-100"></div>

                                    {/* (D) Addresses */}
                                    <div className="p-6 grid grid-cols-2 gap-6 bg-white">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kunde / Lieferadresse</h4>
                                            <div className="text-sm text-gray-700 leading-relaxed">
                                                {/* Always show Email */}
                                                <div className="mb-2 pb-2 border-b border-gray-100">
                                                    <p className="font-bold text-gray-900">{selectedOrder.customerEmail || '—'}</p>
                                                    {selectedOrder.customerId && <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedOrder.customerId}</p>}
                                                </div>

                                                {selectedOrder.shippingAddress && typeof selectedOrder.shippingAddress === 'object' ? (
                                                    <>
                                                        <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.name || '—'}</p>
                                                        <p>{selectedOrder.shippingAddress.street || '—'}</p>
                                                        <p>{selectedOrder.shippingAddress.zip || '—'} {selectedOrder.shippingAddress.city || '—'}</p>
                                                        <p>{selectedOrder.shippingAddress.country || '—'}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-gray-400 italic text-xs mt-1">Keine Lieferadresse hinterlegt</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#1f3a34] mb-3 uppercase tracking-wider">Rechnung</h4>
                                            <div className="text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                                                <div className="flex justify-between mb-2">
                                                    <span>Zahlart:</span>
                                                    <span className="font-medium">Visa **** 4656</span>
                                                </div>
                                                <div className="flex justify-between mb-2">
                                                    <span>Status:</span>
                                                    <span className="text-green-600 font-medium">Bezahlt</span>
                                                </div>
                                                <div className="border-t border-gray-100 my-2 pt-2 space-y-2">
                                                    {selectedOrder.metadata?.discount_amount && parseFloat(selectedOrder.metadata.discount_amount) > 0 && (
                                                        <>
                                                            <div className="flex justify-between text-gray-600 text-sm">
                                                                <span>Zwischensumme:</span>
                                                                <span>{formatCurrency(((selectedOrder.amount || 0) / 100) + parseFloat(selectedOrder.metadata.discount_amount), selectedOrder.currency || 'EUR')}</span>
                                                            </div>
                                                            <div className="flex justify-between text-green-700 font-medium text-sm">
                                                                <span>Rabatt ({selectedOrder.metadata.coupon_code}):</span>
                                                                <span>-{formatCurrency(parseFloat(selectedOrder.metadata.discount_amount), selectedOrder.currency || 'EUR')}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="flex justify-between font-bold text-[#1f3a34] text-base pt-1">
                                                        <span>Gesamtbetrag:</span>
                                                        <span>{formatCurrency((selectedOrder.amount || 0) / 100, selectedOrder.currency || 'EUR')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-2 bg-gray-50 border-t border-b border-gray-100"></div>

                                    {/* Tracking Info */}
                                    {selectedOrder.tracking && (
                                        <>
                                            <div className="p-6 bg-white">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">📦 Versandinformationen</h4>
                                                    <button
                                                        onClick={handleDeleteTracking}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                        title="Tracking löschen"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <div className="mb-3">
                                                                <span className="text-gray-500 text-xs block mb-1">Carrier</span>
                                                                <span className="font-bold text-gray-900">{selectedOrder.tracking.carrier && typeof selectedOrder.tracking.carrier === 'string' ? selectedOrder.tracking.carrier : '—'}</span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {(() => {
                                                                    // Backward compatibility: handle both old (trackingNumber) and new (trackingNumbers) format
                                                                    const trackingData = selectedOrder.tracking;
                                                                    let numbers: string[] = [];

                                                                    if (trackingData.trackingNumbers && Array.isArray(trackingData.trackingNumbers)) {
                                                                        numbers = trackingData.trackingNumbers.filter(n => typeof n === 'string');
                                                                    } else if ((trackingData as any).trackingNumber && typeof (trackingData as any).trackingNumber === 'string') {
                                                                        numbers = [(trackingData as any).trackingNumber];
                                                                    }

                                                                    return (
                                                                        <>
                                                                            <span className="text-gray-500 text-xs block">Sendungsnummer{numbers.length > 1 ? 'n' : ''}</span>
                                                                            {numbers.length > 0 ? numbers.map((number: string, idx: number) => (
                                                                                <div key={idx} className="font-mono text-sm font-bold text-blue-600 bg-white px-3 py-2 rounded border border-blue-200">
                                                                                    {number}
                                                                                </div>
                                                                            )) : (
                                                                                <div className="text-gray-400 text-sm">—</div>
                                                                            )}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                            <div className="mt-3 pt-3 border-t border-blue-200">
                                                                <span className="text-gray-500 text-xs">Versendet am</span>
                                                                <span className="ml-2 text-sm font-medium text-gray-900">
                                                                    {formatDate(selectedOrder.tracking.shippedAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-gray-50 border-t border-b border-gray-100"></div>
                                        </>
                                    )}

                                    {/* (E) Admin Actions */}
                                    <div className="p-6 bg-white">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Verwaltung</h4>
                                        <div className="flex gap-3">
                                            <button className="flex-1 bg-[#2b4736] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#1f3a34] transition-colors">
                                                Status ändern
                                            </button>
                                            <button
                                                onClick={() => setShowTrackingModal(true)}
                                                className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Truck className="w-4 h-4" />
                                                Tracking hinzufügen
                                            </button>
                                            <button className="px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-transparent">
                                                Rückerstattung
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrders([selectedOrder.id])}
                                                className="px-3 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm ml-auto"
                                                title="Löschen"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* (F) Meta / Tech Info (Reduced) */}
                                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 font-mono">
                                            <div>
                                                <span className="block text-gray-400 mb-1">User ID</span>
                                                <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 select-all">
                                                    {selectedOrder.userId || '-'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 mb-1">Stripe Ref</span>
                                                <a
                                                    href="https://dashboard.stripe.com/acct_1FMHoaKVgJqTrr0u/payments"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="bg-white px-1.5 py-0.5 rounded border border-gray-200 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center justify-between group"
                                                >
                                                    <span className="truncate max-w-[100px]">{selectedOrder.stripePaymentIntentId || '-'}</span>
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                <Search className="w-12 h-12 mb-3 opacity-20" />
                                <span className="font-medium text-gray-500">Wählen Sie eine Bestellung aus</span>
                                <span className="text-sm mt-1">Details erscheinen hier</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Tracking Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#2b4736] to-[#1f3a34] p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Versandbestätigung senden</h3>
                                    <p className="text-sm opacity-90">Tracking-Informationen hinzufügen</p>
                                </div>
                                <button
                                    onClick={() => setShowTrackingModal(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Order Info */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Bestellung</div>
                                <div className="font-mono text-sm font-bold text-gray-900">#{selectedOrder?.id ? String(selectedOrder.id).slice(-8) : 'N/A'}</div>
                                <div className="text-xs text-gray-600 mt-1">{selectedOrder?.customerEmail && typeof selectedOrder.customerEmail === 'string' ? selectedOrder.customerEmail : '—'}</div>
                            </div>

                            {/* Carrier Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Versanddienstleister
                                </label>
                                <select
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b4736] focus:border-transparent transition-all text-sm font-medium"
                                >
                                    <option value="DPD">DPD</option>
                                    <option value="DHL">DHL</option>
                                    <option value="UPS">UPS</option>
                                    <option value="Hermes">Hermes</option>
                                    <option value="GLS">GLS</option>
                                    <option value="FedEx">FedEx</option>
                                </select>
                            </div>

                            {/* Tracking Numbers */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-gray-700">
                                        Sendungsnummer{trackingNumbers.length > 1 ? 'n' : ''}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addTrackingNumberField}
                                        className="text-xs text-[#2b4736] hover:text-[#1f3a34] font-semibold flex items-center gap-1"
                                    >
                                        <span className="text-lg">+</span> Weitere hinzufügen
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {trackingNumbers.map((number, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={number}
                                                onChange={(e) => updateTrackingNumber(index, e.target.value)}
                                                placeholder={`Sendungsnummer ${index + 1}`}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b4736] focus:border-transparent transition-all text-sm font-mono"
                                            />
                                            {trackingNumbers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTrackingNumberField(index)}
                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-semibold mb-1">Was passiert als Nächstes?</p>
                                        <ul className="text-xs space-y-1 opacity-90">
                                            <li>• Bestellung wird als "Versendet" markiert</li>
                                            <li>• Kunde erhält E-Mail mit Tracking-Link</li>
                                            <li>• Status wird automatisch aktualisiert</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowTrackingModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleSendShipmentConfirmation}
                                disabled={sendingShipment || !trackingNumbers.some(n => n.trim())}
                                className="flex-1 px-4 py-3 bg-[#2b4736] text-white rounded-lg text-sm font-bold hover:bg-[#1f3a34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sendingShipment ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Wird gesendet...
                                    </>
                                ) : (
                                    <>
                                        <Truck className="w-4 h-4" />
                                        Versandbestätigung senden
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
