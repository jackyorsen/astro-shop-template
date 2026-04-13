import React from 'react';
import { Truck, Clock, MapPin, Package, AlertCircle, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ShippingPage: React.FC = () => {
    return (
        <div className="w-full bg-white font-sans text-[#333]">
            {/* Hero Banner */}
            <div className="relative h-[250px] md:h-[300px] w-full bg-[#1f3a34]">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <Truck className="w-16 h-16 text-white mb-4 opacity-90" strokeWidth={1} />
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                        Lieferung & Versand
                    </h1>
                    <p className="text-white/90 max-w-2xl text-sm md:text-base leading-relaxed drop-shadow-sm font-medium">
                        Alle Informationen zu unseren Versandbedingungen, Lieferzeiten und Dienstleistern.
                    </p>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 py-16">

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

                    {/* Box 1: Kostenloser Versand */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center mb-6 text-[#2b4736]">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-[#1f3a34]">Versandkosten</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Der Versand ist <strong className="text-[#2b4736]">kostenlos</strong>.
                            Es fallen keine zusätzlichen Kosten für die Lieferung Ihrer Bestellung an.
                            Wir übernehmen alle Gebühren für Sie.
                        </p>
                    </div>

                    {/* Box 2: Dienstleister */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center mb-6 text-[#2b4736]">
                            <Truck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-[#1f3a34]">Versanddienstleister</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Ihre Bestellung wird durch zuverlässige Partner wie <strong className="text-[#333]">DPD, UPS</strong> oder andere spezialisierte Drittanbieter an die von Ihnen angegebene Lieferadresse zugestellt.
                        </p>
                    </div>

                    {/* Box 3: Lieferzeit */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center mb-6 text-[#2b4736]">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-[#1f3a34]">Lieferzeit & Bearbeitung</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            <span className="block mb-2">
                                <strong>Bearbeitungszeit:</strong> 1 bis 2 Werktage nach Bestellungseingang.
                            </span>
                            <span className="block">
                                <strong>Lieferzeit:</strong> Die voraussichtliche Lieferzeit für Deutschland (DE), Österreich (AT) und die Schweiz (CH) beträgt <strong className="text-[#2b4736]">2 bis 5 Werktage</strong>.
                            </span>
                        </p>
                        <p className="text-xs text-gray-400 italic">
                            *Dies kann je nach Verfügbarkeit der Ware variieren.
                        </p>
                    </div>

                    {/* Box 4: Tracking */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center mb-6 text-[#2b4736]">
                            <Package className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-[#1f3a34]">Sendungsverfolgung</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Sobald Ihre Bestellung unser Lager verlässt, erhalten Sie automatisch eine <strong className="text-[#333]">Versandbestätigung per E-Mail</strong>. Diese enthält Ihre Sendungsnummer, mit der Sie den Status Ihrer Lieferung jederzeit live verfolgen können.
                        </p>
                    </div>

                </div>

                {/* Additional Info Section */}
                <div className="bg-white border-t border-gray-100 pt-12">
                    <h2 className="text-2xl font-bold text-[#1f3a34] mb-8 text-center uppercase tracking-wide">Wichtige Hinweise</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        <div className="flex gap-4">
                            <AlertCircle className="w-6 h-6 text-[#d9534f] flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-[#333] mb-2">Lieferverzögerungen</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Sollte es aufgrund unvorhergesehener Umstände zu einer Lieferverzögerung kommen,
                                    werden wir Sie umgehend benachrichtigen und Ihnen einen neuen voraussichtlichen Termin mitteilen.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <MapPin className="w-6 h-6 text-[#d9534f] flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-[#333] mb-2">Kein Versand an Postfächer</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Der Versand an ein Postfach ist derzeit leider nicht möglich.
                                    Bitte stellen Sie sicher, dass Sie eine gültige Lieferadresse (Wohn- oder Firmenadresse) angeben.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-16 text-center bg-[#2b4736] rounded-2xl p-10 text-white shadow-xl shadow-[#2b4736]/20">
                    <h3 className="text-2xl font-bold mb-4">Noch Fragen zur Lieferung?</h3>
                    <p className="opacity-90 max-w-lg mx-auto mb-8 leading-relaxed">
                        Unser Kundenservice hilft Ihnen gerne weiter, falls Sie Fragen zum Status Ihrer Bestellung oder zu unseren Versandbedingungen haben.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="mailto:support@mamoru.de" className="bg-white text-[#2b4736] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors inline-flex items-center">
                            <Mail className="w-4 h-4 mr-2" /> Kontakt aufnehmen
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ShippingPage;
