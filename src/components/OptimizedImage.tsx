
import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  variant?: 'small' | 'full';
  className?: string;
  imgClassName?: string;
  sizes?: string;
}

export const generateSrcSet = (src: string): string | undefined => {
  // Only optimize Unsplash URLs which allow dynamic resizing
  if (!src.includes('unsplash.com')) {
    return undefined;
  }

  try {
    const url = new URL(src);
    // Define widths to generate
    const widths = [400, 600, 800, 1000, 1200, 1600, 2000];

    return widths.map(w => {
      // Clone parameters
      const params = new URLSearchParams(url.search);
      // Update width (this is the ONLY change we make to the "data" requested, 
      // effectively requesting a resized version of the SAME image asset)
      params.set('w', w.toString());

      // Construct new URL with updated width
      return `${url.protocol}//${url.host}${url.pathname}?${params.toString()} ${w}w`;
    }).join(', ');
  } catch (e) {
    return undefined;
  }
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  variant = 'small',
  className = '',
  imgClassName = '',
  alt,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);
  const mountedRef = useRef(true);

  // Spinner timeout effect - max 500ms spinner
  useEffect(() => {
    setShowSpinner(true);
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setShowSpinner(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [src]);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoaded(false);

    // DIRECT LOAD - NO OPTIMIZER
    // We use the src directly to ensure 100% sharpness (no canvas resizing or LQIP)
    setCurrentSrc(src);

    return () => {
      mountedRef.current = false;
    };
  }, [src]);

  const handleLoad = () => {
    if (mountedRef.current) {
      setIsLoaded(true);
    }
  };

  return (
    <div className={`optimized-img-wrapper relative overflow-hidden bg-[#f0f0f0] ${className}`}>

      {/* Loading State Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#f0f0f0]">
          {showSpinner ? (
            <div className="w-8 h-8 border-2 border-[#f0f0f0] border-t-[#2b4736] rounded-full animate-spin" />
          ) : (
            /* Static Skeleton */
            <div className="w-full h-full bg-[#f0f0f0]" />
          )}
        </div>
      )}

      {/* Main Image */}
      <img
        src={currentSrc}
        srcSet={props.srcSet || generateSrcSet(currentSrc)}
        sizes={props.sizes}
        alt={alt}
        onLoad={handleLoad}
        className={`optimized-img relative z-10 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        loading={props.loading || "lazy"}
        decoding="async"
        fetchPriority={props.fetchPriority}
        width={props.width}
        height={props.height}
        {...props}
      />
    </div>
  );
};
