import React from 'react';
import { cn } from '@/lib/utils';

interface ImageBackgroundSectionProps {
  children: React.ReactNode;
  imageSrc: string;
  imageAlt?: string;
  overlayOpacity?: number;
  gradientTint?: string;
  className?: string;
  imagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  parallax?: boolean;
  blurAmount?: number;
}

/**
 * ImageBackgroundSection - Section with image background + dark overlay
 * 
 * Replaces solid gray backgrounds (bg-surface-secondary) with rich visual layers:
 * - Layer 1: Background image
 * - Layer 2: Dark overlay for text readability (customizable opacity)
 * - Layer 3: Optional gradient tint (matches section theme)
 * - Layer 4: Content
 * 
 * Features:
 * - Customizable overlay opacity (default 85%)
 * - Optional gradient tint overlay
 * - Optional parallax effect
 * - Optional blur on background image
 * - Responsive image positioning
 */
export const ImageBackgroundSection: React.FC<ImageBackgroundSectionProps> = ({
  children,
  imageSrc,
  imageAlt = 'Background',
  overlayOpacity = 0.85,
  gradientTint,
  className,
  imagePosition = 'center',
  parallax = false,
  blurAmount = 0,
}) => {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax]);

  const imagePositionClasses = {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
    left: 'object-left',
    right: 'object-right',
  };

  return (
    <section className={cn('relative overflow-hidden', className)}>
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageSrc}
          alt={imageAlt}
          className={cn(
            'w-full h-full object-cover',
            imagePositionClasses[imagePosition]
          )}
          style={{
            transform: parallax ? `translateY(${scrollY * 0.3}px)` : undefined,
            filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
            transition: parallax ? 'none' : undefined,
          }}
        />
      </div>

      {/* Dark Overlay Layer */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `rgba(13, 13, 13, ${overlayOpacity})`,
        }}
      />

      {/* Optional Gradient Tint Layer */}
      {gradientTint && (
        <div
          className="absolute inset-0 z-20"
          style={{
            background: gradientTint,
          }}
        />
      )}

      {/* Content Layer */}
      <div className="relative z-30">
        {children}
      </div>
    </section>
  );
};

export default ImageBackgroundSection;
