import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ParallaxImageWrapperProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number; // 0.3 to 1.0, lower = more parallax
  blur?: boolean;
  overlayGradient?: string;
  rounded?: boolean;
}

/**
 * ParallaxImageWrapper - Image container with parallax scroll effect
 * 
 * Features:
 * - Smooth parallax scrolling (image moves slower than page)
 * - Customizable speed (0.3 = slow, 1.0 = no parallax)
 * - Optional blur effect
 * - Optional gradient overlay
 * - Intersection observer for performance (only animates when visible)
 * - Rounded corners option
 */
export const ParallaxImageWrapper: React.FC<ParallaxImageWrapperProps> = ({
  src,
  alt,
  className,
  speed = 0.7,
  blur = false,
  overlayGradient,
  rounded = true,
}) => {
  const [offset, setOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrolled = window.scrollY + window.innerHeight - rect.top;
        const parallaxOffset = scrolled * (1 - speed);
        setOffset(parallaxOffset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        rounded && 'rounded-2xl',
        className
      )}
    >
      {/* Parallax Image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-transform duration-100 ease-out',
          blur && 'filter blur-sm'
        )}
        style={{
          transform: `translateY(${-offset * 0.3}px) scale(1.15)`, // Scale up to prevent gaps
        }}
      />

      {/* Optional Gradient Overlay */}
      {overlayGradient && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: overlayGradient,
          }}
        />
      )}
    </div>
  );
};

export default ParallaxImageWrapper;
