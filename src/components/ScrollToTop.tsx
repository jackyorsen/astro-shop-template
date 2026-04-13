import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // IMPORTANT: Exclude /account routes to prevent blank screens and maintain stability
        if (!pathname.startsWith('/account')) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}
