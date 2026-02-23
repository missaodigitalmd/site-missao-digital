import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useScrollReveal, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils';

interface MasonryGalleryProps {
  images: {
    src: string;
    alt: string;
    span?: 'normal' | 'wide' | 'tall' | 'wide-tall';
  }[];
  className?: string;
}

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({ images, className }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();
  const prefersReducedMotion = usePrefersReducedMotion();

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    
    if (direction === 'prev') {
      setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    } else {
      setLightboxIndex(lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  const getSpanClasses = (span?: string) => {
    switch (span) {
      case 'wide':
        return 'md:col-span-2';
      case 'tall':
        return 'md:row-span-2';
      case 'wide-tall':
        return 'md:col-span-2 md:row-span-2';
      default:
        return '';
    }
  };

  return (
    <>
      <div
        ref={ref}
        className={cn(
          'grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[200px]',
          className
        )}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              'relative overflow-hidden rounded-2xl cursor-pointer group',
              getSpanClasses(image.span),
              !prefersReducedMotion && 'scroll-reveal',
              isVisible && 'visible'
            )}
            style={
              !prefersReducedMotion
                ? {
                    animationDelay: `${index * 0.1}s`,
                  }
                : undefined
            }
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className={cn(
                'w-full h-full object-cover transition-all duration-500',
                !prefersReducedMotion && 'group-hover:scale-110'
              )}
            />
            {/* Orange glow on hover */}
            <div
              className={cn(
                'absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300',
                'opacity-0 group-hover:opacity-100'
              )}
              style={{
                boxShadow: '0 0 30px rgba(255, 172, 19, 0.4), inset 0 0 20px rgba(255, 172, 19, 0.1)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('prev');
            }}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-2xl">←</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('next');
            }}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-2xl">→</span>
          </button>

          {/* Image */}
          <img
            src={images[lightboxIndex].src}
            alt={images[lightboxIndex].alt}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default MasonryGallery;
