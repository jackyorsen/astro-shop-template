import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firestore';
import { Tag, Plus, Edit2, Trash2, Save, X, Percent } from 'lucide-react';

interface Coupon {
    id: string;
    code: string;
    discount: number;
    description: string;
    active: boolean;
    showInProductPage: boolean;
    createdAt: Date;
}

export const AdminCouponsPage: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [formCode, setFormCode] = useState('');
    const [formDiscount, setFormDiscount] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formShowInProductPage, setFormShowInProductPage] = useState(false);

    // Load coupons from Firestore
    const loadCoupons = async () => {
        try {
            if (!db) {
                console.error('Firestore not available');
                setLoading(false);
                return;
            }
            const couponsRef = collection(db, 'coupons');
            const snapshot = await getDocs(couponsRef);
            const fetchedCoupons: Coupon[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                fetchedCoupons.push({
                    id: docSnap.id,
                    code: data.code,
                    discount: data.discount,
                    description: data.description,
                    active: data.active ?? true,
                    showInProductPage: data.showInProductPage ?? false,
                    createdAt: data.createdAt?.toDate() || new Date()
                });
            });
            setCoupons(fetchedCoupons.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
            setLoading(false);
        } catch (error) {
            console.error('Error loading coupons:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    // Create new coupon
    const handleCreate = async () => {
        if (!formCode || !formDiscount || !formDescription) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }

        const discount = parseFloat(formDiscount);
        if (isNaN(discount) || discount <= 0 || discount > 100) {
            alert('Rabatt muss zwischen 1 und 100% sein');
            return;
        }

        try {
            if (!db) {
                throw new Error('Firestore ist nicht verfügbar');
            }

            console.log('🎫 Erstelle Gutschein:', formCode.toUpperCase());

            const couponRef = doc(db, 'coupons', formCode.toUpperCase());
            await setDoc(couponRef, {
                code: formCode.toUpperCase(),
                discount: discount,
                description: formDescription,
                active: true,
                showInProductPage: formShowInProductPage,
                createdAt: new Date()
            });

            console.log('✅ Gutschein in Firestore erstellt mit showInProductPage:', formShowInProductPage);

            // Trigger Stripe sync
            try {
                const response = await fetch('https://apiv2-tbtmo7azvq-uc.a.run.app/sync-stripe-coupon', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: formCode.toUpperCase(),
                        discount: discount
                    })
                });

                if (response.ok) {
                    console.log('✅ Stripe sync erfolgreich');
                } else {
                    console.warn('⚠️ Stripe sync fehlgeschlagen');
                }
            } catch (stripeError) {
                console.warn('⚠️ Stripe sync error:', stripeError);
            }

            alert('✅ Gutschein erfolgreich erstellt!');
            setFormCode('');
            setFormDiscount('');
            setFormDescription('');
            setFormShowInProductPage(false);
            setIsCreating(false);
            loadCoupons();
        } catch (error: any) {
            console.error('Error creating coupon:', error);
            alert(`Fehler: ${error.message || 'Unbekannter Fehler'}`);
        }
    };

    // Update existing coupon
    const handleUpdate = async () => {
        if (!editingCoupon || !formDiscount || !formDescription) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }

        const discount = parseFloat(formDiscount);
        if (isNaN(discount) || discount <= 0 || discount > 100) {
            alert('Rabatt muss zwischen 1 und 100% sein');
            return;
        }

        try {
            if (!db) {
                throw new Error('Firestore ist nicht verfügbar');
            }

            const couponRef = doc(db, 'coupons', editingCoupon.id);
            console.log('💾 Aktualisiere Gutschein:', editingCoupon.id, { showInProductPage: formShowInProductPage });
            await updateDoc(couponRef, {
                discount: discount,
                description: formDescription,
                showInProductPage: formShowInProductPage
            });

            // Trigger Stripe sync
            try {
                await fetch('https://apiv2-tbtmo7azvq-uc.a.run.app/sync-stripe-coupon', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: editingCoupon.code,
                        discount: discount
                    })
                });
            } catch (stripeError) {
                console.warn('Stripe sync failed:', stripeError);
            }

            alert('✅ Gutschein aktualisiert!');
            setEditingCoupon(null);
            setFormDiscount('');
            setFormDescription('');
            setFormShowInProductPage(false);
            loadCoupons();
        } catch (error: any) {
            console.error('Error updating coupon:', error);
            alert(`Fehler: ${error.message || 'Unbekannter Fehler'}`);
        }
    };

    // Delete coupon
    const handleDelete = async (coupon: Coupon) => {
        if (!confirm(`Gutschein "${coupon.code}" wirklich löschen?`)) return;

        try {
            if (!db) {
                throw new Error('Firestore ist nicht verfügbar');
            }

            // Delete from Firestore
            await deleteDoc(doc(db, 'coupons', coupon.id));
            console.log('✅ Gutschein aus Firestore gelöscht');

            // Trigger Stripe deletion sync
            try {
                const response = await fetch('https://apiv2-tbtmo7azvq-uc.a.run.app/delete-stripe-coupon', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: coupon.code
                    })
                });

                if (response.ok) {
                    console.log('✅ Stripe deletion sync erfolgreich');
                } else {
                    console.warn('⚠️ Stripe deletion sync fehlgeschlagen');
                }
            } catch (stripeError) {
                console.warn('⚠️ Stripe deletion sync error:', stripeError);
            }

            alert('✅ Gutschein erfolgreich gelöscht!');
            loadCoupons();
        } catch (error: any) {
            console.error('Error deleting coupon:', error);
            alert(`Fehler beim Löschen: ${error.message}`);
        }
    };

    // Start editing
    const startEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormCode(coupon.code);
        setFormDiscount(coupon.discount.toString());
        setFormDescription(coupon.description);
        setFormShowInProductPage(coupon.showInProductPage);
        setIsCreating(false);
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingCoupon(null);
        setIsCreating(false);
        setFormCode('');
        setFormDiscount('');
        setFormDescription('');
        setFormShowInProductPage(false);
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gutscheinverwaltung</h1>
                    <p className="text-gray-600">Erstelle und verwalte Rabattgutscheine für die Couponbox</p>
                </div>
                <button
                    onClick={() => {
                        setIsCreating(true);
                        setEditingCoupon(null);
                        setFormCode('');
                        setFormDiscount('');
                        setFormDescription('');
                        setFormShowInProductPage(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2b4736] text-white rounded-lg hover:bg-[#1f3a34] transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Neuer Gutschein
                </button>
            </div>

            {/* Create/Edit Form */}
            {(isCreating || editingCoupon) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {isCreating ? 'Neuen Gutschein erstellen' : 'Gutschein bearbeiten'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gutscheincode</label>
                            <input
                                type="text"
                                value={formCode}
                                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                                disabled={!!editingCoupon}
                                placeholder="z.B. SAVE20"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b4736] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rabatt (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formDiscount}
                                    onChange={(e) => setFormDiscount(e.target.value)}
                                    placeholder="z.B. 15"
                                    min="1"
                                    max="100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b4736] focus:border-transparent"
                                />
                                <Percent className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                            <input
                                type="text"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                placeholder="z.B. Spare 15% auf alles"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b4736] focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg w-fit">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formShowInProductPage}
                                onChange={(e) => setFormShowInProductPage(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2b4736]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2b4736]"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900">Auf Produktseite anzeigen (Couponbox)</span>
                        </label>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={isCreating ? handleCreate : handleUpdate}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2b4736] text-white rounded-lg hover:bg-[#1f3a34] transition-colors font-medium"
                        >
                            <Save className="w-4 h-4" />
                            {isCreating ? 'Erstellen' : 'Speichern'}
                        </button>
                        <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            <X className="w-4 h-4" />
                            Abbrechen
                        </button>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Alle Gutscheine</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rabatt</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beschreibung</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erstellt</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop-Box</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Lade Gutscheine...
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Noch keine Gutscheine vorhanden
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-[#2b4736]" />
                                                <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-[#2b4736]">{coupon.discount}%</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{coupon.description}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${coupon.active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {coupon.active ? 'Aktiv' : 'Inaktiv'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {coupon.createdAt.toLocaleDateString('de-DE')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${coupon.showInProductPage
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {coupon.showInProductPage ? 'Sichtbar' : 'Versteckt'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => startEdit(coupon)}
                                                className="text-[#2b4736] hover:text-[#1f3a34] mr-3"
                                            >
                                                <Edit2 className="w-4 h-4 inline" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Hinweise:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Gutscheine werden automatisch in Stripe erstellt/aktualisiert</li>
                    <li>• Die Gutscheine erscheinen automatisch in der Couponbox auf Produktseiten</li>
                    <li>• Kunden können die Codes an der Kasse einlösen</li>
                    <li>• Rabatt wird in Prozent angegeben (1-100)</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminCouponsPage;
