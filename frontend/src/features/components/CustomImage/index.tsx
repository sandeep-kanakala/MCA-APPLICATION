// Author: Sasi Dhar
import React, { useState, useMemo } from 'react';

interface ReactImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  rounded?: boolean;
  shadow?: boolean;
  className?: string;
  loadingSkeleton?: boolean;
  responsive?: boolean; // enable responsive optimization
}

/**
 * Advanced, optimized reusable Image component
 * - Auto alt text from filename
 * - Inline SVG fallback (no prop needed)
 * - Responsive srcSet + sizes
 * - Lazy loading + skeleton + fade-in
 */
const ReactImage: React.FC<ReactImageProps> = ({
  src,
  alt,
  width = 'auto',
  height = 'auto',
  rounded = false,
  shadow = false,
  className = '',
  loadingSkeleton = true,
  responsive = true,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Auto-generate alt text from file name
  const generatedAlt = useMemo(() => {
    if (alt) return alt;
    if (!src) return 'Image';
    const fileName = src.split('/').pop() || 'Image';
    const nameWithoutExt = fileName.split('.')[0];
    return nameWithoutExt.replace(/[-_]/g, ' ').trim();
  }, [src, alt]);

  const handleLoad = () => setLoaded(true);
  const handleError = () => setError(true);

  // Responsive srcSet builder for common screen widths
  const responsiveSources = useMemo(() => {
    if (!responsive || !src) return {};
    const extIndex = src.lastIndexOf('.');
    if (extIndex === -1) return {};
    const base = src.slice(0, extIndex);
    const ext = src.slice(extIndex);
    return {
      srcSet: `${base}-480w${ext} 480w, ${base}-768w${ext} 768w, ${base}-1024w${ext} 1024w, ${base}-1280w${ext} 1280w`,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    };
  }, [src, responsive]);

  const baseClasses = `
    object-cover w-full h-full transition-opacity duration-500
    ${loaded ? 'opacity-100' : 'opacity-0'}
  `;

  // Inline fallback SVG
  const FallbackSVG = (
    <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 
          1 0 01-1 1H4a1 1 0 01-1-1V4z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
        <circle cx="8.5" cy="8.5" r="1.5" />
      </svg>
    </div>
  );

  return (
    <div
      className={`relative overflow-hidden ${
        rounded ? 'rounded-xl' : ''
      } ${shadow ? 'shadow-md' : ''} ${className}`}
      style={{ width, height }}
    >
      {loadingSkeleton && !loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {!error ? (
        <img
          src={src}
          alt={generatedAlt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={baseClasses}
          {...responsiveSources}
          {...rest}
        />
      ) : (
        FallbackSVG
      )}
    </div>
  );
};

export default ReactImage;
