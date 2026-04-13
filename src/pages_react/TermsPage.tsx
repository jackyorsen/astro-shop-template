import React from 'react';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
    return (
        <div className="w-full bg-white font-sans text-[#333]">
            {/* Hero Banner */}
            <div className="relative h-[200px] md:h-[250px] w-full bg-[#1f3a34]">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <FileText className="w-12 h-12 text-white mb-4 opacity-90" strokeWidth={1} />
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
                        Allgemeine Geschäftsbedingungen
                    </h1>
                    <p className="text-white/80 max-w-xl text-sm leading-relaxed font-medium">
                        (AGB) für den Onlineshop Mamoru Möbel
                    </p>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 py-16">
                <div className="prose prose-sm md:prose-base max-w-none text-gray-700 space-y-8">

                    <section>
                        <h4 className="text-lg font-bold text-[#1f3a34] mb-2">1. Geltungsbereich</h4>
                        <p>
                            Die Allgemeinen Geschäftsbedingungen (nachfolgend „AGB“ genannt) gelten für sämtliche Rechtsgeschäfte, die über den Onlineshop www.mamoru.shop abgeschlossen werden (nachfolgend „Onlineshop“ genannt). Der Onlineshop wird von der mamoruCH betrieben.
                        </p>
                        <p className="mt-2">
                            mamoruCH behält sich das Recht vor, diese AGB jederzeit zu ändern. Massgebend ist jeweils die zum Zeitpunkt der Bestellung geltende Version dieser AGB. Entgegenstehende oder von diesen AGB abweichende Bedingungen der Kundschaft werden nicht anerkannt.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#1f3a34] mb-2">2. Angebote und Preise</h4>
                        <p>
                            Die auf der Webseite angebotenen Artikel sind solange lieferbar, wie der Vorrat reicht. Bei Verfügbarkeitsproblemen werden wir Sie unverzüglich informieren. Die angegebenen Preise sind in CHF inklusive Mehrwertsteuer (MWST) und anderen Preisbestandteilen.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#1f3a34] mb-2">3. Bestellvorgang</h4>
                        <p>
                            Der Bestellvorgang beginnt mit der Auswahl der gewünschten Artikel auf unserer Webseite. Sie können die gewählten Artikel im Warenkorb sammeln und diesen über den Button „Zur Kasse“ in unserem Online-Shop befüllen. Im Rahmen des Bestellprozesses werden Sie alle relevanten Informationen zur Lieferadresse, Zahlungsmethode und Bestellbetrag eingeben müssen.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#1f3a34] mb-2">4. Zahlungsbedingungen</h4>
                        <p>
                            Wir akzeptieren folgende Zahlungsmethoden: Kreditkarte (Visa, Mastercard), Banküberweisung, PayPal und TWINT. Die Kosten der Zahlung sind in den meisten Fällen von Ihrer Bank oder Kreditkartenunternehmen zu tragen.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#1f3a34] mb-2">5. Lieferbedingungen</h4>
                        <p>
                            <strong>Lieferzeit:</strong> Die Lieferung erfolgt innerhalb von 2 bis 5 Tagen in der Schweiz, Deutschland, Österreich.<br />
                            <strong>Versandbenachrichtigung:</strong> Nach dem Versand erhalten Sie eine E-Mail mit den Sendungsverfolgungsdaten.<br />
                            <strong>Lieferverzögerungen:</strong> Sollte es zu Lieferverzögerungen kommen, informieren wir Sie umgehend über den neuen Liefertermin.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#1f3a34] mb-2">6. Rückgabe und Reklamation</h4>
                        <p>
                            <strong>Rückgabe:</strong> Artikel können innerhalb von 30 Tagen in neuwertigem, unbenutztem Zustand und in der Originalverpackung zurückgegeben werden. Rücksendekosten trägt der Käufer. Erstattung erfolgt in Form eines Gutscheincodes.<br />
                            <strong>Reklamation:</strong> Mängel oder falsche Lieferung müssen innerhalb von 14 Tagen nach Erhalt gemeldet werden.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#1f3a34] mb-2">7. Haftungsbeschränkung</h4>
                        <p>
                            Die Haftung richtet sich nach den anwendbaren gesetzlichen Bestimmungen. Allerdings haftet mamoruCH in keinem Fall für leichte Fahrlässigkeit, indirekte und mittelbare Schäden, Folgeschäden und entgangenen Gewinn sowie nicht realisierte Einsparungen.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#1f3a34] mb-2">8. Datenschutz</h4>
                        <p>
                            Wir verwenden Ihre personenbezogenen Daten ausschliesslich im Rahmen der gesetzlichen Bestimmungen und in Übereinstimmung mit unserer Datenschutzerklärung.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#1f3a34] mb-2">9. Geltendes Recht / Gerichtsstand</h4>
                        <p>
                            Diese AGB unterliegen dem schweizerischen Recht. Für alle Streitigkeiten aus oder im Zusammenhang mit diesen AGB wird als Gerichtsstand der Ort des Geschäftssitzes des Verkäufers (Lachen, Schweiz) festgelegt.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-[#1f3a34] mb-2">10. Änderungen und Kündigung</h4>
                        <p>
                            Wir behalten uns das Recht vor, diese AGB jederzeit zu ändern oder zu ergänzen. Wenn eine Bestimmung dieser AGB unwirksam ist, bleibt die übrige AGB gleichwohl wirksam.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default TermsPage;
