import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import app from './firebase';

let db: Firestore | null = null;

try {
    if (app) {
        // Use initializeFirestore to force long polling if WebSockets fail
        db = initializeFirestore(app, {
            experimentalForceLongPolling: true,
        });
    } else {
        console.warn('Firebase app not initialized, Firestore unavailable');
    }
} catch (error) {
    // If already initialized (e.g. hot reload), fallback to getFirestore
    try {
        if (app) db = getFirestore(app);
    } catch (e) {
        console.error('Firestore initialization error:', error);
    }
}

export { db };
