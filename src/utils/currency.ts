
export type Site = 'DE' | 'CH';

export const getSite = (): Site => {
    if (typeof window === 'undefined') return 'DE';
    const hostname = window.location.hostname;
    if (hostname.endsWith('.ch') || hostname.includes('mamorumoebel.ch')) {
        return 'CH';
    }
    return 'DE';
};

export const getCurrency = (): string => {
    return getSite() === 'CH' ? 'CHF' : 'EUR';
};

const CACHE_KEY = 'eur_chf_rate';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const FALLBACK_RATE = 0.96;
const CH_SURCHARGE = 39.00;

interface RateCache {
    rate: number;
    timestamp: number;
}

const fetchRate = (): void => {
    if (typeof window === 'undefined') return;

    // Check cache first
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const data: RateCache = JSON.parse(cached);
            if (Date.now() - data.timestamp < CACHE_DURATION_MS) {
                return; // Cache valid, no need to fetch
            }
        }
    } catch (e) {
        console.warn('Error reading rate cache', e);
    }

    // Fetch new rate
    fetch('https://api.frankfurter.app/latest?from=EUR&to=CHF')
        .then(res => res.json())
        .then(data => {
            if (data && data.rates && data.rates.CHF) {
                const newRate = data.rates.CHF;
                const cacheData: RateCache = {
                    rate: newRate,
                    timestamp: Date.now()
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                console.log('Updated EUR-CHF Rate:', newRate);
            }
        })
        .catch(err => console.error('Failed to fetch EUR-CHF rate', err));
};

// Trigger fetch once on module load (client-side only)
if (typeof window !== 'undefined') {
    fetchRate();
}

const getExchangeRate = (): number => {
    if (typeof window === 'undefined') return FALLBACK_RATE;
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const data: RateCache = JSON.parse(cached);
            return data.rate;
        }
    } catch (e) {
        // ignore
    }
    return FALLBACK_RATE;
};

// Swiss rounding: Round up to nearest 0.05
const roundCHF = (amount: number): number => {
    return Math.ceil(amount * 20) / 20;
};

export const convertPrice = (priceEur: number): number => {
    // CH prices are now loaded directly from VP_CH (CHF) - no conversion needed
    // DE prices remain in EUR
    return priceEur;
};

export const formatPrice = (priceEur: number, currencyOverride?: string): string => {
    const price = convertPrice(priceEur);
    const currency = currencyOverride || getCurrency();

    let locale = getSite() === 'CH' ? 'de-CH' : 'de-DE';
    if (currencyOverride) {
        if (currencyOverride.toUpperCase() === 'CHF') locale = 'de-CH';
        else if (currencyOverride.toUpperCase() === 'EUR') locale = 'de-DE';
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
};
