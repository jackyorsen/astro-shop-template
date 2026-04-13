import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, HelpCircle, ChevronDown, Heart, Plus, Minus, ArrowRight, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProductsFromSheets } from '../hooks/useSheetsApi';
import { getCategoriesByMainGroup, MAIN_GROUPS, getSlug } from '../utils/categoryHelper';
import { MegaMenu } from './MegaMenu';
import { RoomsMegaMenu } from './RoomsMegaMenu';
import { OptimizedImage } from './OptimizedImage';

import { formatPrice } from '../utils/currency';
import { filterShopProducts } from '../utils/productFilters';

export const Header: React.FC = () => {
  const { cartCount, openCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastScrollY = useRef(0);

  // Mega Menu States
  const [isMegaMenuHovered, setIsMegaMenuHovered] = useState(false);
  const [isRoomsMegaMenuHovered, setIsRoomsMegaMenuHovered] = useState(false);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState<string | null>(null);
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomsMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search Autocomplete State
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      setShowScrollTop(currentScrollY > 400);

      if (window.innerWidth <= 768) {
        if (currentScrollY > lastScrollY.current) {
          setIsVisible(true);
        } else if (currentScrollY < lastScrollY.current) {
          if (currentScrollY > 100) setIsVisible(false);
        }
        if (currentScrollY < 10) setIsVisible(true);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { products } = useProductsFromSheets({ includeHidden: true });

  // Build category structure for Mega Menu
  const menuStructure = useMemo(() => {
    return getCategoriesByMainGroup(products);
  }, [products]);

  // Filter products for autocomplete
  const suggestions = useMemo(() => {
    if (searchTerm.length < 2 || !products) return [];

    const shopProducts = filterShopProducts(products);
    const lowerTerm = searchTerm.toLowerCase().trim();

    return shopProducts
      .filter(p => {
        const titleMatch = p.title.toLowerCase().includes(lowerTerm);
        const categoryMatch = p.category.toLowerCase().includes(lowerTerm);
        const skuMatch = p.sku?.toLowerCase().includes(lowerTerm);
        const descriptionMatch = p.description?.toLowerCase().includes(lowerTerm);
        return titleMatch || categoryMatch || skuMatch || descriptionMatch;
      })
      .sort((a, b) => {
        const aExactSku = a.sku?.toLowerCase() === lowerTerm;
        const bExactSku = b.sku?.toLowerCase() === lowerTerm;
        if (aExactSku && !bExactSku) return -1;
        if (!aExactSku && bExactSku) return 1;
        return 0;
      })
      .slice(0, 5);
  }, [searchTerm, products]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search when location changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowSuggestions(false);
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (term) {
      const lowerTerm = term.toLowerCase();
      const shopProducts = products ? filterShopProducts(products) : [];
      const exactMatch = shopProducts.find(p => p.sku?.toLowerCase() === lowerTerm);

      if (exactMatch) {
        navigate(`/product/${exactMatch.sku}`);
        setSearchTerm('');
      } else {
        navigate(`/shop?q=${encodeURIComponent(term)}`);
      }
      setShowSuggestions(false);
    }
  };

  // Mega Menu hover handlers with delay to prevent flicker
  const handleMegaMenuEnter = () => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setIsMegaMenuHovered(true);
  };
  const handleMegaMenuLeave = () => {
    megaMenuTimeout.current = setTimeout(() => setIsMegaMenuHovered(false), 150);
  };

  const handleRoomsMenuEnter = () => {
    if (roomsMenuTimeout.current) clearTimeout(roomsMenuTimeout.current);
    setIsRoomsMegaMenuHovered(true);
  };
  const handleRoomsMenuLeave = () => {
    roomsMenuTimeout.current = setTimeout(() => setIsRoomsMegaMenuHovered(false), 150);
  };

  // Mobile accordion toggle
  const toggleMobileGroup = (group: string) => {
    setExpandedMobileGroup(prev => prev === group ? null : group);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#2b4736] text-white text-[12px] py-2 px-4 hidden md:block transition-colors">
        <div className="max-w-[1320px] mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="font-medium">Kostenloser Versand</span>
            <span className="opacity-80">30 Tage Rückgaberecht</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/help" className="hover:text-gray-200 flex items-center transition-colors"><HelpCircle className="w-3.5 h-3.5 mr-1" /> Hilfe & Kontakt</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 bg-white font-sans transition-all duration-300 site-header ${!isVisible ? 'site-header--hidden' : ''} ${isScrolled ? 'shadow-md backdrop-blur-md bg-white/95' : 'shadow-[0_2px_20px_rgba(0,0,0,0.03)]'
          }`}
      >

        {/* UPPER ROW: Logo, Search, Icons */}
        <div className={`border-b border-gray-50 transition-all duration-300 ${isScrolled ? 'py-1' : 'py-0'}`}>
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-[72px] md:h-[88px] flex items-center justify-between gap-6 lg:gap-16">

            {/* Mobile: Three-column layout (Hamburger | Logo | Icons) */}
            <div className="flex md:flex-none items-center flex-shrink-0 md:relative">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-3 -ml-3 mr-2 md:mr-4 text-gray-800 md:hidden hover:text-[#2b4736] transition-colors active:scale-95 duration-200"
                aria-label="Menü öffnen"
              >
                <Menu className="w-6 h-6 stroke-[1.5]" />
              </button>

              <Link
                to="/"
                className="flex items-center md:ml-0"
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault(); // already on homepage — do nothing
                  }
                }}
              >
                <img
                  src="/logo-mamoru.png"
                  alt="Mamoru Möbel"
                  className="h-[42px] md:h-[55px] w-auto"
                />
              </Link>
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => searchTerm.length >= 3 && setShowSuggestions(true)}
                  placeholder="Wonach suchen Sie?"
                  className="w-full h-[52px] bg-white text-gray-800 text-[15px] pl-6 pr-14 rounded-full border border-gray-200 focus:outline-none focus:border-[#2b4736] focus:ring-1 focus:ring-[#2b4736] transition-all placeholder-gray-400 shadow-sm"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#2b4736] rounded-full flex items-center justify-center text-white hover:bg-[#1f3528] transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {showSuggestions && (
                <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white rounded-xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  {suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((product) => (
                        <li key={product.id} className="border-b border-gray-50 last:border-0">
                          <button
                            onClick={() => handleSuggestionClick(product.slug)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group"
                          >
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                              <OptimizedImage
                                src={product.image}
                                alt={product.title}
                                variant="small"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#2b4736]">{product.title}</p>
                              <p className="text-xs text-gray-500 truncate">{product.category}</p>
                            </div>
                            <div className="text-sm font-bold text-[#2b4736] whitespace-nowrap">
                              {(() => {
                                const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');
                                const price = isCH ? (product as any).price_ch ?? product.price : product.price;
                                const pricePrev = isCH ? (product as any).pricePrev_ch ?? (product as any).pricePrev : (product as any).pricePrev;
                                const effectivePrice = (pricePrev && pricePrev < price) ? pricePrev : price;
                                return formatPrice(effectivePrice);
                              })()}
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90" />
                          </button>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full py-4 px-4 bg-gray-50 text-xs font-bold text-[#2b4736] uppercase tracking-wider hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                          Alle Ergebnisse anzeigen <ArrowRight className="w-3 h-3" />
                        </button>
                      </li>
                    </ul>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      <p>Keine Produkte gefunden für "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-6 flex-shrink-0">
              <Link to="/account" className="hidden md:flex p-2 text-gray-700 hover:text-[#2b4736] transition-colors flex-col items-center justify-center group">
                <User className="w-6 h-6 stroke-[1.5] group-hover:scale-110 transition-transform duration-200" />
              </Link>

              <Link to="/wishlist" className="flex p-2 text-gray-700 hover:text-[#2b4736] transition-colors flex-col items-center justify-center group">
                <Heart className="w-6 h-6 stroke-[1.5] group-hover:scale-110 transition-transform duration-200" />
              </Link>

              <button
                onClick={openCart}
                className="p-2 text-gray-700 hover:text-[#2b4736] transition-colors flex items-center gap-2 group"
                aria-label="Warenkorb öffnen"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 stroke-[1.5] group-hover:scale-110 transition-transform duration-200" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#d9534f] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block font-bold text-sm group-hover:text-[#2b4736] transition-colors">Warenkorb</span>
              </button>
            </div>
          </div>
        </div>

        {/* LOWER ROW: Navigation Links (Desktop) — FULL MENU WITH MEGA MENUS */}
        <div className="hidden md:block bg-white border-b border-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center justify-center space-x-12 h-[56px]">

              {/* Produkte — Mega Menu Trigger */}
              <div
                className="h-full flex items-center"
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
              >
                <Link
                  to="/shop"
                  className={`text-[13px] font-bold flex items-center h-full transition-colors relative z-10 uppercase tracking-[0.1em] border-b-2 ${isMegaMenuHovered ? 'text-[#2b4736] border-[#2b4736]' : 'text-[#333] border-transparent hover:text-[#2b4736]'}`}
                >
                  Produkte
                  <ChevronDown className={`w-3 h-3 ml-1.5 transition-transform duration-200 ${isMegaMenuHovered ? 'rotate-180' : ''}`} />
                </Link>
                {/* Mega Menu Overlay */}
                <MegaMenu
                  structure={menuStructure}
                  isVisible={isMegaMenuHovered}
                  onClose={() => setIsMegaMenuHovered(false)}
                />
              </div>


              {/* Räume — Rooms Mega Menu Trigger */}
              <div
                className="h-full flex items-center"
                onMouseEnter={handleRoomsMenuEnter}
                onMouseLeave={handleRoomsMenuLeave}
              >
                <Link
                  to="/shop"
                  className={`text-[13px] font-bold flex items-center h-full transition-colors relative z-10 uppercase tracking-[0.1em] border-b-2 ${isRoomsMegaMenuHovered ? 'text-[#2b4736] border-[#2b4736]' : 'text-[#333] border-transparent hover:text-[#2b4736]'}`}
                >
                  Räume
                  <ChevronDown className={`w-3 h-3 ml-1.5 transition-transform duration-200 ${isRoomsMegaMenuHovered ? 'rotate-180' : ''}`} />
                </Link>
                {/* Rooms Mega Menu Overlay */}
                <RoomsMegaMenu
                  isVisible={isRoomsMegaMenuHovered}
                  onClose={() => setIsRoomsMegaMenuHovered(false)}
                />
              </div>

              {/* Sale */}
              <NavLink
                to="/sale"
                className={({ isActive }) =>
                  `text-[13px] font-bold uppercase tracking-[0.1em] h-full flex items-center border-b-2 transition-all duration-200 ${isActive ? 'text-[#d9534f] border-[#d9534f]' : 'text-[#d9534f] border-transparent hover:border-[#d9534f]/20 hover:text-[#b52b27]'}`
                }
              >
                Sale
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 backdrop-blur-sm md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Off-Canvas Menu Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[60] transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:hidden flex flex-col shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="text-xl font-bold tracking-[0.1em] uppercase text-[#333]">MAMORU</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col">


            {/* Mobile Accordion for Main Product Groups */}
            {MAIN_GROUPS.map((group) => {
              const subCats = menuStructure[group];
              const hasSubCats = subCats && subCats.length > 0;
              const isExpanded = expandedMobileGroup === group;

              if (!hasSubCats) return null;

              return (
                <div key={group} className="border-b border-gray-50">
                  <button
                    onClick={() => toggleMobileGroup(group)}
                    className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold uppercase tracking-wide text-gray-700 hover:bg-gray-50 hover:text-[#2b4736] transition-colors"
                  >
                    {group}
                    {isExpanded ? <Minus className="w-4 h-4 text-[#2b4736]" /> : <Plus className="w-4 h-4 text-gray-400" />}
                  </button>

                  {/* Accordion Content */}
                  <div className={`bg-gray-50 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
                    <ul className="flex flex-col py-2">
                      {subCats.map(cat => (
                        <li key={cat}>
                          <Link
                            to={`/kategorie/${getSlug(cat)}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-8 py-3 text-sm text-gray-600 hover:text-[#2b4736] border-l-2 border-transparent hover:border-[#2b4736] ml-6 transition-all"
                          >
                            {cat}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}

            <NavLink
              to="/sale"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `px-6 py-4 text-sm font-bold uppercase tracking-wide border-l-4 transition-colors ${isActive ? 'border-[#d9534f] text-[#d9534f] bg-red-50' : 'border-transparent text-[#d9534f] hover:bg-red-50'}`
              }
            >
              Sale
            </NavLink>

            <Link
              to="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="px-6 py-4 text-sm font-bold uppercase tracking-wide text-gray-700 hover:bg-gray-50 hover:text-[#2b4736] border-b border-gray-50 transition-colors"
            >
              Alle Artikel
            </Link>
          </nav>

          <div className="mt-8 px-6 pb-8 space-y-4 border-t border-gray-50 pt-8">
            <Link to="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center text-gray-600 font-medium hover:text-[#2b4736]">
              <User className="w-5 h-5 mr-3" /> Mein Konto
            </Link>
            <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center text-gray-600 font-medium hover:text-[#2b4736]">
              <Heart className="w-5 h-5 mr-3" /> Wunschliste
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll-to-Top Button — Desktop only */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Nach oben scrollen"
        className={`hidden md:flex fixed bottom-8 right-8 z-50 items-center justify-center w-10 h-10 bg-[#2b4736]/10 text-[#2b4736] border border-[#2b4736]/20 rounded-lg hover:bg-[#2b4736]/20 active:scale-95 backdrop-blur-sm transition-all duration-300 ${showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </>
  );
};
