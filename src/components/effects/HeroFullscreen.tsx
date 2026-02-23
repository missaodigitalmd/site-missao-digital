import React, { useRef, useEffect, useState } from 'react';
import { ParticleField } from './ParticleField';
import { ScrollIndicator } from './ScrollIndicator';
import { AnimatedText } from './AnimatedText';
import { usePrefersReducedMotion } from '@/hooks';

interface HeroFullscreenProps {
  backgroundImage: string;
  title: string;
  highlightWords?: string[];
  highlightClassName?: string;
  subtitle: string;
  cta?: React.ReactNode;
  accentColor?: string;
  particleColor?: string;
  particleDirection?: 'up' | 'down' | 'random';
  overlayTint?: string;
  specialEffect?: 'scanlines' | 'spotlight' | 'none';
  backgroundVideo?: string; // New prop for video background
  onScrollDown?: () => void;
}

export const HeroFullscreen: React.FC<HeroFullscreenProps> = ({
  backgroundImage,
  backgroundVideo,
  title,
  highlightWords = [],
  highlightClassName = 'text-gradient-brand',
  subtitle,
  cta,
  accentColor = '#FFAC13',
  particleColor = '#FFAC13',
  particleDirection = 'random',
  overlayTint,
  specialEffect = 'none',
  onScrollDown,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };

    // Listen for any interaction to trigger video load
    ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'].forEach(event =>
      window.addEventListener(event, handleInteraction, { once: true })
    );

    return () => {
      ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'].forEach(event =>
        window.removeEventListener(event, handleInteraction)
      );
    };
  }, [hasInteracted]);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
        setScrollY(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax transforms
  const bgTransform = prefersReducedMotion ? {} : {
    transform: `translateY(${scrollY * 30}%) scale(${1 + scrollY * 0.1})`,
  };

  const contentTransform = prefersReducedMotion ? {} : {
    transform: `translateY(${scrollY * -10}%)`,
    opacity: 1 - scrollY * 0.5,
  };

  // Default overlay with optional tint
  const defaultOverlay = overlayTint || `linear-gradient(
    to bottom,
    rgba(13, 13, 13, 0.7) 0%,
    rgba(13, 13, 13, 0.4) 40%,
    rgba(13, 13, 13, 0.6) 70%,
    rgba(13, 13, 13, 0.95) 100%
  )`;

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen min-h-[100dvh] w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 z-0 will-change-transform"
        style={{
          ...bgTransform,
        }}
      >
        {/* Static Image (always renders initially) */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            opacity: videoLoaded ? 0 : 1
          }}
        />

        {/* Video (renders after interaction) */}
        {backgroundVideo && hasInteracted && (
          <video
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            src={backgroundVideo}
            autoPlay
            loop
            muted
            playsInline
            onCanPlay={() => setVideoLoaded(true)}
            style={{ opacity: videoLoaded ? 1 : 0 }}
          />
        )}
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: defaultOverlay }}
      />

      {/* Special Effects */}
      {specialEffect === 'scanlines' && (
        <div
          className="absolute inset-0 z-15 pointer-events-none opacity-10"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(179, 136, 255, 0.1) 2px, rgba(179, 136, 255, 0.1) 4px)',
            animation: 'scanlineMove 8s linear infinite',
          }}
        />
      )}

      {specialEffect === 'spotlight' && (
        <div
          className="absolute inset-0 z-15 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${accentColor}20 0%, transparent 50%)`,
            animation: 'spotlightMove 12s ease-in-out infinite alternate',
          }}
        />
      )}

      {/* Particles */}
      <ParticleField
        count={35}
        color={particleColor}
        repulsion={true}
        direction={particleDirection}
        className="z-20"
      />

      {/* Content */}
      <div
        className="relative z-30 container-custom text-center pt-20 will-change-transform"
        style={contentTransform}
      >
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <AnimatedText
            text={title}
            as="h1"
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
            highlightWords={highlightWords}
            highlightClassName={highlightClassName}
            delay={0.2}
            staggerDelay={0.08}
          />

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-white/80 font-body mb-10 max-w-2xl mx-auto"
            style={{
              opacity: 0,
              animation: 'fade-in 0.6s ease-out 1s forwards',
            }}
          >
            {subtitle}
          </p>

          {/* CTA */}
          {cta && (
            <div
              style={{
                opacity: 0,
                animation: 'fade-in 0.6s ease-out 1.4s forwards',
              }}
            >
              {cta}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator onClick={onScrollDown} />

      {/* Accent Glow on edges */}
      <div
        className="absolute top-0 left-0 right-0 h-32 z-5 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${accentColor}15, transparent)`,
        }}
      />
    </section>
  );
};

export default HeroFullscreen;
