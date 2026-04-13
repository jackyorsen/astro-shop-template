import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';

// Use Default DB for Admin check
const db = getFirestore(app);

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, loading } = useAuth(); // Use Auth Context to handle timing
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // 1. Wait for Auth to be ready
        if (loading) return;

        const checkAdmin = async () => {
            // 2. If no user after loading, deny
            if (!user) {
                console.log("Admin Check: No user found.");
                setIsAdmin(false);
                setChecking(false);
                return;
            }

            try {
                // 3. Check Firestore
                const uid = user.uid;
                console.log("🔍 Checking Admin Status for UID:", uid);

                const userRef = doc(db, 'users', uid);
                const userSnap = await getDoc(userRef);

                console.log("📄 User Doc Exists:", userSnap.exists());
                if (userSnap.exists()) {
                    console.log("📄 User Doc Data:", JSON.stringify(userSnap.data(), null, 2));
                }

                if (userSnap.exists() && userSnap.data()?.admin === true) {
                    console.log('✅ Admin Access Granted');
                    setIsAdmin(true);
                } else {
                    console.warn('⛔ Admin Access Denied: Field "admin" is not true or missing.');
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("❌ Error checking admin status:", error);
                setIsAdmin(false);
            } finally {
                setChecking(false);
            }
        };

        checkAdmin();
    }, [user, loading]);

    // Show loader while Auth is loading OR Admin check is running
    if (loading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-gray-100 border-t-[#2b4736] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
