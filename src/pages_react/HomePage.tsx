

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Smile, Clock, ShieldCheck, Star, RotateCcw, Check, ChevronDown } from 'lucide-react';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { useProductsFromSheets, useHeroProduct } from '../hooks/useSheetsApi';
import { OptimizedImage } from '../components/OptimizedImage';
import { NewsletterSection } from '../components/NewsletterSection';
import { ProductSkeleton } from '../components/ProductSkeleton';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { productReviews } from '../data/productsReviews';

export const HomePage: React.FC = () => {
  const { products: allProducts, loading } = useProductsFromSheets();
  const { heroProduct, loading: heroLoading } = useHeroProduct();

  // Category chip state
  const [activeCategory, setActiveCategory] = useState<string>('Alle');

  // Responsive Product Limit (Mobile: 6, Desktop: 8)
  const [maxBestsellers, setMaxBestsellers] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches ? 8 : 6
  );

  React.useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const listener = (e: MediaQueryListEvent) => setMaxBestsellers(e.matches ? 8 : 6);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Top categories by product count (in-stock only), with pinned categories always included
  const topCategories = React.useMemo(() => {
    const pinned = ['Schminktische'];
    const inStock = allProducts.filter(p => !p.isOutOfStock && Number(p.stock) > 0);
    const counts: Record<string, number> = {};
    inStock.forEach(p => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    const dynamic = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .filter(name => !pinned.includes(name))
      .slice(0, 5 - pinned.length);
    return [...pinned, ...dynamic];
  }, [allProducts]);

  // Top Bestsellers by review count, filtered by active category chip
  const bestsellerProducts = React.useMemo(() => {
    return allProducts
      .filter(p => {
        if (p.isOutOfStock || Number(p.stock) <= 0) return false;
        if (activeCategory !== 'Alle' && p.category !== activeCategory) return false;
        return true;
      })
      .sort((a, b) => {
        const reviewsA = a.sku && productReviews[a.sku] ? productReviews[a.sku].length : 0;
        const reviewsB = b.sku && productReviews[b.sku] ? productReviews[b.sku].length : 0;
        return reviewsB - reviewsA;
      })
      .slice(0, maxBestsellers);
  }, [allProducts, maxBestsellers, activeCategory]);

  // Scroll-reveal refs for each section
  const categoriesReveal = useScrollReveal(0.1);
  const bestsellersReveal = useScrollReveal(0.08);
  const trustReveal = useScrollReveal(0.1);
  const socialReveal = useScrollReveal(0.08);

  // Fade key for bestseller grid animation on chip change
  const [fadeKey, setFadeKey] = useState(0);
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setFadeKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section - Full Width - Dynamically takes remaining viewport height for perfect integration */}
      <section className="relative h-[calc(100vh-60px)] md:h-[calc(100vh-140px)] min-h-[580px] md:min-h-[700px] w-full flex items-center justify-center text-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={heroProduct ? heroProduct.image : "/homepage_hero.webp"}
            alt={heroProduct ? heroProduct.name : "Modern Interior"}
            variant="full"
            sizes="100vw"
            className="w-full h-full"
            imgClassName="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-black/30 md:bg-black/20 z-10" />
        </div>

        {/* Content */}
        <div className="relative z-20 px-6 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 border border-white/40 rounded-full text-white text-xs md:text-sm uppercase tracking-[0.2em] font-medium mb-6 backdrop-blur-sm">
            MÖBEL & EINRICHTUNG
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight drop-shadow-md">
            Dein Zuhause. <br /> Dein Stil.
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light italic">
            Hochwertige Möbel für jeden Raum — von Office bis Wohnzimmer.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => {
                document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group flex items-center gap-2 px-10 py-4 bg-[#2E4D3F] text-white rounded-full text-lg font-bold transition-all transform hover:scale-[1.02] hover:shadow-xl active:scale-95 shadow-lg"
            >
              Jetzt entdecken
              <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-1" />
            </button>
          </div>

        </div>
      </section>

      {/* Categories Bento Box Grid */}
      <section id="categories" className="w-full py-20 lg:py-28 bg-white scroll-mt-20">
        <div
          ref={categoriesReveal.ref}
          className={`transition-all duration-[900ms] ease-out ${categoriesReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#2b4736] mb-3 block">Sortiment</span>
              <h2 className="text-3xl md:text-5xl font-bold text-[#111] mb-4">Entdecke unsere Welten</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Von Office bis Wohnzimmer — finde Möbel für jeden Raum.
              </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[180px] md:auto-rows-[220px]">

              {/* Large: Home Office (spans 2 cols, 2 rows) */}
              <Link to="/raum/home-office" className="group relative overflow-hidden rounded-2xl col-span-2 row-span-2 cursor-pointer">
                <img src="/homeoffice.jpg" alt="Home Office" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-1 block">Raum</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">Home Office</h3>
                  <p className="text-white/70 text-sm mt-1 hidden md:block">Schreibtische, Bürostühle & mehr</p>
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </Link>

              {/* Medium: Schminktische (spans 2 cols, 1 row) */}
              <Link to="/kategorie/schminktische" className="group relative overflow-hidden rounded-2xl col-span-2 row-span-1 cursor-pointer">
                <img src="/vanity_beauty_lifestyle.png" alt="Schminktische" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 md:p-6">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-1 block">Kategorie</span>
                  <h3 className="text-xl md:text-2xl font-bold text-white">Schminktische</h3>
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </Link>

              {/* Medium: Höhenverstellbare Schreibtische (spans 2 cols, 1 row) */}
              <Link to="/kategorie/hoehenverstellbare-schreibtische" className="group relative overflow-hidden rounded-2xl col-span-2 row-span-1 cursor-pointer">
                <img src="/home_office_lifestyle.png" alt="Höhenverstellbare Schreibtische" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 md:p-6">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-1 block">Kategorie</span>
                  <h3 className="text-xl md:text-2xl font-bold text-white">Höhenverstellbare Schreibtische</h3>
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </Link>

              {/* Small: Wohnzimmer */}
              <Link to="/raum/wohnzimmer" className="group relative overflow-hidden rounded-2xl col-span-1 row-span-1 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop" alt="Wohnzimmer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 md:p-5">
                  <h3 className="text-lg font-bold text-white">Wohnzimmer</h3>
                </div>
              </Link>

              {/* Small: Schlafzimmer */}
              <Link to="/raum/schlafzimmer" className="group relative overflow-hidden rounded-2xl col-span-1 row-span-1 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop" alt="Schlafzimmer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 md:p-5">
                  <h3 className="text-lg font-bold text-white">Schlafzimmer</h3>
                </div>
              </Link>

              {/* Small: Badezimmer */}
              <Link to="/raum/badezimmer" className="group relative overflow-hidden rounded-2xl col-span-1 row-span-1 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&h=400&fit=crop" alt="Badezimmer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 md:p-5">
                  <h3 className="text-lg font-bold text-white">Badezimmer</h3>
                </div>
              </Link>

              {/* Small: Küche & Esszimmer */}
              <Link to="/raum/kueche-esszimmer" className="group relative overflow-hidden rounded-2xl col-span-1 row-span-1 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=400&fit=crop" alt="Küche & Esszimmer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 md:p-5">
                  <h3 className="text-lg font-bold text-white">Küche</h3>
                </div>
              </Link>

            </div>

            {/* CTA under grid */}
            <div className="flex justify-center mt-12">
              <Link to="/shop" className="group flex items-center gap-2 text-[#2b4736] font-bold text-sm uppercase tracking-wider hover:gap-3 transition-all">
                Alle Produkte ansehen
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container with alternating rhythm */}
      <div className="w-full">
        {/* Bestseller Section */}
        <div id="bestsellers" className="bg-[#FAF9F6] py-20 lg:py-24 border-b border-gray-50 scroll-mt-20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <section
              ref={bestsellersReveal.ref}
              className={`transition-all duration-[900ms] ease-out ${bestsellersReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              {/* Section Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-5xl font-bold text-[#111] mb-4">Unsere Bestseller</h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                  Entdecke die beliebtesten Möbel unserer Kunden.
                </p>
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                <button
                  onClick={() => handleCategoryChange('Alle')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === 'Alle'
                    ? 'bg-[#2b4736] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2b4736] hover:text-[#2b4736]'
                    }`}
                >
                  Alle
                </button>
                {topCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat
                      ? 'bg-[#2b4736] text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2b4736] hover:text-[#2b4736]'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product Grid - 4 columns */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                  <ProductSkeleton count={4} />
                </div>
              ) : (
                <div
                  key={fadeKey}
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 animate-[fadeSlideIn_0.5s_ease-out]"
                >
                  {bestsellerProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Trust Section - Why MAMORU MÖBEL? (Card Style) - White Background */}
        <section className="bg-white py-20 lg:py-24 border-b border-gray-100">
          <div
            ref={trustReveal.ref}
            className={`max-w-[1280px] mx-auto px-4 md:px-8 transition-all duration-[900ms] ease-out ${trustReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111] mb-4">Warum MAMORU MÖBEL?</h2>
              <p className="text-gray-500 text-lg">Ihr erster Anlaufpunkt für die Ausstattung Ihres Zuhauses.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 gap-y-14 md:gap-y-16">
              {[
                {
                  icon: Truck,
                  highlight: "Kostenloser",
                  rest: "Versand",
                  desc: "Gratis-Lieferung in der Schweiz & Deutschland."
                },
                {
                  icon: Smile,
                  highlight: "24/5",
                  rest: "Support",
                  desc: "Persönlicher Kundenservice Mo–Fr für Sie da."
                },
                {
                  icon: Clock,
                  highlight: "30-Tage",
                  rest: "Rückgabe",
                  desc: "Unkomplizierter Umtausch innerhalb von 30 Tagen."
                },
                {
                  icon: ShieldCheck,
                  highlight: "100% sichere",
                  rest: "Zahlung",
                  desc: "SSL-verschlüsselt mit allen gängigen Methoden."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 md:p-8 pt-11 md:pt-12 rounded-2xl text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 relative group flex flex-col h-full">
                  <div className="absolute -top-6 md:-top-7 left-1/2 -translate-x-1/2 bg-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-md border border-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-10">
                    <item.icon className="w-6 h-6 md:w-7 md:h-7 text-[#333] stroke-[1.5]" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 mt-1 md:mt-2">
                    <span className="text-[#E94E34]">{item.highlight}</span> <span className="text-[#111]">{item.rest}</span>
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-grow">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section - Very Light Grey Background */}
        <div className="bg-[#F7F7F7] py-20 lg:py-32 border-b border-gray-50 relative overflow-hidden">
          {/* Subtle gradient texture for warmth */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C1A488_1px,transparent_1px)] [background-size:20px_20px]" />

          <div
            ref={socialReveal.ref}
            className={`max-w-[1280px] mx-auto px-4 md:px-8 text-center relative z-10 transition-all duration-[900ms] ease-out ${socialReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-[#111] mb-4">1.200+ zufriedene Kunden</h2>
            <p className="text-gray-500 text-lg mb-16">Erlebe Qualität, die begeistert.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
              {[
                { name: 'Markus', city: 'Zürich', text: 'Sehr hochwertiger Schreibtisch. Stabil und modern. Der Aufbau war kinderleicht und das Ergebnis überzeugt auf ganzer Linie.' },
                { name: 'Laura', city: 'Bern', text: 'Der Schminktisch ist ein echtes Highlight in meinem Schlafzimmer. Die integrierten LEDs sind perfekt für mein tägliches Beauty-Ritual.' },
                { name: 'Daniel', city: 'Basel', text: 'Schnelle Lieferung und top Service. Die Qualität der Möbel ist für diesen Preis unschlagbar. Würde jederzeit wieder hier bestellen.' }
              ].map((t, i) => (
                <div key={i} className="bg-white p-10 rounded-2xl shadow-md border border-gray-100/50 text-left flex flex-col h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="flex gap-1.5 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                    ))}
                  </div>
                  <p className="text-[#444] text-lg italic leading-relaxed mb-8 flex-grow">"{t.text}"</p>
                  <div className="text-base flex flex-col gap-0.5">
                    <span className="font-bold text-[#111]">{t.name}</span>
                    <span className="text-gray-400 text-sm">{t.city}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter - White Background */}
        <div className="bg-white pt-20 pb-32">
          <NewsletterSection />
        </div>
      </div>
    </div>
  );
};
