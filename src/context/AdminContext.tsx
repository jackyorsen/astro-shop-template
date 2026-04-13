import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminSite = 'DE' | 'CH' | 'ALL';

interface AdminContextType {
    adminSite: AdminSite;
    setAdminSite: (site: AdminSite) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [adminSite, setAdminSite] = useState<AdminSite>(() => {
        // Try to load from localStorage to persist selection
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('admin_site_preference');
            if (saved === 'DE' || saved === 'CH' || saved === 'ALL') {
                return saved;
            }
        }
        return 'DE';
    });

    useEffect(() => {
        localStorage.setItem('admin_site_preference', adminSite);
    }, [adminSite]);

    return (
        <AdminContext.Provider value={{ adminSite, setAdminSite }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
