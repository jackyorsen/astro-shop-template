import React, { useEffect, useState } from 'react';

type RedirectMode = 'CH_on_DE' | 'DE_on_CH' | null;

export const CountryRedirectModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<RedirectMode>(null);

    useEffect(() => {
        // 1. Check preference in localStorage
        const preference = localStorage.getItem('mamoru_country_preference');
        if (preference) {
            return; // User has already decided
        }

        const checkCountry = async () => {
            try {
                // 2. Fetch user's country
                // Using a free IP geolocation API. 
                // Note: For production with high traffic, a paid service or backend proxy is recommended.
                // ipapi.co is reliable for client-side checks usually.
                const response = await fetch('https://ipapi.co/json/');
                if (!response.ok) return;

                const data = await response.json();
                const countryCode = data.country_code; // e.g., 'CH', 'DE'

                // 3. Check current domain
                const hostname = window.location.hostname;
                const isCHDomain = hostname.endsWith('.ch');
                const isDEDomain = hostname.endsWith('.de');

                // 4. Determine if hint should be shown
                if (countryCode === 'CH' && isDEDomain) {
                    setMode('CH_on_DE');
                    setIsOpen(true);
                } else if (countryCode === 'DE' && isCHDomain) {
                    setMode('DE_on_CH');
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Failed to determine country for redirect hint', error);
            }
        };

        checkCountry();
    }, []);

    const handleStay = () => {
        // User chose to stay. Remember this choice.
        localStorage.setItem('mamoru_country_preference', 'stay');
        setIsOpen(false);
    };

    if (!isOpen || !mode) return null;

    // Content Configuration
    const isTargetCH = mode === 'CH_on_DE';

    const title = "Hinweis";
    const text = isTargetCH
        ? "Sie scheinen aus der Schweiz zu kommen. Möchten Sie zum Schweizer Mamoru-Shop wechseln?"
        : "Sie scheinen aus Deutschland zu kommen. Möchten Sie zum deutschen Mamoru-Shop wechseln?";

    const primaryButtonText = isTargetCH ? "Zum Schweizer Shop wechseln" : "Zum deutschen Shop wechseln";
    const primaryUrl = isTargetCH ? "https://mamorumoebel.ch" : "https://mamorumoebel.de";

    const secondaryButtonText = isTargetCH ? "Auf deutschem Shop bleiben" : "Auf Schweizer Shop bleiben";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 relative overflow-hidden transform transition-all animate-in zoom-in-95 duration-300"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Decorative subtle background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2b4736]/5 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none" />

                <h2 id="modal-title" className="text-xl font-bold text-[#111] mb-3 relative z-10">
                    {title}
                </h2>

                <p className="text-gray-600 mb-8 leading-relaxed relative z-10">
                    {text}
                </p>

                <div className="flex flex-col gap-3 relative z-10">
                    <a
                        href={primaryUrl}
                        className="w-full bg-[#2b4736] text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-[#1f3a34] transition-all hover:shadow-lg text-center flex items-center justify-center gap-2 group"
                    >
                        {primaryButtonText}
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>

                    <button
                        onClick={handleStay}
                        className="w-full bg-transparent text-gray-500 hover:text-[#111] font-medium py-2.5 px-4 rounded-lg transition-colors text-center text-sm mt-1"
                    >
                        {secondaryButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};
