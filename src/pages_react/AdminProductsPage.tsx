import React, { useState, useMemo, useEffect } from 'react';
import { useProductsFromSheets } from '../hooks/useSheetsApi';
import type { Product } from '../types';
import { Search, Package, X, ExternalLink, Filter, RotateCcw, Store, Facebook, Copy, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firestore';

const AdminProductsPage: React.FC = () => {
    const { products, loading } = useProductsFromSheets({ includeHidden: true, includeOOS: true });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStock, setFilterStock] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortField, setSortField] = useState<'default' | 'price' | 'stock'>('default');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const categories = useMemo(() => {
        const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
        cats.sort();
        return cats as string[];
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = products.filter(p =>
            (p.name || p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterStock === 'instock') {
            result = result.filter(p => (p.stock || 0) > 0);
        } else if (filterStock === 'outofstock') {
            result = result.filter(p => (p.stock || 0) === 0);
        }

        if (filterCategory !== 'all') {
            result = result.filter(p => p.category === filterCategory);
        }

        if (sortField === 'price') {
            result.sort((a, b) => {
                const pa = typeof a.price === 'string' ? parseFloat(a.price) : (a.price || 0);
                const pb = typeof b.price === 'string' ? parseFloat(b.price) : (b.price || 0);
                return sortDirection === 'desc' ? pb - pa : pa - pb;
            });
        } else if (sortField === 'stock') {
            result.sort((a, b) => {
                const sa = Number(a.stock) || 0;
                const sb = Number(b.stock) || 0;
                return sortDirection === 'desc' ? sb - sa : sa - sb;
            });
        }

        return result;
    }, [products, searchTerm, filterStock, filterCategory, sortField, sortDirection]);

    const handleSort = (field: 'price' | 'stock') => {
        if (sortField === field) {
            if (sortDirection === 'desc') {
                setSortDirection('asc');
            } else {
                setSortField('default');
                setSortDirection('desc');
            }
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const renderSortIcon = (field: 'price' | 'stock') => {
        if (sortField !== field) return null;
        return sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 ml-1 inline-block" /> : <ArrowUp className="w-3 h-3 ml-1 inline-block" />;
    };

    const getStockBadge = (product: Product) => {
        const stock = product.stock || 0;
        if (stock === 0) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{stock} in Stock</span>;
    };

    return (
        <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500">Manage your product catalog</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b4736] focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                    className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-[#2b4736] focus:border-[#2b4736]"
                >
                    <option value="all">All Stock Status</option>
                    <option value="instock">In Stock</option>
                    <option value="outofstock">Out of Stock</option>
                </select>

                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-[#2b4736] focus:border-[#2b4736] max-w-xs"
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* LEFT PANEL: PRODUCT LIST */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-xs text-gray-500 uppercase tracking-wider grid grid-cols-[auto_1fr_100px_100px] gap-4">
                        <div className="w-12">Image</div>
                        <div>Product Details</div>
                        <div
                            className="text-right cursor-pointer hover:text-gray-900 select-none group flex justify-end items-center"
                            onClick={() => handleSort('stock')}
                        >
                            <span className="group-hover:underline">Stock</span>
                            {renderSortIcon('stock')}
                        </div>
                        <div
                            className="text-right cursor-pointer hover:text-gray-900 select-none group flex justify-end items-center"
                            onClick={() => handleSort('price')}
                        >
                            <span className="group-hover:underline">Price</span>
                            {renderSortIcon('price')}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading products from Sheets...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No products found</div>
                        ) : (
                            filteredProducts.map(product => (
                                <div
                                    key={product.id || product.sku}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer grid grid-cols-[auto_1fr_100px_100px] gap-4 items-center transition-colors ${selectedProduct?.sku === product.sku ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                                >
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {product.image ? (
                                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{product.name || product.title}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{product.sku}</div>
                                    </div>
                                    <div className="text-right select-none">
                                        {getStockBadge(product)}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-gray-900">{product.price} €</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: PRODUCT DETAILS (Standard View Only) */}
                <div className="lg:w-96 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {selectedProduct ? (
                        <div className="h-full flex flex-col">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                                <h2 className="font-bold text-gray-900 text-sm">Product Details</h2>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {selectedProduct.image && (
                                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={selectedProduct.image}
                                            alt={selectedProduct.name}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {selectedProduct.name || '—'}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {getStockBadge(selectedProduct)}
                                    </div>
                                </div>

                                {/* Standard Meta Info */}
                                <div className="border-t border-gray-200 pt-4 space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">SKU</div>
                                        <div className="font-mono text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                            {selectedProduct.sku || '—'}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-900">
                                        {selectedProduct.category || 'Uncategorized'}
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <a
                                        href={`/product/${selectedProduct.sku}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-[#2b4736] hover:text-[#1f3a34] font-medium"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View in Shop
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
                            <Package className="w-12 h-12 mb-3 opacity-20" />
                            <span className="font-medium text-gray-500">Select a product</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default AdminProductsPage;
