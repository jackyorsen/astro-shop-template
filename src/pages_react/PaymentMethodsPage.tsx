
import React from 'react';
import { CreditCard, ShieldCheck, Lock, Globe, Wallet } from 'lucide-react';

export const PaymentMethodsPage: React.FC = () => {
    return (
        <div className="w-full bg-white font-sans text-[#333]">
            {/* Hero Banner */}
            <div className="relative h-[250px] md:h-[300px] w-full bg-[#1f3a34]">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <CreditCard className="w-16 h-16 text-white mb-4 opacity-90" strokeWidth={1} />
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                        Zahlungsarten
                    </h1>
                    <p className="text-white/90 max-w-2xl text-sm md:text-base leading-relaxed drop-shadow-sm font-medium">
                        Sicher, schnell und bequem bezahlen.
                    </p>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 py-16">

                {/* Secure Payment Note */}
                <div className="bg-[#f0fdf4] border border-green-200 rounded-xl p-6 mb-12 flex items-start gap-4">
                    <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-green-900 mb-2">100% Sichere Zahlung</h3>
                        <p className="text-green-800 text-sm leading-relaxed">
                            Ihre Sicherheit steht für uns an erster Stelle. Alle Transaktionen sind SSL-verschlüsselt und wir arbeiten nur mit geprüften Zahlungsdienstleistern zusammen. Wir speichern keine sensiblen Bankdaten auf unseren Servern.
                        </p>
                    </div>
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

                    {/* Kreditkarte */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center text-[#2b4736]">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1f3a34]">Kreditkarte</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Wir akzeptieren <strong>VISA, Mastercard und American Express</strong>.
                            Die Belastung Ihres Kreditkartenkontos erfolgt mit Abschluss der Bestellung.
                        </p>
                        <div className="flex gap-2">
                            <img src="/visa.svg" alt="Visa" className="h-6 w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
                        </div>
                    </div>

                    {/* TWINT */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center text-[#2b4736]">
                                <img src="/twint-logo.png" alt="Twint" className="w-6 h-6 object-contain" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1f3a34]">TWINT</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Zahlen Sie schnell und sicher mit Ihrem Smartphone über die TWINT App. Einfach den QR-Code scannen und die Zahlung bestätigen.
                        </p>
                        <div className="flex gap-2">
                            <img src="/twint-logo.png" alt="TWINT" className="h-8 w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
                        </div>
                    </div>

                    {/* PayPal */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center text-[#2b4736]">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1f3a34]">PayPal</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Zahlen Sie einfach und sicher über Ihr PayPal-Konto. Sie werden am Ende des Bestellvorgangs direkt zu PayPal weitergeleitet.
                        </p>
                        <div className="flex gap-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
                        </div>
                    </div>

                    {/* Klarna */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center text-[#2b4736]">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1f3a34]">Klarna Rechnung</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Erst kaufen, dann bezahlen. Mit Klarna können Sie Ihre Bestellung jetzt tätigen und bequem später per Rechnung begleichen oder in Raten zahlen.
                        </p>
                        <div className="flex gap-2">
                            <img src="https://x.klarnacdn.net/payment-method/assets/badges/generic/klarna.svg" alt="Klarna" className="h-6 w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
                        </div>
                    </div>

                    {/* Sicherheit */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center text-[#2b4736]">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1f3a34]">SSL-Verschlüsselung</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Zur Übertragung Ihrer Daten nutzen wir den sicheren SSL-Standard (Secure Socket Layer). Ihre Daten sind bei uns jederzeit geschützt und für Dritte nicht einsehbar.
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default PaymentMethodsPage;
