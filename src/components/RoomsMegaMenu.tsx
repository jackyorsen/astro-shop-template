import React from 'react';
import { Link } from 'react-router-dom';

import { generateSrcSet } from './OptimizedImage';

interface RoomCategory {
    name: string;
    slug: string;
    image: string;
}

interface RoomsMegaMenuProps {
    isVisible: boolean;
    onClose: () => void;
}

const ROOM_CATEGORIES: RoomCategory[] = [
    {
        name: 'Wohnzimmer',
        slug: 'wohnzimmer',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
    },
    {
        name: 'Kinderzimmer',
        slug: 'kinderzimmer',
        image: '/kinderzimmer.jpg'
    },
    {
        name: 'Schlafzimmer',
        slug: 'schlafzimmer',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop'
    },
    {
        name: 'Waschküche',
        slug: 'waschkueche',
        image: '/waschkueche.jpg'
    },
    {
        name: 'Badezimmer',
        slug: 'badezimmer',
        image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop'
    },
    {
        name: 'Garage',
        slug: 'garage',
        image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=400&h=300&fit=crop'
    },
    {
        name: 'Küche & Esszimmer',
        slug: 'kueche-esszimmer',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=300&fit=crop'
    },
    {
        name: 'Eingangsbereich',
        slug: 'eingangsbereich',
        image: '/eingangsbereich.jpg'
    },
    {
        name: 'Home Office',
        slug: 'home-office',
        image: '/homeoffice.jpg'
    },
    {
        name: 'Outdoor & Garten',
        slug: 'outdoor-garten',
        image: '/outdoor-garten.jpg'
    }
];

export const RoomsMegaMenu: React.FC<RoomsMegaMenuProps> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div
            className="absolute top-full left-0 w-full bg-white shadow-[0_15px_40px_-5px_rgba(0,0,0,0.08)] border-t-2 border-[#2b4736] animate-in fade-in slide-in-from-top-1 duration-200 z-50"
            onMouseLeave={onClose}
        >
            <div className="max-w-[1400px] mx-auto px-8 py-10">
                {/* Grid Layout - 5 columns like Songmics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8">
                    {ROOM_CATEGORIES.map((room) => (
                        <Link
                            key={room.slug}
                            to={`/raum/${room.slug}`}
                            className="group block text-center"
                            onClick={onClose}
                        >
                            <div className="relative overflow-hidden rounded-md mb-3 aspect-[4/3] w-full bg-gray-100">
                                <img
                                    src={room.image}
                                    srcSet={generateSrcSet(room.image)}
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                    alt={room.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                            </div>
                            <p className="text-[14px] font-semibold text-gray-700 group-hover:text-[#2b4736] transition-colors">
                                {room.name}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
