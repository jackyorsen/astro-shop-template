import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firestore';
import { useProductsFromSheets } from '../hooks/useSheetsApi';
import { useAdmin } from '../context/AdminContext';
import { ShoppingBag, Package, BarChart3, TrendingUp } from 'lucide-react';
interface Order {
    id: string;
    amount: number;
    currency: string;
    status: string;
    site?: string;
}

export const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { adminSite } = useAdmin();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch products count
    const { products, loading: productsLoading } = useProductsFromSheets({ includeOOS: true, includeHidden: true });

    // Fetch orders from Firestore
    useEffect(() => {
        if (!db) {
            setError('Database not available');
            setLoading(false);
            return;
        }

        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetchedOrders: Order[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedOrders.push({
                        id: doc.id,
                        amount: data.amount || 0,
                        currency: data.currency || 'EUR',
                        status: data.status || 'unknown',
                        site: data.site || 'DE' // Default to DE if undefined (legacy data)
                    });
                });
                setOrders(fetchedOrders);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // FILTER ORDERS by adminSite
    const filteredOrders = orders.filter(order => {
        if (adminSite === 'ALL') return true;
        return (order.site || 'DE') === adminSite;
    });

    // Calculate stats BASED ON FILTERED ORDERS
    const totalOrders = filteredOrders.length;
    const paidOrders = filteredOrders.filter(o => o.status === 'paid' || o.status === 'shipped').length;
    const totalProducts = products.length;

    // Calculate revenue (sum of paid/shipped orders)
    const revenue = filteredOrders
        .filter(o => o.status === 'paid' || o.status === 'shipped')
        .reduce((sum, order) => {
            // Smart detection: if amount < 1000, it's already in EUR, otherwise in cents
            const amountInEur = order.amount < 1000 ? order.amount : order.amount / 100;
            return sum + amountInEur;
        }, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const stats = [
        {
            label: adminSite === 'ALL' ? 'Total Orders (ALL)' : `Total Orders (${adminSite})`,
            value: loading ? '...' : error ? '—' : totalOrders.toString(),
            icon: ShoppingBag,
            color: 'bg-blue-500',
            link: '/admin/orders',
            subtitle: loading ? 'Loading...' : error ? 'Error loading' : `${paidOrders} paid`,
        },
        {
            label: 'Products',
            value: productsLoading ? '...' : totalProducts.toString(),
            icon: Package,
            color: 'bg-green-500',
            link: '/admin/products',
            subtitle: productsLoading ? 'Loading...' : 'From Google Sheets',
        },
        {
            label: adminSite === 'ALL' ? 'Revenue (Mix)' : `Revenue (${adminSite})`,
            value: loading ? '...' : error ? '—' : formatCurrency(revenue),
            icon: TrendingUp,
            color: 'bg-purple-500',
            link: '/admin/analytics',
            subtitle: loading ? 'Calculating...' : error ? 'Error loading' : 'Total paid',
        },
        {
            label: 'Analytics',
            value: '—',
            icon: BarChart3,
            color: 'bg-orange-500',
            link: '/admin/analytics',
            subtitle: 'GA4 integration',
        },
    ];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome to your admin panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(stat.link)}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-xs text-gray-400">{stat.subtitle}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="px-6 py-4 bg-[#2b4736] text-white rounded-lg hover:bg-[#1f3a34] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#2b4736] focus:ring-offset-2"
                    >
                        <ShoppingBag className="w-5 h-5 mb-2" />
                        <div className="font-semibold">View Orders</div>
                        <div className="text-sm opacity-90">Manage customer orders</div>
                    </button>
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="px-6 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        <Package className="w-5 h-5 mb-2" />
                        <div className="font-semibold">Manage Products</div>
                        <div className="text-sm opacity-75">View product catalog</div>
                    </button>
                    <button
                        onClick={() => navigate('/admin/analytics')}
                        className="px-6 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        <BarChart3 className="w-5 h-5 mb-2" />
                        <div className="font-semibold">View Analytics</div>
                        <div className="text-sm opacity-75">Track performance</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
