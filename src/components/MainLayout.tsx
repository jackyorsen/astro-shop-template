
import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppShell } from './AppShell';
import { PageTransition } from './PageTransition';

export const MainLayout: React.FC = () => {
    const location = useLocation();

    React.useEffect(() => {
        import('../utils/shopEvents').then(({ trackShopEvent }) => {
            trackShopEvent({ event: 'page_view' });
        });
    }, [location.pathname]);

    return (
        <AppShell>
            <AnimatePresence mode="wait">
                <PageTransition key={location.pathname} className="w-full h-full">
                    <Outlet />
                </PageTransition>
            </AnimatePresence>
        </AppShell>
    );
};
