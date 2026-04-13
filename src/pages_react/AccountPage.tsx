
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Package,
    Settings,
    LogOut,
    LayoutDashboard,
    ShoppingBag,
    MapPin,
    CreditCard,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firestore';
import { formatPrice } from '../utils/currency';
import { generateInvoice } from '../utils/invoiceGenerator';

interface Order {
    id: string;
    status: string;
    amount: number;
    currency: string;
    customerEmail: string;
    customerName: string;
    items: any[];
    createdAt: any;
    paidAt: any;
    shippingAddress?: {
        name: string;
        street: string;
        zip: string;
        city: string;
        country: string;
    };
    paymentDetails?: string;
    metadata?: {
        coupon_code?: string;
        discount_amount?: string;
        [key: string]: any;
    };
}

const AccountPage: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile' | 'settings'>('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const toggleOrder = (orderId: string) => {
        setExpandedOrderId(prev => prev === orderId ? null : orderId);
    };

    const menuItems = [
        { id: 'overview', label: 'Übersicht', icon: LayoutDashboard },
        { id: 'orders', label: 'Bestellungen', icon: Package },
        { id: 'profile', label: 'Persönliche Daten', icon: User },
        { id: 'settings', label: 'Einstellungen', icon: Settings },
    ];

    // Fetch orders from Firestore
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || !db) {
                setLoadingOrders(false);
                return;
            }

            try {
                const ordersRef = collection(db, 'orders');
                const q = query(
                    ordersRef,
                    where('userId', '==', user.uid)
                );

                const querySnapshot = await getDocs(q);
                const fetchedOrders: Order[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
                });

                // Sort orders by date (newest first)
                const sorted = fetchedOrders.sort((a, b) => {
                    const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
                    const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
                    return bTime - aTime;
                });

                setOrders(sorted);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return new Intl.DateTimeFormat('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date) + ' Uhr';
        } catch (e) {
            return '-';
        }
    };



    const parseItems = (items?: any) => {
        // New format: Array of objects with full product details
        if (Array.isArray(items)) {
            return items.map((item: any) => ({
                sku: item.id || item.sku || '-',
                quantity: item.quantity || 1,
                name: item.name || 'Unbekanntes Produkt',
                price: item.price || 0,
                image: item.image || null,
            }));
        }

        // Legacy format: String "SKU:qty,SKU:qty"
        if (typeof items === 'string') {
            return items.split(',').map((entry: string) => {
                const [sku, qty] = entry.split(':');
                return {
                    sku,
                    quantity: Number(qty) || 1,
                    name: null, // Legacy orders don't have names
                    price: null,
                    image: null,
                };
            });
        }

        return [];
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
            paid: { label: 'Bezahlt', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            failed: { label: 'Fehlgeschlagen', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        );
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-100 border-t-[#2b4736] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9fafb] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1f3a34]">Mein Konto</h1>
                    <p className="text-gray-500 mt-2">Willkommen zurück, {user.displayName || user.email}</p>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">

                    {/* Sidebar Navigation */}
                    <aside className="lg:col-span-3 mb-8 lg:mb-0">
                        <nav className="space-y-1 bg-white shadow-sm rounded-xl p-2 border border-gray-100">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id as any)}
                                        className={`group w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-[#2b4736] text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#1f3a34]'
                                            }`}
                                    >
                                        <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#1f3a34]'}`} />
                                        {item.label}
                                        {isActive && <ChevronRight className="ml-auto h-4 w-4 text-white/50" />}
                                    </button>
                                );
                            })}

                            <div className="pt-2 mt-2 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="group w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600" />
                                    Abmelden
                                </button>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-9">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] p-6 sm:p-8 relative overflow-hidden">

                            {/* Content based on active tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#1f3a34] mb-1">Übersicht</h2>
                                        <p className="text-sm text-gray-500">Ein Überblick über Ihre Aktivitäten.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-[#f0fdf4] p-6 rounded-xl border border-green-100">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">Bestellungen</p>
                                            <p className="text-2xl font-bold text-[#1f3a34] mt-1">{orders.length}</p>
                                        </div>
                                        <div className="bg-[#fff7ed] p-6 rounded-xl border border-orange-100">
                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">Gespeicherte Adressen</p>
                                            <p className="text-2xl font-bold text-[#1f3a34] mt-1">1</p>
                                        </div>
                                        <div className="bg-[#eff6ff] p-6 rounded-xl border border-blue-100">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">Zahlungsmethoden</p>
                                            <p className="text-2xl font-bold text-[#1f3a34] mt-1">-</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                        <h3 className="font-bold text-[#1f3a34] mb-3">Neueste Bestellung</h3>
                                        {orders.length > 0 ? (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">Bestellung #{orders[0].id.slice(-8)}</p>
                                                <p className="text-sm text-gray-600">Betrag: {formatPrice(orders[0].amount / 100)}</p>
                                                <p className="text-sm text-gray-600">Datum: {formatDate(orders[0].createdAt)}</p>
                                                {getStatusBadge(orders[0].status)}
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-500">Sie haben noch keine Bestellungen getätigt.</p>
                                                <Link to="/shop">
                                                    <button className="mt-4 text-sm font-bold text-[#2b4736] hover:underline">
                                                        Jetzt einkaufen &rarr;
                                                    </button>
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div>
                                    <h2 className="text-xl font-bold text-[#1f3a34] mb-6">Bestellungen</h2>

                                    {loadingOrders ? (
                                        <div className="flex justify-center py-12">
                                            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#2b4736] rounded-full animate-spin"></div>
                                        </div>
                                    ) : orders.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="space-y-4">
                                                {orders.map((order) => {
                                                    const parsedItems = parseItems(order.items);
                                                    const isExpanded = expandedOrderId === order.id;

                                                    return (
                                                        <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                                                            {/* Header / Clickable Summary */}
                                                            <div
                                                                onClick={() => toggleOrder(order.id)}
                                                                className="p-6 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:bg-gray-50/50 transition-colors"
                                                            >
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <h3 className="font-bold text-[#1f3a34]">Bestellung #{order.id.slice(-8)}</h3>
                                                                        {getStatusBadge(order.status)}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                        <span>{formatDate(order.createdAt)}</span>
                                                                        {/* Preview Images for Collapsed State */}
                                                                        {!isExpanded && parsedItems.length > 0 && (
                                                                            <div className="flex -space-x-2 overflow-hidden items-center ml-2">
                                                                                {parsedItems.slice(0, 3).map((item, i) => (
                                                                                    <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 border border-gray-200 overflow-hidden">
                                                                                        {item.image ? (
                                                                                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                                                        ) : (
                                                                                            <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                                                                                <Package className="w-3 h-3 text-gray-300" />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                                {parsedItems.length > 3 && (
                                                                                    <span className="text-xs font-medium text-gray-400 ml-2">+{parsedItems.length - 3}</span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-6">
                                                                    <div className="text-right">
                                                                        <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Gesamtbetrag</p>
                                                                        <p className="font-bold text-[#1f3a34]">{formatPrice(order.amount / 100)}</p>
                                                                    </div>
                                                                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                                                                </div>
                                                            </div>

                                                            {/* Expanded Details */}
                                                            {isExpanded && (
                                                                <div className="border-t border-gray-100 bg-gray-50/30 p-6 space-y-8 animate-in slide-in-from-top-2 duration-200">

                                                                    {/* Status Stepper */}
                                                                    <div className="w-full max-w-3xl mx-auto mb-8">
                                                                        <div className="flex items-center justify-between relative">
                                                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>

                                                                            {/* Steps */}
                                                                            {[
                                                                                { id: 'paid', label: 'Bezahlt', active: true }, // Order is paid
                                                                                { id: 'processing', label: 'In Bearbeitung', active: false },
                                                                                { id: 'shipped', label: 'Versendet', active: false },
                                                                                { id: 'delivered', label: 'Zugestellt', active: false }
                                                                            ].map((step, idx) => (
                                                                                <div key={step.id} className="flex flex-col items-center bg-white px-2">
                                                                                    <div className={`w-4 h-4 rounded-full border-2 ${step.active ? 'bg-[#2b4736] border-[#2b4736]' : 'bg-gray-200 border-gray-300'} mb-2`}></div>
                                                                                    <p className={`text-xs font-medium ${step.active ? 'text-[#1f3a34]' : 'text-gray-400'}`}>{step.label}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Items List */}
                                                                    <div className="bg-white border border-gray-200 rounded-lg p-0 overflow-hidden divide-y divide-gray-100">
                                                                        {parsedItems.map((item, idx) => (
                                                                            <div key={item.sku || idx} className="p-4 flex items-center gap-4">
                                                                                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                                                                                    {item.image ? (
                                                                                        <img src={item.image} alt={item.name || item.sku} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                                            <Package className="w-6 h-6" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-bold text-[#1f3a34] text-sm sm:text-base leading-tight mb-1">{item.name || 'Artikel'}</p>
                                                                                    <p className="text-xs text-gray-500 font-mono">SKU: {item.sku}</p>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <p className="font-bold text-[#1f3a34] whitespace-nowrap text-sm">
                                                                                        {item.price !== null ? formatPrice(item.price) : ''}
                                                                                        <span className="text-gray-500 font-normal ml-1">× {item.quantity}</span>
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Addresses & Info */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-200/50">
                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-[#1f3a34] mb-3 uppercase tracking-wider">Kunde & Adresse</h4>
                                                                            <div className="text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                                                                                {/* Always show Email */}
                                                                                <div className="mb-2 pb-2 border-b border-gray-100">
                                                                                    <p className="font-bold text-[#1f3a34] text-xs uppercase tracking-wide opacity-50 mb-0.5">E-Mail</p>
                                                                                    <p className="font-medium text-[#1f3a34]">{order.customerEmail || '—'}</p>
                                                                                </div>

                                                                                {order.shippingAddress ? (
                                                                                    <>
                                                                                        <p className="font-medium text-[#1f3a34] mb-1">
                                                                                            {order.shippingAddress.name || order.customerName || '—'}
                                                                                        </p>
                                                                                        <p>{order.shippingAddress.street}</p>
                                                                                        <p>{order.shippingAddress.zip} {order.shippingAddress.city}</p>
                                                                                        <p className="text-gray-500">{order.shippingAddress.country}</p>
                                                                                    </>
                                                                                ) : (
                                                                                    <p className="text-gray-400 italic mt-2 text-xs">Keine detaillierte Adresse hinterlegt</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-[#1f3a34] mb-3 uppercase tracking-wider">Rechnung</h4>
                                                                            <div className="text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                                                                                <div className="flex justify-between mb-2">
                                                                                    <span>Zahlart:</span>
                                                                                    <span className="font-medium">{order.paymentDetails || 'Stripe / Kreditkarte'}</span>
                                                                                </div>
                                                                                <div className="flex justify-between mb-2">
                                                                                    <span>Status:</span>
                                                                                    <span className="text-green-600 font-medium">Bezahlt</span>
                                                                                </div>
                                                                                <div className="border-t border-gray-100 my-2 pt-2 space-y-2">
                                                                                    {order.metadata?.discount_amount && parseFloat(order.metadata.discount_amount) > 0 && (
                                                                                        <>
                                                                                            <div className="flex justify-between text-gray-600 text-sm">
                                                                                                <span>Zwischensumme:</span>
                                                                                                <span>{formatPrice((order.amount / 100) + parseFloat(order.metadata.discount_amount))}</span>
                                                                                            </div>
                                                                                            <div className="flex justify-between text-green-700 font-medium text-sm">
                                                                                                <span>Rabatt ({order.metadata.coupon_code}):</span>
                                                                                                <span>-{formatPrice(parseFloat(order.metadata.discount_amount))}</span>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                    <div className="flex justify-between font-bold text-[#1f3a34] text-base pt-1">
                                                                                        <span>Gesamtbetrag:</span>
                                                                                        <span>{formatPrice(order.amount / 100)}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Actions */}
                                                                    <div className="flex justify-end pt-4">
                                                                        <button
                                                                            onClick={() => generateInvoice(order as any)}
                                                                            className="flex items-center gap-2 text-sm text-[#1f3a34] border border-[#1f3a34] px-4 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                                                                        >
                                                                            <span>📄</span> Rechnung herunterladen
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <Package className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">Noch keine Bestellungen</h3>
                                            <p className="text-gray-500 max-w-sm mb-8">
                                                Sobald Sie etwas bei uns bestellen, erscheint es hier.
                                            </p>
                                            <Link to="/shop" className="px-6 py-3 bg-[#2b4736] text-white rounded-full font-bold text-sm shadow-lg hover:bg-[#1f3a34] transition-all transform hover:-translate-y-0.5">
                                                Zum Shop
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="max-w-xl">
                                    <h2 className="text-xl font-bold text-[#1f3a34] mb-1">Persönliche Daten</h2>
                                    <p className="text-sm text-gray-500 mb-8">Verwalten Sie Ihre persönlichen Informationen.</p>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Name</label>
                                                <p className="text-gray-900 font-medium">{user.displayName || '-'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">E-Mail</label>
                                                <p className="text-gray-900 font-medium">{user.email}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <Settings className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="text-sm font-medium text-yellow-800">Hinweis</h3>
                                                        <div className="mt-2 text-sm text-yellow-700">
                                                            <p>Adressen und weitere Daten können aktuell nur beim Checkout geändert werden.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="max-w-xl">
                                    <h2 className="text-xl font-bold text-[#1f3a34] mb-1">Einstellungen</h2>
                                    <p className="text-sm text-gray-500 mb-8">Sicherheit und Kontoeinstellungen.</p>

                                    <div className="space-y-6">
                                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-sm font-bold text-[#1f3a34]">Passwort</h3>
                                                    <p className="text-xs text-gray-500">Ändern Sie Ihr Passwort regelmäßig.</p>
                                                </div>
                                                <button className="text-sm font-medium text-[#2b4736] hover:underline">
                                                    Zurücksetzen
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-sm font-bold text-red-600 mb-4">Gefahrenzone</h3>
                                            <button
                                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                                                onClick={() => alert("Funktion noch nicht verfügbar.")}
                                            >
                                                Konto löschen
                                            </button>
                                            <p className="mt-2 text-xs text-gray-400">
                                                Diese Aktion kann nicht rückgängig gemacht werden.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export { AccountPage };

export default AccountPage;
