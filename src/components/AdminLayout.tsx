import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    BarChart3,
    Settings,
    LogOut,
    Store,
    Tag
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/coupons', label: 'Coupons', icon: Tag },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left Sidebar */}
            <aside className="w-64 bg-[#1e293b] text-white flex flex-col flex-shrink-0">
                {/* Logo/Brand */}
                <div className="h-16 flex items-center px-6 border-b border-gray-700">
                    <Store className="w-6 h-6 mr-3 text-[#2b4736]" />
                    <span className="text-lg font-bold">Mamoru Admin</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {/* Dashboard is separate */}
                        <li key={navItems[0].path}>
                            <NavLink
                                to={navItems[0].path}
                                end={navItems[0].exact}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm ${isActive
                                        ? 'bg-[#2b4736] text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`
                                }
                            >
                                <LayoutDashboard className="w-5 h-5 mr-3" />
                                <span className="font-medium">Dashboard</span>
                            </NavLink>
                        </li>
                    </ul>

                    {/* Divider */}
                    <div className="my-3 border-t border-gray-700"></div>

                    <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        General
                    </div>
                    <ul className="space-y-1">
                        {navItems.slice(1).map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.exact}
                                    className={({ isActive }) =>
                                        `flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm ${isActive
                                            ? 'bg-[#2b4736] text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.email || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                                {user?.uid?.slice(0, 8)}...
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};
