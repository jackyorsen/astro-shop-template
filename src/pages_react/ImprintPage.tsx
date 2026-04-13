import React from 'react';
import { Info, MapPin, Phone, Mail } from 'lucide-react';

export const ImprintPage: React.FC = () => {
    return (
        <div className="w-full bg-white font-sans text-[#333]">
            {/* Hero Banner */}
            <div className="relative h-[200px] md:h-[250px] w-full bg-[#1f3a34]">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <Info className="w-12 h-12 text-white mb-4 opacity-90" strokeWidth={1} />
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
                        Impressum
                    </h1>
                    <p className="text-white/80 max-w-xl text-sm leading-relaxed font-medium">
                        Rechtliche Informationen zu Mamoru Möbel.
                    </p>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 py-16">
                <div className="bg-[#f9f9f9] border border-gray-100 rounded-xl p-8 md:p-12 shadow-sm text-center md:text-left">

                    <div className="mb-10">
                        <h3 className="text-2xl font-bold text-[#1f3a34] mb-6">Angaben gemäß § 5 TMG</h3>
                        <p className="text-xl font-bold text-[#333] mb-2">mamoruCH Herrscher</p>
                        <p className="text-gray-600 mb-8">Inhaber: Florian Herrscher</p>

                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-gray-600">
                                <MapPin className="w-5 h-5 text-[#2b4736] flex-shrink-0" />
                                <span>
                                    Rathausplatz 3<br />
                                    8853 Lachen<br />
                                    Schweiz
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-xl font-bold text-[#1f3a34] mb-6">Kontakt</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row items-center md:items-center gap-3 text-gray-600">
                                <Phone className="w-5 h-5 text-[#2b4736] flex-shrink-0" />
                                <a href="tel:+41762004678" className="hover:text-[#2b4736] transition-colors">
                                    +41 76 200 46 78
                                </a>
                            </div>
                            <div className="flex flex-col md:flex-row items-center md:items-center gap-3 text-gray-600">
                                <Mail className="w-5 h-5 text-[#2b4736] flex-shrink-0" />
                                <a href="mailto:aureliusherrscher@gmail.com" className="hover:text-[#2b4736] transition-colors">
                                    aureliusherrscher@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8 mt-8">
                        <h3 className="text-xl font-bold text-[#1f3a34] mb-4">Verantwortlich für den Inhalt</h3>
                        <p className="text-gray-600">
                            Florian Herrscher<br />
                            Rathausplatz 3<br />
                            8853 Lachen<br />
                            Schweiz
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ImprintPage;
