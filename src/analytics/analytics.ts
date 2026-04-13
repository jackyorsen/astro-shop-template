
const GA_MEASUREMENT_ID = 'G-LTKEJSKP85';

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

/**
 * Sends a GA4 event if the user has granted consent.
 */
export const trackEvent = (eventName: string, params: Record<string, any>) => {
    // Check for Consent
    const consent = localStorage.getItem('mamoru_cookie_consent');
    if (consent !== 'granted') return;

    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
};

// Deprecated/Empty initGA to prevent breaking imports temporarily
export const initGA = (): void => {
    // No-op: GA4 is now initialized statically in index.html
};
