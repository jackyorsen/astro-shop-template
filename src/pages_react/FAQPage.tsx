import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    toggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, toggle }) => {
    return (
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
            <button
                onClick={toggle}
                className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none"
            >
                <span className={`font-bold text-[#333] ${isOpen ? 'text-[#2b4736]' : ''}`}>{question}</span>
                {isOpen ? <ChevronUp className="text-[#2b4736] w-5 h-5 flex-shrink-0" /> : <ChevronDown className="text-gray-400 w-5 h-5 flex-shrink-0" />}
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-5 pt-0 text-gray-600 text-sm leading-relaxed border-t border-transparent">
                    {answer}
                </div>
            </div>
        </div>
    );
};

export const FAQPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [activeCategory, setActiveCategory] = useState<string>('bestellungen');

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqData = {
        bestellungen: [
            {
                q: "Wie kann ich den Status meiner Bestellung überprüfen?",
                a: "Sie können Ihre Bestellung direkt in Ihrem Kundenkonto unter 'Meine Bestellungen' verfolgen. Zusätzlich erhalten Sie per E-Mail eine Versandbestätigung mit Tracking-Link, sobald Ihr Paket unser Lager verlassen hat."
            },
            {
                q: "Kann ich meine Bestellung stornieren?",
                a: "Solange Ihre Bestellung noch nicht versandt wurde, können Sie diese stornieren. Bitte kontaktieren Sie hierzu schnellstmöglich unseren Kundenservice. Nach dem Versand ist eine Stornierung nicht mehr möglich, Sie können die Ware jedoch nach Erhalt zurücksenden."
            },
            {
                q: "Ich habe keine Bestellbestätigung erhalten. Was nun?",
                a: "Bitte prüfen Sie zunächst Ihren Spam-Ordner. In der Regel erhalten Sie die Bestätigung innerhalb von 30 Minuten. Falls Sie auch dort nichts finden, loggen Sie sich in Ihr Kundenkonto ein oder kontaktieren Sie unseren Support."
            },
            {
                q: "Wo finde ich meine Rechnung?",
                a: "Ihre Rechnung steht Ihnen in Ihrem Kundenkonto unter der jeweiligen Bestellung zum Download bereit. Zudem erhalten Sie die Rechnung in der Regel per E-Mail nach Versand der Ware."
            },
            {
                q: "Kann ich meine Lieferadresse nachträglich ändern?",
                a: "Eine Änderung der Lieferadresse ist nur möglich, solange die Bestellung noch nicht bearbeitet wurde. Bitte wenden Sie sich umgehend an unseren Kundenservice."
            }
        ],
        versand: [
            {
                q: "In welche Länder liefern Sie?",
                a: "Wir liefern derzeit nach Deutschland, Österreich und in die Schweiz."
            },
            {
                q: "Wie hoch sind die Versandkosten?",
                a: "Der Versand ist für alle Bestellungen innerhalb unseres Liefergebiets (DE, AT, CH) kostenlos."
            },
            {
                q: "Wie lange dauert die Lieferung?",
                a: "Die Lieferzeit beträgt in der Regel 2-5 Werktage nach Warenausgang. In Ausnahmefällen kann es bis zu 9 Tage dauern."
            },
            {
                q: "Mit welchem Dienstleister versenden Sie?",
                a: "Wir versenden unsere Pakete hauptsächlich mit DPD, UPS und DHL, um eine schnelle und sichere Zustellung zu gewährleisten."
            },
            {
                q: "Was passiert, wenn ich bei der Zustellung nicht zuhause bin?",
                a: "Der Zusteller unternimmt in der Regel bis zu 3 Zustellversuche. Alternativ wird das Paket bei einem Nachbarn abgegeben oder in einen Paketshop in Ihrer Nähe gebracht. Über den Tracking-Link können Sie den Status einsehen."
            }
        ],
        rueckgabe: [
            {
                q: "Wie lange kann ich Artikel zurückgeben?",
                a: "Sie haben 30 Tage nach Erhalt der Ware Zeit, diese an uns zurückzusenden."
            },
            {
                q: "Ist die Rücksendung kostenlos?",
                a: "Nein, die Kosten für den Rückversand tragen Sie als Käufer. Wir stellen keine Rücksendeetiketten zur Verfügung."
            },
            {
                q: "Wie erhalte ich meine Rückerstattung?",
                a: "Nach Prüfung der Retoure erstatten wir den Betrag in Form eines Gutscheincodes, den Sie für Ihren nächsten Einkauf nutzen können."
            },
            {
                q: "Was mache ich, wenn ein Artikel beschädigt ankommt?",
                a: "Das tut uns leid! Bitte senden Sie uns Fotos des beschädigten Artikels und Ihre Bestellnummer per E-Mail. Wir kümmern uns sofort um eine Lösung (Ersatz oder Erstattung)."
            }
        ]
    };

    const categories = [
        { id: 'bestellungen', label: 'Bestellung & Zahlung' },
        { id: 'versand', label: 'Versand & Lieferung' },
        { id: 'rueckgabe', label: 'Rückgabe & Umtausch' },
    ];

    const currentQuestions = faqData[activeCategory as keyof typeof faqData];

    return (
        <div className="w-full bg-[#fcfcfc] font-sans text-[#333] min-h-screen">
            {/* Hero Header */}
            <div className="bg-[#1f3a34] text-white py-16 px-4 text-center">
                <div className="max-w-2xl mx-auto">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-90" strokeWidth={1.5} />
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Häufige Fragen (FAQ)</h1>
                    <p className="text-lg text-white/80 font-medium">
                        Hier finden Sie Antworten auf die wichtigsten Fragen.
                    </p>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 py-12 md:py-16">

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setOpenIndex(null); // Reset open item when switching category
                            }}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${activeCategory === cat.id
                                    ? 'bg-[#2b4736] text-white shadow-lg shadow-[#2b4736]/20 ring-2 ring-[#2b4736] ring-offset-2'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4 max-w-3xl mx-auto">
                    {currentQuestions.map((item, index) => (
                        <FAQItem
                            key={index}
                            question={item.q}
                            answer={item.a}
                            isOpen={openIndex === index}
                            toggle={() => toggleFAQ(index)}
                        />
                    ))}
                </div>

                {/* Still Questions? */}
                <div className="mt-20 text-center border-t border-gray-200 pt-16">
                    <h3 className="text-2xl font-bold text-[#333] mb-4">Noch Fragen offen?</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Unser Kundenservice hilft Ihnen gerne weiter. Wir antworten in der Regel innerhalb von 24 Stunden.
                    </p>
                    <a
                        href="mailto:support@mamoru.de"
                        className="inline-flex items-center justify-center px-8 py-3 bg-[#2b4736] text-white rounded-lg font-bold hover:bg-[#1f3a34] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Kundenservice kontaktieren
                    </a>
                </div>

            </div>
        </div>
    );
};

export default FAQPage;
