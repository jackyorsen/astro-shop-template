import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryStructure, MAIN_GROUPS, getSlug } from '../utils/categoryHelper';
import { ChevronRight } from 'lucide-react';

interface MegaMenuProps {
  structure: CategoryStructure;
  isVisible: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ structure, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div
      className="absolute top-full left-0 w-full bg-white shadow-[0_15px_40px_-5px_rgba(0,0,0,0.08)] border-t-2 border-[#2b4736] z-50 animate-in fade-in slide-in-from-top-1 duration-200"
      onMouseLeave={onClose}
    >
      <div className="max-w-[1320px] mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-8">
          {MAIN_GROUPS.map((group) => {
            const subCategories = structure[group];
            if (!subCategories || subCategories.length === 0) return null;

            return (
              <div key={group} className="space-y-4">
                <h3 className="font-bold text-[#2b4736] text-[15px] uppercase tracking-wider border-b border-gray-100 pb-2">
                  {group}
                </h3>
                <ul className="space-y-2">
                  {subCategories.map((cat) => (
                    <li key={cat}>
                      <Link
                        to={`/kategorie/${getSlug(cat)}`}
                        onClick={onClose}
                        className="text-sm text-gray-500 hover:text-[#2b4736] hover:pl-1 transition-all flex items-center group"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#2b4736]" />
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Promotional Area in Mega Menu */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 p-4 rounded-lg">
          <div className="flex gap-4 text-sm font-medium text-gray-500">
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#2b4736] rounded-full"></div> Kostenloser Versand</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#2b4736] rounded-full"></div> 30 Tage Rückgaberecht</span>
          </div>
          <Link to="/shop" onClick={onClose} className="text-xs font-bold uppercase tracking-wider text-[#2b4736] hover:underline">
            Alle Produkte ansehen
          </Link>
        </div>
      </div>
    </div>
  );
};
