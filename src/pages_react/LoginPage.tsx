
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, icon?: React.ReactNode }> = ({ label, icon, className, ...props }) => (
    <div className="relative w-full group">
        <input
            {...props}
            placeholder=" "
            className={`peer w-full pt-6 pb-2 pl-10 pr-3 rounded-lg border border-gray-200 focus:border-[#2b4736] focus:ring-1 focus:ring-[#2b4736] outline-none transition-all text-[14px] bg-white text-[#333] shadow-sm placeholder-transparent ${className || ''}`}
        />
        <label className="absolute left-10 top-4 text-gray-500 text-[14px] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-[#2b4736] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px] pointer-events-none">
            {label}
        </label>
        {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-[#2b4736] transition-colors">
                {icon}
            </div>
        )}
    </div>
);

export const LoginPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || '/account';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (activeTab === 'login') {
                await login(email, password);
            } else {
                await register(email, password, name);
            }
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError('E-Mail oder Passwort ist falsch.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Diese E-Mail-Adresse wird bereits verwendet.');
            } else if (err.code === 'auth/weak-password') {
                setError('Das Passwort ist zu schwach (min. 6 Zeichen).');
            } else {
                setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!auth) {
            setError('Authentication currently unavailable.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Anmeldung abgebrochen.');
            } else {
                setError(`Google-Anmeldung fehlgeschlagen: ${err.message || 'Unbekannter Fehler'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">

                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[#1f3a34] tracking-tight">
                        Willkommen zurück
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Greifen Sie auf Ihre Bestellungen und persönlichen Daten zu.
                    </p>
                </div>

                {/* Google Sign-In Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b4736] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Mit Google anmelden
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Oder mit E-Mail</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-50 rounded-xl">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'login'
                            ? 'bg-white text-[#1f3a34] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Anmelden
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'register'
                            ? 'bg-white text-[#1f3a34] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Registrieren
                    </button>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6 animate-fade-in" onSubmit={handleSubmit}>

                    <div className="space-y-4">
                        {activeTab === 'register' && (
                            <InputField
                                label="Vollständiger Name"
                                type="text"
                                icon={<UserIcon className="w-4 h-4" />}
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        )}

                        <InputField
                            label="E-Mail-Adresse"
                            type="email"
                            icon={<Mail className="w-4 h-4" />}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="space-y-1">
                            <InputField
                                label="Passwort"
                                type="password"
                                icon={<Lock className="w-4 h-4" />}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={activeTab === 'register' && password.length > 0 && password.length < 6 ? 'border-red-300' : ''}
                            />
                            {activeTab === 'register' && (
                                <p className="text-[11px] text-gray-400 px-1">Mindestens 6 Zeichen</p>
                            )}
                        </div>

                    </div>

                    {activeTab === 'login' && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#2b4736] focus:ring-[#2b4736] border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                    Angemeldet bleiben
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-[#2b4736] hover:text-[#1f3a34] hover:underline">
                                    Passwort vergessen?
                                </a>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div className="text-sm text-red-700 font-medium">{error}</div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#2b4736] hover:bg-[#1f3a34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b4736] shadow-lg shadow-[#2b4736]/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {activeTab === 'login' ? 'Anmelden' : 'Konto erstellen'}
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-gray-500">
                    Mit der Anmeldung erklären Sie sich mit unseren <Link to="/agb" className="underline hover:text-[#333]">AGB</Link> und der <Link to="/datenschutz" className="underline hover:text-[#333]">Datenschutzerklärung</Link> einverstanden.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
