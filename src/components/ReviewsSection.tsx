import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Star, Check, User, X, ChevronLeft, ChevronRight, Image as ImageIcon, Grid, Loader2 } from 'lucide-react';
import { Review } from '../types';
import { OptimizedImage } from './OptimizedImage';
import { Button } from './Button';
import { StarRating } from './StarRating';
import { getSite } from '../utils/currency';

interface ReviewsSectionProps {
    reviews: Review[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return null;
    }

    // --- STATE ---
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showAllPhotos, setShowAllPhotos] = useState(false); // New State for "All Photos" Grid
    const [visibleCount, setVisibleCount] = useState(10); // Pagination state
    const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading animation state

    const galleryScrollRef = useRef<HTMLDivElement>(null);

    // --- DERIVED DATA ---
    const stats = useMemo(() => {
        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const average = total > 0 ? (sum / total).toFixed(1) : "0.0";

        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
        reviews.forEach(r => {
            const rating = Math.round(r.rating);
            if (counts[rating] !== undefined) counts[rating]++;
        });

        return { total, average, counts };
    }, [reviews]);

    // Collect all images with their parent review for the gallery
    const galleryImages = useMemo(() => {
        const images: { url: string; review: Review }[] = [];
        reviews.forEach(review => {
            if (review.images && review.images.length > 0) {
                review.images.forEach(img => {
                    images.push({ url: img, review });
                });
            }
        });
        return images;
    }, [reviews]);

    // --- HANDLERS ---
    const openLightbox = (index: number) => {
        setActiveImageIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveImageIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveImageIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    const scrollGallery = (direction: 'left' | 'right') => {
        if (galleryScrollRef.current) {
            const scrollAmount = 300;
            galleryScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, galleryImages.length]);

    // Body lock
    useEffect(() => {
        if (lightboxOpen || showAllPhotos) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [lightboxOpen, showAllPhotos]);


    return (
        <div className="mt-8 mb-16 max-w-[1000px] mx-auto">

            {/* HEADER: Statistics & Action */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start justify-between mb-8 border-b border-gray-100 pb-12">
                {/* Left: Average & Stars */}
                <div className="flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Kundenbewertungen</h2>
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-5xl font-extrabold text-[#333] tracking-tight">{stats.average}</span>
                        <div>
                            <StarRating rating={parseFloat(stats.average)} sizeClass="w-5 h-5" className="mb-1" />
                            <p className="text-sm text-gray-500 font-medium">{stats.total} Bewertungen</p>
                        </div>
                    </div>
                </div>

                {/* Middle: Distribution Bars */}
                <div className="flex-1 w-full max-w-sm space-y-2 pt-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = stats.counts[star];
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1 w-8 text-gray-600 font-medium">
                                    <span>{star}</span> <Star className="w-3 h-3 text-gray-400 fill-gray-400" />
                                </div>
                                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#E87E24] rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="w-6 text-right text-gray-400 text-xs">
                                    {count}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right: Button */}
                <div className="pt-2">
                    <Button variant="primary" className="bg-[#2b4736] hover:bg-[#1f3a34] px-8">
                        Eine Rezension schreiben
                    </Button>
                </div>
            </div>

            {/* --- IMAGE GALLERY SLIDER (THUMBNAILS) --- */}
            {galleryImages.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Rezensionen mit Bildern
                        </h3>
                        <button
                            onClick={() => setShowAllPhotos(true)}
                            className="text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium"
                        >
                            Alle Fotos anzeigen
                        </button>
                    </div>

                    <div className="relative group">
                        {/* Left Arrow */}
                        <button
                            onClick={() => scrollGallery('left')}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-50 transition-all opacity-100"
                            aria-label="Previous images"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div
                            ref={galleryScrollRef}
                            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth px-1"
                        >
                            {galleryImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => openLightbox(idx)}
                                    className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-gray-400 transition-all snap-start bg-gray-50"
                                >
                                    <OptimizedImage
                                        src={img.url}
                                        alt="User review image"
                                        className="w-full h-full absolute inset-0"
                                        imgClassName="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={() => scrollGallery('right')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-50 transition-all opacity-100"
                            aria-label="Next images"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* REVIEW LIST */}
            <div className="space-y-6">
                {reviews.slice(0, visibleCount).map((review, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100"
                    >
                        {/* Header: Rating & Title */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-4">
                                {/* Stars */}
                                <StarRating rating={review.rating} sizeClass="w-4 h-4" />
                                {/* Title */}
                                <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                    {review.title}
                                </h3>
                            </div>

                            {/* Verified Badge (Desktop) */}
                            {review.verified && (
                                <div className="hidden sm:flex items-center text-[#2b4736] bg-green-50 px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                                    <Check className="w-3.5 h-3.5 mr-1.5" />
                                    Verifizierter Kauf
                                </div>
                            )}
                        </div>

                        {/* Review Text */}
                        <div className="text-gray-600 leading-relaxed mb-6 font-light">
                            <p>{review.text}</p>
                        </div>

                        {/* Images Grid (Inline in Review) */}
                        {review.images && review.images.length > 0 && (
                            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
                                {review.images.map((img, imgIndex) => (
                                    <div
                                        key={imgIndex}
                                        onClick={() => {
                                            const globalIdx = galleryImages.findIndex(gi => gi.url === img);
                                            if (globalIdx !== -1) openLightbox(globalIdx);
                                        }}
                                        className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in border border-gray-100"
                                    >
                                        <OptimizedImage
                                            src={img}
                                            alt={`Review image ${imgIndex + 1}`}
                                            className="w-full h-full absolute inset-0"
                                            imgClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Footer: Author & Verified Badge (Mobile) */}
                        <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs uppercase">
                                    {review.author.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900">
                                        {review.author}
                                    </span>
                                    {review.date && (
                                        <span className="text-xs text-gray-400">
                                            {new Date(review.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {review.verified && (
                                <div className="sm:hidden flex items-center text-[#2b4736] text-xs font-medium">
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Verifiziert
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* LOAD MORE BUTTON */}
            {visibleCount < reviews.length && (
                <div className="mt-8 flex justify-center">
                    <Button
                        variant="secondary"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full font-medium min-w-[200px] flex items-center justify-center gap-2 transition-all duration-300"
                        onClick={() => {
                            setIsLoadingMore(true);
                            setTimeout(() => {
                                setVisibleCount(prev => prev + 10);
                                setIsLoadingMore(false);
                            }, 600); // Trendy artificial delay
                        }}
                        disabled={isLoadingMore}
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                                <span>Lade Bewertungen...</span>
                            </>
                        ) : (
                            "Mehr Bewertungen laden"
                        )}
                    </Button>
                </div>
            )}

            {/* --- ALL PHOTOS MODAL (GRID VIEW) --- */}
            {showAllPhotos && createPortal(
                <div className="fixed inset-0 z-[9990] bg-white animate-in slide-in-from-bottom-5 duration-300 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shadow-sm bg-white z-10">
                        <h2 className="text-xl font-bold text-gray-900">Alle Fotos</h2>
                        <button
                            onClick={() => setShowAllPhotos(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Grid Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
                        <div className="max-w-[1200px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {galleryImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => openLightbox(idx)}
                                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border border-gray-200"
                                >
                                    <OptimizedImage
                                        src={img.url}
                                        alt={`Gallery image ${idx}`}
                                        className="w-full h-full absolute inset-0"
                                        imgClassName="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* --- LIGHTBOX MODAL (SINGLE VIEW) --- */}
            {lightboxOpen && galleryImages[activeImageIndex] && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200" onClick={closeLightbox}>

                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2 transiton-colors">
                        <X className="w-8 h-8" />
                    </button>

                    <div
                        className="bg-white w-full max-w-[1200px] h-full max-h-[90vh] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()} // Prevent close on content click
                    >
                        {/* LEFT: IMAGE AREA (70%) */}
                        <div className="relative flex-1 bg-black flex items-center justify-center p-4 group">
                            <OptimizedImage
                                src={galleryImages[activeImageIndex].url}
                                alt="Review full size"
                                className="w-full h-full absolute inset-0 flex items-center justify-center p-4"
                                imgClassName="max-w-full max-h-full object-contain select-none"
                            />

                            {/* Navigation Arrows */}
                            {/* Navigation Arrows */}
                            <button
                                type="button"
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white z-50 opacity-100"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                type="button"
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white z-50 opacity-100"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </div>

                        {/* RIGHT: REVIEW INFO (30%) */}
                        <div className="w-full md:w-[350px] lg:w-[400px] bg-white flex flex-col border-l border-gray-200 h-[40vh] md:h-auto">
                            <div className="p-6 flex-1 overflow-y-auto">

                                {/* Author Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold uppercase shrink-0">
                                        {galleryImages[activeImageIndex].review.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 line-clamp-1">{galleryImages[activeImageIndex].review.author}</div>
                                        {galleryImages[activeImageIndex].review.verified && (
                                            <div className="text-[#c45500] text-xs font-bold flex items-center gap-1">
                                                Verifizierter Kauf
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stars */}
                                <StarRating rating={galleryImages[activeImageIndex].review.rating} sizeClass="w-5 h-5" className="mb-2" />

                                {/* Title */}
                                <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">
                                    {galleryImages[activeImageIndex].review.title}
                                </h3>

                                {/* Date */}
                                {galleryImages[activeImageIndex].review.date && (
                                    <div className="text-gray-500 text-sm mb-4">
                                        {getSite() === 'CH' ? 'Rezension aus der Schweiz' : 'Rezension aus Deutschland'} vom {new Date(galleryImages[activeImageIndex].review.date!).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                )}

                                {/* Text */}
                                <div className="text-gray-700 leading-relaxed text-sm">
                                    {galleryImages[activeImageIndex].review.text}
                                </div>
                            </div>

                            {/* Simplified Footer / Actions could go here */}
                            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 text-xs text-gray-500 mt-auto shrink-0">
                                <span>Bild {activeImageIndex + 1} von {galleryImages.length}</span>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};
