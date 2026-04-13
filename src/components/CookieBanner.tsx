import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show if no consent choice has been made yet
        const consent = localStorage.getItem('mamoru_cookie_consent');
        if (consent === null) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('mamoru_cookie_consent', 'granted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('mamoru_cookie_consent', 'denied');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="text-sm text-gray-600 flex-1">
                    <p>
                        Wir verwenden Cookies, um Ihr Einkaufserlebnis zu verbessern und anonyme Statistiken zu erstellen.
                        Durch Klicken auf "Alle akzeptieren" stimmen Sie der Verwendung aller Cookies zu.
                        Weitere Informationen finden Sie in unserer{' '}
                        <Link to="/datenschutzerklaerung" className="text-[#2b4736] underline hover:text-black">
                            Datenschutzerklärung
                        </Link>.
                    </p>
                </div>
                <div className="flex items-center gap-3 whitespace-nowrap">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                        Nur essenziell
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 text-sm font-bold text-white bg-[#2b4736] hover:bg-[#1f3a34] rounded transition-colors shadow-sm"
                    >
                        Alle akzeptieren
                    </button>
                </div>
            </div>
        </div>
    );
};
