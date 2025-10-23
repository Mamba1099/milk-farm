import React, { useState } from "react";
import Image from "next/image";
import { getPublicImageUrl } from "@/supabase/storage/client";

interface RobustImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackClassName?: string;
  fallbackText?: string;
  sizes?: string;
  unoptimized?: boolean;
}

export function RobustImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  fallbackClassName = "",
  fallbackText,
  sizes,
  unoptimized = false
}: RobustImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const normalizedSrc = React.useMemo(() => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    if (src.startsWith('/')) {
      return src;
    }
    try {
      return getPublicImageUrl(src);
    } catch (error) {
      console.warn(`Failed to generate public URL for path: ${src}`, error);
      return `/${src}`;
    }
  }, [src]);
  
  const showFallback = !normalizedSrc || imageError || !imageLoaded;
  const firstLetter = fallbackText?.[0]?.toUpperCase() || "?";

  return (
    <div className="relative">
      {normalizedSrc && !imageError && (
        <Image
          src={normalizedSrc}
          alt={alt}
          {...(fill ? { fill: true } : { width: width!, height: height! })}
          className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onError={() => {
            console.warn(`Failed to load image: ${normalizedSrc}`);
            setImageError(true);
          }}
          onLoad={() => setImageLoaded(true)}
          unoptimized={unoptimized}
          sizes={sizes}
        />
      )}
      
      {/* Fallback div - shown when image fails or is loading */}
      <div 
        className={`${fallbackClassName} ${showFallback ? '' : 'hidden'} bg-gray-200 flex items-center justify-center text-gray-400 font-bold rounded-full`}
        style={fill ? { position: 'absolute', inset: 0 } : { width, height }}
      >
        {firstLetter}
      </div>
    </div>
  );
}