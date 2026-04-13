
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
    authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
};

console.log('Firebase Init Debug: Project ID:', firebaseConfig.projectId);
console.log('Firebase Init Debug: API Key exists?', !!firebaseConfig.apiKey);

let app: FirebaseApp | undefined;
let auth: Auth | null = null;

try {
    if (!firebaseConfig.apiKey) {
        console.warn("⚠️ Firebase Config missing! Application running in limited mode. Auth will not work.");
    } else {
        // Initialize Firebase
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        // Initialize Auth
        auth = getAuth(app);
    }
} catch (error) {
    console.error("Firebase Initialization Error:", error);
}

export { app, auth };
export default app;
