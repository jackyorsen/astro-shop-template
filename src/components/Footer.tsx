import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';


export const Footer: React.FC = () => {
  // Detect if we're on the .ch domain
  const isCH = typeof window !== 'undefined' && window.location.hostname.includes('.ch');

  return (
    <footer className="bg-[#1a2e22] text-white mt-auto border-t border-[#2b4736]/30">
      {/* Main Footer Content */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <img
              src="/logo-mamoru.png"
              alt="Mamoru Möbel"
              className="h-[55px] w-auto invert mb-4"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Entdecken Sie zeitloses Design für Ihr Zuhause. Premium Qualität, nachhaltige Materialien und exzellenter Service seit 2020.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2b4736] transition-all duration-300" aria-label="Facebook"><Facebook size={16} /></a>
              <a href="#" className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2b4736] transition-all duration-300" aria-label="Instagram"><Instagram size={16} /></a>
              <a href="#" className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2b4736] transition-all duration-300" aria-label="Twitter"><Twitter size={16} /></a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="text-sm font-bold mb-6 uppercase tracking-widest text-white">Kategorien</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/raum/wohnzimmer" className="hover:text-white hover:pl-1 transition-all duration-200 block">Wohnzimmer</Link></li>
              <li><Link to="/raum/schlafzimmer" className="hover:text-white hover:pl-1 transition-all duration-200 block">Schlafzimmer</Link></li>
              <li><Link to="/raum/kueche-esszimmer" className="hover:text-white hover:pl-1 transition-all duration-200 block">Küche & Esszimmer</Link></li>
              <li><Link to="/raum/home-office" className="hover:text-white hover:pl-1 transition-all duration-200 block">Büromöbel</Link></li>
              <li><Link to="/sale" className="hover:text-white hover:pl-1 transition-all duration-200 block text-[#d9534f] font-medium">Sale & Angebote</Link></li>
            </ul>
          </div>

          {/* Column 3: Service & Legal */}
          <div>
            <h4 className="text-sm font-bold mb-6 uppercase tracking-widest text-white">Service & Info</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/lieferung-versand" className="hover:text-white hover:pl-1 transition-all duration-200 block font-medium">Versand & Lieferung</Link></li>
              <li><Link to="/ruecksendung-umtausch" className="hover:text-white hover:pl-1 transition-all duration-200 block font-medium">Rücksendung & Umtausch</Link></li>
              <li><Link to="/zahlungsarten" className="hover:text-white hover:pl-1 transition-all duration-200 block">Zahlungsarten</Link></li>
              <li><Link to="/faq" className="hover:text-white hover:pl-1 transition-all duration-200 block">Häufige Fragen (FAQ)</Link></li>
              <li className="pt-2 border-t border-white/5"><Link to="/datenschutzerklaerung" className="hover:text-white hover:pl-1 transition-all duration-200 block">Datenschutz</Link></li>
              <li><Link to="/agb" className="hover:text-white hover:pl-1 transition-all duration-200 block">AGB</Link></li>
              <li><Link to="/impressum" className="hover:text-white hover:pl-1 transition-all duration-200 block">Impressum</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-sm font-bold mb-6 uppercase tracking-widest text-white">Kontakt</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-[#8daaa2] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">mamoruCH Herrscher</p>
                  <p>Rathausplatz 3<br />8853 Lachen, Schweiz</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#8daaa2] shrink-0" />
                <a href="mailto:aureliusherrscher@gmail.com" className="text-gray-400 hover:text-white transition-colors font-medium">aureliusherrscher@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#8daaa2] shrink-0" />
                <a href="tel:+41762004678" className="text-gray-400 hover:text-white transition-colors font-medium">+41 76 200 46 78</a>
              </li>
              <li className="pt-2">
                <p className="text-xs text-gray-500">Mo-Fr: 9:00 - 18:00 Uhr<br />Sa: 10:00 - 16:00 Uhr</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 bg-black/10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} MAMORU GmbH. Alle Rechte vorbehalten.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 mr-2">Sichere Zahlung:</span>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-12 bg-white rounded flex items-center justify-center overflow-hidden">
                  <img src="/visa.svg" alt="Visa" className="h-9 w-auto object-contain" />
                </div>
                <div className="h-8 w-12 bg-white rounded flex items-center justify-center overflow-hidden">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 w-auto" />
                </div>
                {isCH && (
                  <div className="h-8 w-12 bg-white rounded flex items-center justify-center overflow-hidden">
                    <img src="/twint-logo.png" alt="Twint" className="h-6 w-auto object-contain" />
                  </div>
                )}
                <div className="h-8 w-12 bg-white rounded flex items-center justify-center overflow-hidden">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 w-auto" />
                </div>
                <div className="h-8 w-12 bg-white rounded flex items-center justify-center overflow-hidden">
                  <img src="https://x.klarnacdn.net/payment-method/assets/badges/generic/klarna.svg" alt="Klarna" className="h-8 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};