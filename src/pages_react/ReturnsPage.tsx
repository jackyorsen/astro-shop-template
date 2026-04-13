import React from 'react';
import { RotateCcw, PackageCheck, Banknote, AlertTriangle, Calendar, Mail } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
    return (
        <div className="w-full bg-white font-sans text-[#333]">
            {/* Hero Banner */}
            <div className="relative h-[250px] md:h-[300px] w-full bg-[#1f3a34]">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <RotateCcw className="w-16 h-16 text-white mb-4 opacity-90" strokeWidth={1} />
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                        Rücksendung & Umtausch
                    </h1>
                    <p className="text-white/90 max-w-2xl text-sm md:text-base leading-relaxed drop-shadow-sm font-medium">
                        30 Tage Rückgaberecht. Faire Bedingungen.
                    </p>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 py-16">

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

                    {/* Box 1: 30 Tage */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center mb-6 text-[#2b4736]">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-[#1f3a34]">30 Tage Rückgabefrist</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Sie haben <strong className="text-[#2b4736]">30 Tage nach Erhalt</strong> Ihrer Bestellung Zeit, Artikel zurückzugeben oder einen Umtausch anzufordern.
                            Bitte beachten Sie, dass Rückgaben nach Ablauf dieses Zeitraums nicht mehr bearbeitet werden können.
                        </p>
                    </div>

                    {/* Box 2: Kosten */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center mb-6 text-[#2b4736]">
                            <PackageCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-[#1f3a34]">Rücksendekosten</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Die Kosten für den Rückversand tragen Sie als Käufer. Wir stellen keine Rücksendeetiketten zur Verfügung.
                            Bitte senden Sie die Ware versichert an uns zurück, um Probleme beim Transport zu vermeiden.
                        </p>
                    </div>

                    {/* Box 3: Bedingungen */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center mb-6 text-[#2b4736]">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-[#1f3a34]">Zustand der Ware</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Artikel müssen sich in <strong>neuwertigem und unbenutztem Zustand</strong> befinden und in der
                            <strong> Originalverpackung</strong> zurückgesendet werden. Nur unter diesen Bedingungen kommt eine Rückerstattung in Betracht.
                        </p>
                    </div>

                    {/* Box 4: Erstattung */}
                    <div className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#2b4736]/10 rounded-full flex items-center justify-center mb-6 text-[#2b4736]">
                            <Banknote className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-[#1f3a34]">Erstattung</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Bei Rückgaben aufgrund von Nichtgefallen oder Falschbestellungen erfolgt die Erstattung in Form eines
                            <strong className="text-[#2b4736]"> Gutscheincodes</strong>, den Sie für zukünftige Einkäufe in unserem Shop verwenden können.
                        </p>
                    </div>

                </div>

                {/* Contact CTA */}
                <div className="mt-8 text-center bg-[#2b4736] rounded-2xl p-10 text-white shadow-xl shadow-[#2b4736]/20">
                    <h3 className="text-2xl font-bold mb-4">Rücksendung anmelden?</h3>
                    <p className="opacity-90 max-w-lg mx-auto mb-8 leading-relaxed">
                        Kontaktieren Sie unseren Kundenservice, um Ihre Rücksendung anzumelden oder falls Sie Fragen zum Ablauf haben.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="mailto:support@mamoru.de" className="bg-white text-[#2b4736] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors inline-flex items-center">
                            <Mail className="w-4 h-4 mr-2" /> Kundenservice kontaktieren
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReturnsPage;
