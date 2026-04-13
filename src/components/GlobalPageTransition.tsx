
import React, { useState, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Spinner = () => (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <div className="w-8 h-8 md:w-9 md:h-9 border-4 border-[#f0f0f0] border-t-[#1f3a34] rounded-full animate-spin"></div>
    </div>
);

const TransitionController: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        // 1. Lock Body & Reset Scroll immediately
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);

        // 2. Minimum display time for spinner (can be adjusted)
        const timeout = setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = ''; // Restore scroll
        }, 200); // 200ms blank gap

        return () => {
            clearTimeout(timeout);
            document.body.style.overflow = '';
        };
    }, []); // Mounts once per key change (location change)

    return (
        <>
            {loading && <Spinner />}
            <div
                className={`transition-opacity duration-300 ease-out ${loading ? 'opacity-0' : 'opacity-100'}`}
            >
                {children}
            </div>
        </>
    );
};

export const GlobalPageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    // Determine the transition key
    // For normal pages: use the full pathname (triggers transition on route change)
    // For account section: use static '/account' key (prevents transition on sub-routes)
    const transitionKey = location.pathname.startsWith('/account')
        ? '/account'
        : location.pathname;

    return (
        <TransitionController key={transitionKey}>
            {children}
        </TransitionController>
    );
};
