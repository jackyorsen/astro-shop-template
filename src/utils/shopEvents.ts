import { getFirestore, collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);

// Helper: Session ID
export const getSessionId = () => {
    let sessionId = sessionStorage.getItem('shop_session_id');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('shop_session_id', sessionId);
    }
    return sessionId;
};

// Helper: Country
export const getCountry = (): "DE" | "CH" => {
    const hostname = window.location.hostname;
    if (hostname.endsWith('.ch')) return 'CH';
    if (hostname.endsWith('.de')) return 'DE';
    const saved = localStorage.getItem('mamoru_country');
    return saved === 'CH' ? 'CH' : 'DE';
};

// Helper: Device Tracking (Extended)
export const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let type: "mobile" | "tablet" | "desktop" = "desktop";

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        type = "tablet";
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        type = "mobile";
    }

    let browser: "chrome" | "safari" | "firefox" | "edge" | "other" = "other";
    if (ua.indexOf("Edg") > -1) browser = "edge";
    else if (ua.indexOf("Chrome") > -1) browser = "chrome";
    else if (ua.indexOf("Firefox") > -1) browser = "firefox";
    else if (ua.indexOf("Safari") > -1) browser = "safari";

    let os: "windows" | "macos" | "ios" | "android" | "linux" | "unknown" = "unknown";
    if (ua.indexOf("Win") > -1) os = "windows";
    else if (ua.indexOf("Mac") > -1) os = "macos";
    else if (ua.indexOf("Linux") > -1) os = "linux";
    else if (ua.indexOf("Android") > -1) os = "android";
    else if (ua.indexOf("like Mac") > -1) os = "ios";

    return { type, os, browser };
};

// Helper: Source Tracking (Session Persistent)
export interface SourceInfo {
    type: "direct" | "referral" | "organic" | "paid";
    name: string;
    utm?: {
        source?: string | null;
        medium?: string | null;
        campaign?: string | null;
    } | null;
}

export const getSourceInfo = (): SourceInfo => {
    const STORAGE_KEY = 'shop_source_info';

    // 1. Try Session Storage (Persistent for session)
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { }

    // 2. Determine new Source (First Entry)
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;

    const utm = {
        source: urlParams.get('utm_source') || null,
        medium: urlParams.get('utm_medium') || null,
        campaign: urlParams.get('utm_campaign') || null
    };

    let type: SourceInfo['type'] = 'direct';
    let name = 'direct';

    if (utm.source) {
        type = 'paid'; // Assumption mostly, or defined by medium
        if (utm.medium === 'organic') type = 'organic';
        if (utm.medium === 'referral') type = 'referral';
        name = utm.source;
    } else if (referrer) {
        try {
            const refUrl = new URL(referrer);
            const host = refUrl.hostname;

            if (host.includes('google')) {
                type = 'organic';
                name = 'google';
            } else if (host.includes('facebook') || host.includes('instagram')) {
                type = 'referral'; // or paid/social usually
                name = host.includes('facebook') ? 'facebook' : 'instagram';
            } else if (host.includes('mamoru') || host.includes('localhost')) {
                // Internal navigation (should ideally not happen as first entry unless reload/new tab from inside)
                // Treat as direct or keep previous if logic allows (but here we are in "no stored found").
                type = 'direct';
                name = 'mamoru.internal';
            } else {
                type = 'referral';
                name = host;
            }
        } catch {
            type = 'referral';
            name = 'unknown-referrer';
        }
    }

    const source: SourceInfo = { type, name, utm: (utm.source || utm.medium) ? utm : null };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(source));
    return source;
};

// Helper: Score System
const SCORE_MAP: Record<string, number> = {
    page_view: 1,
    view_item: 3,
    add_to_cart: 6,
    begin_checkout: 10,
    purchase: 25
};

const updateScore = (eventType: string): { delta: number, session_total: number } => {
    const STORAGE_KEY = 'shop_session_score';
    const delta = SCORE_MAP[eventType] || 0;

    let currentTotal = 0;
    try {
        currentTotal = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10);
    } catch { }

    const newTotal = currentTotal + delta;
    sessionStorage.setItem(STORAGE_KEY, newTotal.toString());

    return { delta, session_total: newTotal };
};

// Helper: Geo Location (via Cloudflare Trace - Privacy Friendly)
const getRealCountry = async (): Promise<string> => {
    const STORAGE_KEY = 'shop_real_country';
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

        const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { signal: controller.signal });
        const text = await res.text();
        const match = text.match(/^loc=([A-Z]+)$/m);

        clearTimeout(timeoutId);

        if (match && match[1]) {
            sessionStorage.setItem(STORAGE_KEY, match[1]);
            return match[1];
        }
    } catch (e) {
        // Fallback or silent fail
    }
    return 'UNKNOWN';
};

// Helper: Visitor ID (Persistent)
export const getVisitorId = () => {
    const STORAGE_KEY = 'shop_visitor_id';
    let vid = localStorage.getItem(STORAGE_KEY);
    if (!vid) {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            vid = crypto.randomUUID();
        } else {
            // Fallback UUID
            vid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        localStorage.setItem(STORAGE_KEY, vid);
    }
    return vid;
};

// Helper: Internal/Foreign Traffic Detection
// Filter out non-European traffic (likely Admin/Bot/VPN)
const isInternalTraffic = () => {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && !tz.startsWith('Europe/')) return true;
    } catch (e) { }

    return false;
};

// Helper: SHA-256 Hash
export const hashString = async (str: string) => {
    if (!str) return '';
    try {
        const msgBuffer = new TextEncoder().encode(str.toLowerCase().trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.warn("Hashing failed", e);
        return 'hash_error';
    }
};

export interface ShopEventItem {
    product_id: string;
    title: string;
    quantity: number;
    price: number;
}

export interface CheckoutState {
    status: 'active' | 'abandoned' | 'completed';
    step?: 'address' | 'payment' | 'confirm';
    visitorId?: string;
    isInternal?: boolean;
    realCountry?: string; // New: Physical Location
    cart: {
        total: number;
        currency: string;
        items: ShopEventItem[];
    };
    customer?: {
        emailEntered: boolean;
        emailHash?: string;
    };
    device?: any;
    source?: any;
    score?: number;
}

export const trackCheckoutState = async (state: Partial<CheckoutState>) => {
    try {
        if (!app) return;
        const sessionId = getSessionId();
        const scoreTotal = parseInt(sessionStorage.getItem('shop_session_score') || '0', 10);
        const realCountry = await getRealCountry();

        const docRef = doc(db, 'checkout_sessions', sessionId);

        await setDoc(docRef, {
            sessionId,
            visitorId: getVisitorId(), // Persist Visitor ID
            isInternal: isInternalTraffic(), // Mark Internal
            realCountry,
            timestamp: serverTimestamp(),
            lastActivity: serverTimestamp(),
            device: getDeviceInfo(),
            source: getSourceInfo(),
            score: scoreTotal,
            ...state
        }, { merge: true });

    } catch (e) {
        console.error("Error tracking checkout state", e);
    }
};

export interface ShopEvent {
    id?: string;
    event: "page_view" | "view_item" | "add_to_cart" | "begin_checkout" | "purchase";
    sessionId: string;
    country: "DE" | "CH";
    page: string;
    timestamp?: any;

    // Tracking Data
    visitorId?: string;
    isInternal?: boolean;
    realCountry?: string;
    device: ReturnType<typeof getDeviceInfo>;
    source: SourceInfo;
    score: {
        delta: number;
        session_total: number;
    };

    // Backwards compat / Legacy entry for older events in dashboard if mixed
    entry?: any;

    // Product/Cart Data
    productId?: string;
    productName?: string;
    price?: number;
    quantity?: number;

    // Checkout/Cart Data
    items?: ShopEventItem[];
    cart_total?: number;
    currency?: string;

    // Coupon
    coupon_used?: boolean;
    coupon_code?: string;
    original_price?: number;
    final_price?: number;
    discount_percent?: number;

    // Cart Abandonment
    checkout_status?: "abandoned" | "completed";
    abandoned?: boolean;
    abandoned_after_minutes?: number;

    total?: number;
    orderId?: string;
    coupon?: string | null;
}

export const trackShopEvent = async (data: Omit<ShopEvent, 'sessionId' | 'country' | 'timestamp' | 'page' | 'device' | 'source' | 'score'> & { page?: string }) => {
    try {
        if (!app) return;

        const scoreInfo = updateScore(data.event);

        // Ensure source is fixed for session
        const sourceInfo = getSourceInfo();
        const realCountry = await getRealCountry(); // Fetch Geo

        const eventData: ShopEvent = {
            sessionId: getSessionId(),
            visitorId: getVisitorId(),
            isInternal: isInternalTraffic(),
            realCountry, // Store it
            country: getCountry(),
            page: data.page || window.location.pathname,
            timestamp: serverTimestamp(),
            device: getDeviceInfo(),
            source: sourceInfo,
            score: scoreInfo,
            // Compat for old entry field if needed (optional)
            entry: { referrer: document.referrer, ...sourceInfo.utm },
            ...data
        };

        addDoc(collection(db, 'shop_events'), eventData).catch(err =>
            console.error("Tracking Error:", err)
        );
    } catch (error) {
        console.error("Error preparing shop event:", error);
    }
};
