import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const DataProtectionPage: React.FC = () => {
    return (
        <div className="w-full bg-white font-sans text-[#333]">
            {/* Hero Banner */}
            <div className="relative h-[200px] md:h-[250px] w-full bg-[#1f3a34]">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <Shield className="w-12 h-12 text-white mb-4 opacity-90" strokeWidth={1} />
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
                        Datenschutzerklärung
                    </h1>
                    <p className="text-white/80 max-w-xl text-sm leading-relaxed font-medium">
                        Erfahren Sie, wie wir Ihre Daten schützen und welche Rechte Sie haben.
                    </p>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 py-16">
                <div className="prose prose-sm md:prose-base max-w-none text-gray-700 space-y-8">

                    <section>
                        <h3 className="text-xl font-bold text-[#1f3a34] mb-4">Verantwortlicher für die Datenverarbeitung</h3>
                        <p className="mb-4">
                            Florian Herrscher<br />
                            Rathausplatz 3<br />
                            8853 Lachen<br />
                            Schweiz<br />
                            Tel: +41 76 200 46 78<br />
                            E-Mail: aureliusherrscher@gmail.com
                        </p>
                        <p>
                            Wir freuen uns über Ihr Interesse an unserem Online-Shop. Der Schutz Ihrer Privatsphäre ist für uns sehr wichtig.
                            Nachstehend informieren wir Sie ausführlich über den Umgang mit Ihren Daten.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#333] mb-2">1. Zugriffsdaten und Hosting</h4>
                        <p>
                            Sie können unsere Webseiten besuchen, ohne Angaben zu Ihrer Person zu machen. Bei jedem Aufruf einer Webseite speichert der Webserver lediglich automatisch ein sogenanntes Server-Logfile, das z.B. den Namen der angeforderten Datei, Ihre IP-Adresse, Datum und Uhrzeit des Abrufs, übertragene Datenmenge und den anfragenden Provider (Zugriffsdaten) enthält und den Abruf dokumentiert.
                        </p>
                        <p className="mt-2 text-sm italic border-l-4 border-gray-200 pl-4 py-1 bg-gray-50">
                            Diese Zugriffsdaten werden ausschließlich zum Zwecke der Sicherstellung eines störungsfreien Betriebs der Seite sowie der Verbesserung unseres Angebots ausgewertet. Dies dient der Wahrung unserer berechtigten Interessen an einer korrekten Darstellung unseres Angebots (Art. 6 Abs. 1 S. 1 lit. f DSGVO). Alle Zugriffsdaten werden spätestens sieben Tage nach Ende Ihres Seitenbesuchs gelöscht.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#333] mb-2">2. Datenerhebung und -verwendung</h4>
                        <p>
                            Wir erheben personenbezogene Daten, wenn Sie uns diese im Rahmen Ihrer Bestellung oder bei einer Kontaktaufnahme mit uns (z.B. per Kontaktformular oder E-Mail) freiwillig mitteilen. Pflichtfelder werden als solche gekennzeichnet, da wir in diesen Fällen die Daten zwingend zur Vertragsabwicklung benötigen.
                        </p>
                        <p className="mt-2">
                            Wir verwenden die von Ihnen mitgeteilten Daten gemäß Art. 6 Abs. 1 S. 1 lit. b DSGVO zur Vertragsabwicklung und Bearbeitung Ihrer Anfragen. Soweit Sie hierzu Ihre Einwilligung erteilt haben, verwenden wir Ihre Daten auch zur Eröffnung eines Kundenkontos.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#333] mb-2">3. Datenweitergabe</h4>
                        <p>
                            Zur Vertragserfüllung geben wir Ihre Daten an das mit der Lieferung beauftragte Versandunternehmen weiter. Zur Abwicklung von Zahlungen geben wir die hierfür erforderlichen Zahlungsdaten an das Kreditinstitut oder den Zahlungsdienstleister weiter.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#333] mb-2">4. E-Mail-Newsletter</h4>
                        <p>
                            Wenn Sie sich zu unserem Newsletter anmelden, verwenden wir die hierfür erforderlichen Daten, um Ihnen regelmäßig unseren E-Mail-Newsletter zuzusenden. Die Abmeldung vom Newsletter ist jederzeit möglich.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#333] mb-2">5. Trusted Shops Trustbadge</h4>
                        <p>
                            Zur Anzeige unseres Trusted Shops Gütesiegels und der gesammelten Bewertungen ist auf dieser Webseite das Trusted Shops Trustbadge eingebunden. Dies dient der optimalen Vermarktung durch Ermöglichung eines sicheren Einkaufs.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#333] mb-2">6. Cookies und Webanalyse</h4>
                        <p>
                            Um den Besuch unserer Webseite attraktiv zu gestalten und die Nutzung bestimmter Funktionen zu ermöglichen, verwenden wir sogenannte Cookies. Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und einzeln über deren Annahme entscheiden.
                        </p>
                        <div className="mt-4 flex gap-2 items-center text-sm text-[#2b4736] font-medium p-4 bg-gray-50 rounded border border-gray-100">
                            <Lock className="w-4 h-4" />
                            <span>Die vollständige Cookie-Richtlinie finden Sie in Ihren Browser-Einstellungen.</span>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DataProtectionPage;
