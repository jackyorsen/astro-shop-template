import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Sun, Info, Heart, ShieldCheck, Truck, CreditCard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '../components/OptimizedImage';

export const LandingPageSchminktisch: React.FC = () => {

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sku = "SCHMINKTISCH_XYZ";
    const checkoutUrl = `/checkout?sku=${sku}`;

    const features = [
        {
            icon: <Sun className="w-6 h-6 text-[#2b4736]" />,
            title: "Perfekte Beleuchtung",
            desc: "Das integrierte LED-Licht sorgt für natürliche, schattenfreie Ausleuchtung zu jeder Tageszeit."
        },
        {
            icon: <Info className="w-6 h-6 text-[#2b4736]" />,
            title: "Intelligenter Stauraum",
            desc: "Großzügige Schubläden und Fächer halten deine Beauty-Essentials organisiert und griffbereit."
        },
        {
            icon: <Star className="w-6 h-6 text-[#2b4736]" />,
            title: "Zeitloses Design",
            desc: "Minimalistische Ästhetik, die sich harmonisch in jedes Schlafzimmer einfügt."
        },
        {
            icon: <Heart className="w-6 h-6 text-[#2b4736]" />,
            title: "Dein Ritual",
            desc: "Ein Ort, an dem du den Tag entspannt beginnst oder ruhig ausklingen lässt."
        }
    ];

    return (
        <div className="bg-[#fcfbf9] min-h-screen font-sans text-[#333]">

            {/* 1. HERO SECTION */}
            <section className="relative w-full h-[90vh] md:h-screen max-h-[1080px] overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <OptimizedImage
                        src="/landing_hero.png"
                        alt="Mamoru Schminktisch - Dein Ruhepol"
                        variant="full"
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent md:from-white/80 md:via-white/40 md:to-transparent"></div>
                    {/* Note: In mobile we darken for white text, in desktop we might want a light sidebar? Let's stick to simple overlay */}
                    <div className="absolute inset-0 bg-black/20 md:bg-white/10 mix-blend-overlay"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-center items-start px-6 md:px-20 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-xl md:bg-white/80 md:backdrop-blur-xl md:p-10 md:rounded-2xl md:shadow-sm"
                    >
                        <span className="block text-[#2b4736] tracking-[0.2em] text-sm uppercase font-semibold mb-4">Self-Care Edition</span>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6 text-white md:text-[#2b4736] drop-shadow-md md:drop-shadow-none">
                            Dein täglicher Moment nur für dich.
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 md:text-gray-600 mb-8 leading-relaxed font-light">
                            Ein fester Ort für Ruhe, Ordnung und deine persönliche Routine.
                            Beginne jeden Tag mit einem Lächeln.
                        </p>
                        <Link to={checkoutUrl}>
                            <button className="bg-[#2b4736] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#1a2f22] transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2">
                                Jetzt entdecken <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* 2. IDENTIFIKATION (Problem) */}
            <section className="py-20 md:py-32 px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-light text-gray-400 mb-12">Kennst du das?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="p-6">
                                <div className="text-4xl mb-4 opacity-30">🌪️</div>
                                <h3 className="text-xl font-medium mb-3 text-gray-800">Fehlender Platz</h3>
                                <p className="text-gray-500">Deine Produkte liegen verstreut im Bad oder auf Kommoden.</p>
                            </div>
                            <div className="p-6">
                                <div className="text-4xl mb-4 opacity-30">💡</div>
                                <h3 className="text-xl font-medium mb-3 text-gray-800">Schlechtes Licht</h3>
                                <p className="text-gray-500">Das Make-up Ergebnis wird durch falsche Beleuchtung verfälscht.</p>
                            </div>
                            <div className="p-6">
                                <div className="text-4xl mb-4 opacity-30">⏳</div>
                                <h3 className="text-xl font-medium mb-3 text-gray-800">Hektik am Morgen</h3>
                                <p className="text-gray-500">Keine Ruhe für dich selbst, alles muss schnell gehen.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 3. LÖSUNG & EMOTION */}
            <section className="py-20 bg-[#f4f7f5]">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px]"
                    >
                        <OptimizedImage
                            src="/landing_detail.png"
                            alt="Schminktisch Detail Organisation"
                            variant="small"
                            className="w-full h-full"
                            imgClassName="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-[#2b4736] font-bold tracking-wider text-sm uppercase mb-2 block">Die Lösung</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2b4736] mb-8">
                            Dein persönlicher Rückzugsort.
                        </h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Stell dir vor, du hast einen Ort, der nur dir gehört. Wo jedes Produkt seinen Platz hat und das Licht immer perfekt ist.
                        </p>
                        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                            Der Mamoru Schminktisch ist mehr als nur ein Möbelstück. Er ist eine Einladung, dir jeden Tag bewusst Zeit für dich zu nehmen. Für Struktur, Klarheit und dein eigenes kleines Ritual.
                        </p>
                        <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-6 h-6 rounded-full bg-[#2b4736]/10 flex items-center justify-center text-[#2b4736]"><Check size={14} /></div>
                                <span>Alles griffbereit und organisiert</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-6 h-6 rounded-full bg-[#2b4736]/10 flex items-center justify-center text-[#2b4736]"><Check size={14} /></div>
                                <span>Sanftes Licht für perfekte Ergebnisse</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-6 h-6 rounded-full bg-[#2b4736]/10 flex items-center justify-center text-[#2b4736]"><Check size={14} /></div>
                                <span>Ein Design, das Ruhe ausstrahlt</span>
                            </div>
                        </div>
                        <Link to={checkoutUrl}>
                            <button className="bg-white border md:border-2 border-[#2b4736] text-[#2b4736] px-8 py-3 rounded-full font-medium hover:bg-[#2b4736] hover:text-white transition-all">
                                Zum Produkt
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* 4. FEATURES */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-serif font-bold text-[#333]">Durchdacht bis ins Detail</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center"
                        >
                            <div className="w-12 h-12 bg-[#2b4736]/5 rounded-full flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-[#2b4736] mb-3">{feature.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 5. TRUST SEKTION */}
            <section className="py-16 bg-[#eef2f0] border-t border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-300">
                        <div className="px-4 py-4">
                            <Truck className="w-8 h-8 text-[#2b4736] mx-auto mb-4 opacity-80" />
                            <h4 className="font-bold text-gray-800 mb-1">Kostenloser & Sicherer Versand</h4>
                            <p className="text-xs text-gray-500">Wir bringen dein neues Lieblingsstück sicher zu dir.</p>
                        </div>
                        <div className="px-4 py-4">
                            <ShieldCheck className="w-8 h-8 text-[#2b4736] mx-auto mb-4 opacity-80" />
                            <h4 className="font-bold text-gray-800 mb-1">30 Tage Rückgaberecht</h4>
                            <p className="text-xs text-gray-500">Teste in Ruhe zu Hause. Passt es nicht, nehmen wir es zurück.</p>
                        </div>
                        <div className="px-4 py-4">
                            <CreditCard className="w-8 h-8 text-[#2b4736] mx-auto mb-4 opacity-80" />
                            <h4 className="font-bold text-gray-800 mb-1">Sichere Zahlung</h4>
                            <p className="text-xs text-gray-500">Verschlüsselt und sicher bezahlen (Kreditkarte, TWINT, Rechnung).</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. FINAL CTA & OFFER */}
            <section className="py-24 px-6 text-center relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2b4736] to-transparent opacity-20"></div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2b4736] mb-6">
                        Mach dich bereit zu strahlen.
                    </h2>
                    <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
                        Gönn dir den Platz, den du verdienst. Bestelle jetzt deinen Mamoru Schminktisch und freu dich auf mehr Ordnung und Ruhe.
                    </p>

                    <Link to={checkoutUrl} className="inline-block relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#2b4736] to-[#4a7a5e] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                        <button className="relative bg-[#2b4736] text-white px-12 py-5 rounded-full text-xl font-medium shadow-2xl hover:bg-[#233a2d] transition-colors flex items-center gap-3">
                            Jetzt Schminktisch bestellen <ArrowRight />
                        </button>
                    </Link>

                    <p className="mt-8 text-sm text-gray-400">
                        Limitiertes Angebot. Nur solange der Vorrat reicht.
                    </p>
                </div>
            </section>

            {/* Footer Minimal */}
            <footer className="py-8 text-center text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                <p>&copy; {new Date().getFullYear()} Mamoru Möbel. All rights reserved.</p>
                <div className="mt-2 space-x-4">
                    <Link to="/impressum" className="hover:text-gray-600 transition-colors">Impressum</Link>
                    <Link to="/datenschutzerklaerung" className="hover:text-gray-600 transition-colors">Datenschutz</Link>
                    <Link to="/agb" className="hover:text-gray-600 transition-colors">AGB</Link>
                </div>
            </footer>

        </div>
    );
};

export default LandingPageSchminktisch;
