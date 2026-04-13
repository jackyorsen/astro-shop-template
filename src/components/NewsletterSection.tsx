
import React from 'react';
import { Link } from 'react-router-dom';

export const NewsletterSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 w-full">
      <div className="max-w-[1100px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-20">

          {/* Left Column: Copy */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#111] leading-tight">
              Exklusive Einblicke <br className="hidden md:block" /> & Angebote
            </h3>
            <p className="text-gray-500 text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Melde dich an und erhalte 5% Rabatt auf deine erste Bestellung sowie Inspirationen für dein Zuhause.
            </p>
          </div>

          {/* Right Column: Form */}
          <div className="lg:w-1/2 w-full max-w-lg">
            <form className="w-full" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col sm:flex-row gap-0 mb-4 group">
                <input
                  type="email"
                  placeholder="Deine E-Mail Adresse"
                  className="flex-1 bg-white border border-gray-200 rounded-l-md sm:rounded-r-none rounded-r-md px-6 py-4 text-base focus:outline-none focus:border-[#2E4D3F] transition-all mb-3 sm:mb-0 shadow-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#2E4D3F] text-white font-bold text-sm px-10 py-4 rounded-l-none rounded-r-md hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap hidden sm:block shadow-md hover:shadow-lg"
                >
                  Jetzt anmelden
                </button>
                <button
                  type="submit"
                  className="bg-[#2E4D3F] text-white font-bold text-sm px-10 py-4 rounded-md hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap sm:hidden w-full shadow-md hover:shadow-lg"
                >
                  Jetzt anmelden
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-8 font-medium text-center sm:text-left">Kein Spam. Jederzeit abbestellbar.</p>

              <div className="flex items-start gap-3 text-left">
                <input
                  type="checkbox"
                  id="newsletter-privacy"
                  required
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#2E4D3F] focus:ring-[#2E4D3F] cursor-pointer flex-shrink-0"
                />
                <label
                  htmlFor="newsletter-privacy"
                  className="text-[11px] text-gray-400 cursor-pointer select-none leading-relaxed"
                >
                  Ich stimme zu, dass meine E-Mail-Adresse verarbeitet wird. Ich kann mich jederzeit wieder abmelden. Es gelten unsere{" "}
                  <Link to="#" className="underline hover:text-[#111]">
                    Datenschutzbestimmungen
                  </Link>
                  .
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
