import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HeroWithBlurOverlayProps {
  backgroundImage: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  height?: 'full' | 'screen' | 'large' | 'medium';
  overlayType?: 'dark' | 'gradient' | 'tinted';
  accentColor?: string;
  blurIntensity?: number;
  showParticles?: boolean;
  particleColor?: string;
}

/**
 * HeroWithBlurOverlay - Enhanced hero section with blur effects and overlays
 * 
 * Features:
 * - Multiple overlay types (dark, gradient, tinted)
 * - Customizable blur intensity on background
 * - Mouse-reactive gradient overlay
 * - Optional particle field
 * - Responsive height options
 * - Smooth animations
 */
export const HeroWithBlurOverlay: React.FC<HeroWithBlurOverlayProps> = ({
  backgroundImage,
  title,
  subtitle,
  children,
  className,
  height = 'screen',
  overlayType = 'tinted',
  accentColor = '#FFAC13',
  blurIntensity = 0,
  showParticles = false,
  particleColor = '#FFAC13',
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const heightClasses = {
    full: 'min-h-screen',
    screen: 'h-screen',
    large: 'min-h-[80vh]',
    medium: 'min-h-[60vh]',
  };

  const overlayGradients = {
    dark: 'linear-gradient(to bottom, rgba(13,13,13,0.7) 0%, rgba(13,13,13,0.5) 40%, rgba(13,13,13,0.7) 70%, rgba(13,13,13,0.95) 100%)',
    gradient: 'linear-gradient(to bottom, rgba(13,13,13,0.9) 0%, rgba(13,13,13,0.4) 50%, rgba(13,13,13,0.9) 100%)',
    tinted: `linear-gradient(to bottom, rgba(13,13,13,0.8) 0%, ${accentColor}10 30%, rgba(13,13,13,0.7) 70%, rgba(13,13,13,0.95) 100%)`,
  };

  return (
    <section className={cn('relative overflow-hidden', heightClasses[height], className)}>
      {/* Background Image with optional blur */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Hero background"
          className="w-full h-full object-cover scale-110"
          style={{
            filter: blurIntensity > 0 ? `blur(${blurIntensity}px)` : undefined,
            transform: `translate(${(mousePosition.x - 0.5) * -30}px, ${(mousePosition.y - 0.5) * -30}px) scale(1.15)`,
            transition: 'transform 0.5s ease-out',
          }}
        />
      </div>

      {/* Overlay Gradient */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: overlayGradients[overlayType],
        }}
      />

      {/* Mouse-following glow */}
      <div
        className="absolute inset-0 z-20 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle 600px at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, ${accentColor}15 0%, transparent 60%)`,
        }}
      />

      {/* Optional Particles */}
      {showParticles && (
        <div className="absolute inset-0 z-25 pointer-events-none">
          {/* Simplified particle representation - in real implementation use ParticleField */}
          <div
            className="absolute w-2 h-2 rounded-full animate-float"
            style={{
              background: particleColor,
              top: '20%',
              left: '30%',
              opacity: 0.4,
            }}
          />
          <div
            className="absolute w-2 h-2 rounded-full animate-float animation-delay-300"
            style={{
              background: particleColor,
              top: '60%',
              left: '70%',
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-30 h-full flex items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Title */}
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
            style={{
              animation: 'fade-in 0.8s ease-out forwards',
              opacity: 0,
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
              style={{
                animation: 'fade-in 0.8s ease-out 0.3s forwards',
                opacity: 0,
              }}
            >
              {subtitle}
            </p>
          )}

          {/* CTAs or custom children */}
          <div
            style={{
              animation: 'fade-in 0.8s ease-out 0.6s forwards',
              opacity: 0,
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-20"
        style={{
          background: 'linear-gradient(to top, #0D0D0D, transparent)',
        }}
      />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default HeroWithBlurOverlay;
