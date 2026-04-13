import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firestore';
import { Settings, Save, Eye, EyeOff, Layout, Type, Hash, Info } from 'lucide-react';

interface ShopSettings {
    showProductBanner: boolean;
    productBannerText: string;
    showCouponBox: boolean;
    maxCouponsInBox: number;
    couponBoxFooterText: string;
}

export const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<ShopSettings>({
        showProductBanner: true,
        productBannerText: 'VDAY SALE – Nur für Mitglieder: Exklusiver Bestpreis!',
        showCouponBox: true,
        maxCouponsInBox: 2,
        couponBoxFooterText: 'Code im Warenkorb oder an der Kasse einfügen.'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                if (!db) return;
                const docRef = doc(db, 'coupons', '_settings');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSettings(docSnap.data() as ShopSettings);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!db) {
                alert('❌ Firestore ist nicht verfügbar. Bitte prüfen Sie die Firebase-Konfiguration.');
                return;
            }
            const docRef = doc(db, 'coupons', '_settings');
            console.log('💾 Speichere Einstellungen in coupons/_settings:', settings);
            await setDoc(docRef, settings);
            alert('✅ Einstellungen erfolgreich gespeichert!');
        } catch (error: any) {
            console.error('Error saving settings:', error);
            alert(`❌ Fehler beim Speichern der Einstellungen: ${error.message || 'Unbekannter Fehler'}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b4736]"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop-Einstellungen</h1>
                <p className="text-gray-600">Verwalte Banner, Couponboxen und globale Texte auf der Produktseite</p>
            </div>

            <div className="space-y-6">
                {/* Promo Banner Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                        <Type className="w-5 h-5 text-[#2b4736]" />
                        <h2 className="text-xl font-bold text-gray-900">Aktions-Banner (Produktseite)</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-gray-900">Banner anzeigen</h3>
                                <p className="text-sm text-gray-500">Zeigt das farbige Banner unter dem Preis an</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, showProductBanner: !settings.showProductBanner })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showProductBanner ? 'bg-[#2b4736]' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showProductBanner ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {settings.showProductBanner && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Banner-Text</label>
                                <textarea
                                    value={settings.productBannerText}
                                    onChange={(e) => setSettings({ ...settings, productBannerText: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b4736] focus:border-transparent min-h-[100px]"
                                    placeholder="z.B. VDAY SALE – Nur für Mitglieder..."
                                />
                                <p className="text-xs text-gray-400">Tipp: HTML ist nicht erlaubt, verwende einfachen Text.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Coupon Box Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-[#2b4736]" />
                        <h2 className="text-xl font-bold text-gray-900">Coupon-Box (Produktseite)</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-gray-900">Couponbox anzeigen</h3>
                                <p className="text-sm text-gray-500">Zeigt verfügbare Gutscheine direkt auf der Produktseite</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, showCouponBox: !settings.showCouponBox })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showCouponBox ? 'bg-[#2b4736]' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showCouponBox ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {settings.showCouponBox && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Hash className="w-4 h-4" />
                                        Max. Anzahl Gutscheine
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.maxCouponsInBox}
                                        onChange={(e) => setSettings({ ...settings, maxCouponsInBox: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b4736] focus:border-transparent"
                                        min="1"
                                        max="5"
                                    />
                                    <p className="text-xs text-gray-400">Nur Gutscheine mit der Option "Auf Produktseite zeigen" werden berücksichtigt.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Info className="w-4 h-4" />
                                        Fusstext (unter der Box)
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.couponBoxFooterText}
                                        onChange={(e) => setSettings({ ...settings, couponBoxFooterText: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b4736] focus:border-transparent"
                                        placeholder="z.B. Code im Warenkorb einlösen"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-[#2b4736] text-white rounded-lg hover:bg-[#1f3a34] transition-all font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Einstellungen speichern
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
