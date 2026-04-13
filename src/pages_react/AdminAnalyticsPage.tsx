import React, { useEffect, useState, useMemo } from 'react';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { app } from '../firebase';
// Icons
import {
    ShoppingCart, CreditCard, Users, DollarSign, Activity, Globe, ShoppingBag,
    Smartphone, Monitor, Tablet, MousePointer2, AlertTriangle, TrendingUp, Tag, Zap, XCircle, ArrowRight,
    Mail, Lock, Clock, CheckCircle2, UserCheck, Search, Filter, Lightbulb, MapPin
} from 'lucide-react';
import { ShopEvent, CheckoutState } from '../utils/shopEvents';

const db = getFirestore(app);

// Helpers
const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
const formatTime = (date: Date) => new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(date);

// Hoisted Helpers
const getSourceLegacy = (entry?: any) => {
    if (!entry) return "Direct";
    if (entry.utm_source) return `${entry.utm_source}`;
    if (entry.referrer?.includes('google')) return 'google';
    if (entry.referrer?.includes('facebook')) return 'facebook';
    if (entry.referrer === ('direct') || !entry.referrer) return 'direct';
    try { return new URL(entry.referrer).hostname; } catch { return 'unknown'; }
};

const getSourceDisplay = (source?: any, entry?: any) => {
    if (source) {
        return { name: source.name, type: source.type || 'unknown' };
    }
    return { name: getSourceLegacy(entry), type: 'unknown' };
};

export const AdminAnalyticsPage: React.FC = () => {
    const [rawEvents, setRawEvents] = useState<ShopEvent[]>([]);
    const [checkoutSessions, setCheckoutSessions] = useState<(CheckoutState & { id: string, lastActivityDate: Date })[]>([]);
    const [loading, setLoading] = useState(true);

    // Global Filters
    const [period, setPeriod] = useState<'today' | 'yesterday' | 'week'>('today');
    const [countryFilter, setCountryFilter] = useState<'ALL' | 'DE' | 'CH'>('ALL');
    const [sourceFilter, setSourceFilter] = useState<string>('ALL');
    const [deviceFilter, setDeviceFilter] = useState<'ALL' | 'desktop' | 'mobile'>('ALL');

    // 1. Data Subscription
    useEffect(() => {
        const now = new Date();
        const pastDate = new Date();
        pastDate.setDate(now.getDate() - 7);
        pastDate.setHours(0, 0, 0, 0);

        // Events
        const qEvents = query(
            collection(db, 'shop_events'),
            where('timestamp', '>=', pastDate),
            orderBy('timestamp', 'desc'),
            limit(3000)
        );

        const unsubEvents = onSnapshot(qEvents, (snapshot) => {
            const events = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate() || new Date()
                } as unknown as ShopEvent;
            });
            setRawEvents(events);
        });

        // Sessions
        const qSessions = query(
            collection(db, 'checkout_sessions'),
            orderBy('lastActivity', 'desc'),
            limit(200)
        );

        const unsubSessions = onSnapshot(qSessions, (snapshot) => {
            const sessions = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    lastActivityDate: data.lastActivity?.toDate() || new Date(),
                    timestamp: data.timestamp?.toDate() || new Date()
                } as unknown as (CheckoutState & { id: string, lastActivityDate: Date });
            });
            setCheckoutSessions(sessions);
            setLoading(false);
        });

        return () => { unsubEvents(); unsubSessions(); };
    }, []);


    // 2. Data Filtering & KPIs
    const { filteredEvents, filteredSessions, kpis, insights, productRanking } = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(todayStart);
        const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);

        let startTime = todayStart;
        if (period === 'yesterday') startTime = yesterdayStart;
        if (period === 'week') startTime = weekStart;

        // Filter Function
        const matchesFilter = (item: any) => { // Generic filter for Event or Session
            // 0. Hard Filter: Internal/Foreign Traffic
            if (item.isInternal === true) return false;
            // Strict Geo Filter: Show only DE & CH if known
            if (item.realCountry && item.realCountry !== 'UNKNOWN' && item.realCountry !== 'DE' && item.realCountry !== 'CH') return false;

            // Time
            const t = item.timestamp || item.lastActivityDate;
            if (period === 'yesterday') {
                if (t < yesterdayStart || t >= yesterdayEnd) return false;
            } else {
                if (t < startTime) return false;
            }

            // Country
            if (countryFilter !== 'ALL') {
                // Try event country or infer from currency/domain
                const c = item.country || (item.currency === 'CHF' ? 'CH' : 'DE'); // rough heuristic
                if (c && c !== countryFilter) return false;
            }

            // Device
            if (deviceFilter !== 'ALL') {
                if (item.device?.type !== deviceFilter) return false;
            }

            // Source
            if (sourceFilter !== 'ALL') {
                const s = getSourceDisplay(item.source, item.entry).name.toLowerCase();
                if (!s.includes(sourceFilter.toLowerCase())) return false;
            }
            return true;
        };

        const fEvents = rawEvents.filter(matchesFilter);
        const fSessions = checkoutSessions.filter(matchesFilter); // Filter visible tracking sessions? Maybe active ones should always show? 
        // Let's filter KPIs but keep Active Monitor live-ish (maybe slight filter apply)

        // KPI Calc (Comparing to yesterday/previous period hardcoded for simplicity as "vs yesterday")
        const calcKPI = (evs: ShopEvent[]) => {
            const now = new Date().getTime();
            return {
                live: new Set(evs.filter(e => {
                    const t = e.timestamp?.getTime() || 0;
                    return (now - t) < 10 * 60 * 1000; // Active in last 10 minutes
                }).map(e => e.sessionId)).size,
                visitors: new Set(evs.filter(e => e.event === 'page_view').map(e => e.sessionId)).size,
                carts: evs.filter(e => e.event === 'add_to_cart').length,
                checkouts: evs.filter(e => e.event === 'begin_checkout').length,
                sales: evs.filter(e => e.event === 'purchase').length,
                revenue: evs.filter(e => e.event === 'purchase').reduce((sum, e) => sum + (e.total || e.cart_total || e.price || 0), 0),
            };
        };

        // Previous Period (always yesterday for trend)
        const prevEvents = rawEvents.filter(e => e.timestamp >= yesterdayStart && e.timestamp < yesterdayEnd); // Fixed reference
        const currentKPI = calcKPI(fEvents);
        const prevKPI = calcKPI(prevEvents);

        // Intelligence
        const findings = [];
        const abandonedWithMail = fSessions.filter(s => s.status === 'abandoned' && s.customer?.emailEntered).length;
        if (abandonedWithMail > 0) findings.push(`⚠️ ${abandonedWithMail} Checkouts mit erfasster E-Mail abgebrochen – Follow-Up möglich.`);

        const topProduct = fEvents.reduce((acc: any, e) => {
            if (e.event === 'view_item' && e.productName) {
                acc[e.productName] = (acc[e.productName] || 0) + 1;
            }
            return acc;
        }, {});
        const bestProduct = Object.entries(topProduct).sort((a: any, b: any) => b[1] - a[1])[0];
        if (bestProduct) findings.push(`🔥 Top-Produkt: "${bestProduct[0]}" wird heute am häufigsten angesehen.`);

        const mobileShare = fEvents.filter(e => e.device?.type === 'mobile').length / (fEvents.length || 1);
        if (mobileShare > 0.6) findings.push(`📱 Hoher Mobile-Traffic (${(mobileShare * 100).toFixed(0)}%) – Checkout mobil optimieren?`);


        // Product Ranking
        const pStats: Record<string, any> = {};
        fEvents.forEach(e => {
            const items = e.items || (e.productId ? [{ product_id: e.productId, title: e.productName }] : []);
            items.forEach((item: any) => {
                const id = item.product_id || item.title;
                if (!id) return;
                if (!pStats[id]) pStats[id] = { title: item.title || id, views: 0, carts: 0, sales: 0 };
                if (e.event === 'view_item') pStats[id].views++;
                if (e.event === 'add_to_cart') pStats[id].carts++;
                if (e.event === 'purchase') pStats[id].sales++;
            });
        });

        return {
            filteredEvents: fEvents,
            filteredSessions: fSessions,
            kpis: { current: currentKPI, prev: prevKPI },
            insights: findings,
            productRanking: Object.values(pStats).sort((a: any, b: any) => b.sales - a.sales || b.carts - a.carts).slice(0, 5)
        };
    }, [rawEvents, checkoutSessions, period, countryFilter, sourceFilter, deviceFilter]);

    // Live Monitor Separation
    const monitorData = useMemo(() => {
        // We use ALL sessions for monitoring (maybe ignore timeframe filter for "Active", but respect for Abandoned)
        const now = new Date().getTime();

        const active = checkoutSessions.filter(s =>
            s.isInternal !== true &&
            s.status === 'active' && (now - s.lastActivityDate.getTime()) < 60 * 60 * 1000 // Last hour active
        );

        const abandoned = filteredSessions.filter(s => {
            const isTimeout = s.status === 'active' && (now - s.lastActivityDate.getTime()) > 30 * 60 * 1000;
            return (s.status === 'abandoned' || (isTimeout && s.status !== 'completed')) && s.status !== 'completed';
        });

        return { active, abandoned };
    }, [checkoutSessions, filteredSessions]);


    return (
        <div className="p-6 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-slate-50 text-slate-800 font-sans">

            {/* 1. TOP BAR (Sticky-ish usually, but keeping simple) */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Shop Control Center
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Echtzeit-Intelligence für Entscheidungen.</p>
                </div>

                {/* Global Filters */}
                <div className="flex flex-wrap gap-2 items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    {['today', 'yesterday', 'week'].map(p => (
                        <button key={p} onClick={() => setPeriod(p as any)}
                            className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-colors ${period === p ? 'bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-500'}`}>
                            {p === 'week' ? '7 Tage' : p}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-slate-100 mx-1"></div>
                    <select className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 py-1 hover:bg-slate-50 rounded cursor-pointer"
                        value={countryFilter} onChange={e => setCountryFilter(e.target.value as any)}>
                        <option value="ALL">🌍 Alle Länder</option>
                        <option value="DE">🇩🇪 Deutschland</option>
                        <option value="CH">🇨🇭 Schweiz</option>
                    </select>
                    <select className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 py-1 hover:bg-slate-50 rounded cursor-pointer"
                        value={deviceFilter} onChange={e => setDeviceFilter(e.target.value as any)}>
                        <option value="ALL">📱 Alle Geräte</option>
                        <option value="desktop">Desktop</option>
                        <option value="mobile">Mobile</option>
                        <option value="tablet">Tablet</option>
                    </select>
                    <select className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 py-1 hover:bg-slate-50 rounded cursor-pointer"
                        value={sourceFilter} onChange={e => setSourceFilter(e.target.value as any)}>
                        <option value="ALL">🔗 Alle Quellen</option>
                        <option value="google">Google</option>
                        <option value="facebook">Facebook</option>
                        <option value="direct">Direct</option>
                    </select>
                </div>
            </div>

            {/* 2. KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                <KPICard title="LIVE" value={kpis.current.live} icon={Zap} accent pulse />
                <KPICard title="Besucher" value={kpis.current.visitors} prev={kpis.prev.visitors} icon={Users} />
                <KPICard title="Carts (Add)" value={kpis.current.carts} prev={kpis.prev.carts} icon={ShoppingCart} />
                <KPICard title="Checkouts" value={kpis.current.checkouts} prev={kpis.prev.checkouts} icon={CreditCard} />
                <KPICard title="Sales" value={kpis.current.sales} prev={kpis.prev.sales} icon={CheckCircle2} />
                <KPICard title="Umsatz" value={formatCurrency(kpis.current.revenue)} prev={formatCurrency(kpis.prev.revenue)} icon={DollarSign} />
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* LEFT COL: MONITOR & INTELLIGENCE */}
                <div className="xl:col-span-1 space-y-6">

                    {/* INTELLIGENCE PANEL */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 text-indigo-700 font-bold text-sm uppercase tracking-wide">
                            <Lightbulb className="w-4 h-4" /> Intelligence Insights
                        </div>
                        {insights.length > 0 ? (
                            <ul className="space-y-3">
                                {insights.map((msg, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-700 leading-snug bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                                        {msg}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-400 text-sm italic">Sammle Daten für Insights...</p>
                        )}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
                    </div>

                    {/* LIVE CHECKOUT MONITOR */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">Monitor</h3>
                            <div className="flex gap-2 text-[10px] font-bold uppercase">
                                <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{monitorData.active.length} Aktiv</span>
                                <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{monitorData.abandoned.length} Abbruch</span>
                            </div>
                        </div>

                        <div className="flex flex-col divide-y divide-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {/* ACTIVE Section */}
                            {monitorData.active.map(s => (
                                <MonitorCard key={s.id} session={s} type="active" />
                            ))}
                            {/* ABANDONED Section */}
                            {monitorData.abandoned.map(s => (
                                <MonitorCard key={s.id} session={s} type="abandoned" />
                            ))}
                            {monitorData.active.length === 0 && monitorData.abandoned.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm">Keine aktuellen Checkout-Aktivitäten.</div>
                            )}
                        </div>
                    </div>

                    {/* TOP PRODUCTS */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <TrendingUp className="w-4 h-4 text-slate-400" /> Top Produkte
                        </h3>
                        <div className="space-y-4">
                            {productRanking.map((p, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="text-sm font-bold text-slate-800 truncate" title={p.title}>{p.title}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {p.views} Views · {p.carts} Carts
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-emerald-600">{p.sales} Sales</div>
                                    </div>
                                </div>
                            ))}
                            {productRanking.length === 0 && <p className="text-sm text-slate-400">Keine Daten.</p>}
                        </div>
                    </div>
                </div>

                {/* CENTER/RIGHT: LIVE FEED */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[800px]">
                    <div className="p-5 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-400" /> Live Event Feed
                        </h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 sticky top-0 z-10 text-[11px] uppercase tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 w-24">Zeit</th>
                                    <th className="px-5 py-3 w-32">Event</th>
                                    <th className="px-5 py-3 w-40">Source / Device</th>
                                    <th className="px-5 py-3">Context</th>
                                    <th className="px-5 py-3 text-right">Wert</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {filteredEvents.map(e => {
                                    const src = getSourceDisplay(e.source, e.entry);
                                    return (
                                        <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3 text-slate-400 font-mono text-xs">{formatTime(e.timestamp)}</td>
                                            <td className="px-5 py-3">
                                                <EventBadge type={e.event} />
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        {e.visitorId && <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 rounded">#{e.visitorId.slice(0, 5)}</span>}
                                                        <span className="font-bold text-slate-700 text-xs">{src.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <span>{e.device?.type || 'desktop'}</span>
                                                        <span>{e.country === 'CH' ? '🇨🇭' : '🇩🇪'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="truncate max-w-[250px] text-slate-600" title={e.productName || e.page}>
                                                    {e.items && e.items.length > 0
                                                        ? `${e.items[0].title} ${e.items.length > 1 ? `+${e.items.length - 1}` : ''}`
                                                        : (e.productName || e.page)
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-slate-900">
                                                {(e.total || e.price) ? formatCurrency(e.total || e.price || 0) : ''}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Subcomponents ---

const MonitorCard = ({ session, type }: { session: any, type: 'active' | 'abandoned' }) => {
    const isAbandoned = type === 'abandoned';
    const src = getSourceDisplay(session.source);

    return (
        <div className={`p-4 border-l-4 transition-all hover:bg-slate-50 ${isAbandoned ? 'border-red-400 bg-red-50/20' : 'border-emerald-400 bg-emerald-50/20'}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {session.visitorId && <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded">#{session.visitorId.slice(0, 5)}</span>}
                    <span className="text-[10px] font-mono text-slate-400">{formatTime(session.lastActivityDate)}</span>
                    {session.device?.type === 'mobile' && <Smartphone className="w-3 h-3 text-slate-400" />}
                    {session.device?.type === 'desktop' && <Monitor className="w-3 h-3 text-slate-400" />}
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{src.name}</span>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{formatCurrency(session.cart?.total || 0)}</div>
                </div>
            </div>

            <div className="text-sm font-medium text-slate-800 line-clamp-2 mb-2">
                {session.cart?.items?.[0]?.title || 'Warenkorb'}
                {session.cart?.items?.length > 1 && <span className="text-slate-400 text-xs ml-1">+{session.cart.items.length - 1}</span>}
            </div>

            <div className="flex justify-between items-end mt-2">
                <div className="flex gap-2">
                    {session.customer?.emailEntered && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                            <Mail className="w-3 h-3" /> EMAIL DA
                        </span>
                    )}
                    {session.step && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                            Step: {session.step}
                        </span>
                    )}
                </div>
                {isAbandoned && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">ABBRUCH</span>
                )}
                {!isAbandoned && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded animate-pulse">AKTIV</span>
                )}
            </div>
        </div>
    );
};

const KPICard = ({ title, value, prev, icon: Icon, accent, pulse }: any) => {
    // Simple conversion to number if string
    const numVal = typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.-]+/g, ""));
    const numPrev = typeof prev === 'number' ? prev : (typeof prev === 'string' ? parseFloat(prev.replace(/[^0-9.-]+/g, "")) : undefined);
    const isUp = numPrev !== undefined ? numVal >= numPrev : true;

    return (
        <div className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between h-24 relative overflow-hidden ${accent ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    {pulse && (
                        <div className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </div>
                    )}
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${accent ? 'text-emerald-800' : 'text-slate-500'}`}>{title}</span>
                </div>
                <Icon className={`w-4 h-4 ${accent ? 'text-emerald-500' : 'text-slate-300'} ${pulse ? 'animate-pulse text-emerald-600' : ''}`} />
            </div>
            <div>
                <div className={`text-xl font-bold ${accent ? 'text-emerald-900' : 'text-slate-900'}`}>{value}</div>
                {prev !== undefined ? (
                    <div className="text-[10px] flex items-center gap-1 mt-0.5">
                        <span className={isUp ? 'text-emerald-500' : 'text-red-400'}>{isUp ? '↑' : '↓'}</span>
                        <span className="text-slate-400 opacity-80">{prev} gestern</span>
                    </div>
                ) : (
                    <div className="text-[10px] flex items-center gap-1 mt-0.5 opacity-0">.</div>
                )}
            </div>
        </div>
    );
};

const EventBadge = ({ type }: { type: string }) => {
    switch (type) {
        case 'purchase': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">SALE</span>;
        case 'begin_checkout': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">CHECKOUT</span>;
        case 'add_to_cart': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">CART</span>;
        case 'view_item': return <span className="text-slate-500 text-[10px] font-bold">VIEW</span>;
        default: return <span className="text-slate-400 text-[10px] uppercase">{type}</span>;
    }
};

export default AdminAnalyticsPage;
