import React, { useRef, useEffect, useState } from 'react';
import { ParticleField } from './ParticleField';
import { AnimatedText } from './AnimatedText';
import { usePrefersReducedMotion } from '@/hooks';
import { THEME_COLOR } from '@/constants/theme';

interface HeroStandardProps {
  backgroundImage?: string;
  title: string;
  highlightWords?: string[];
  highlightClassName?: string;
  subtitle?: string;
  cta?: React.ReactNode;
  accentColor?: string;
  particleColor?: string;
  particleDirection?: 'up' | 'down' | 'random';
  overlayTint?: string;
  specialEffect?: 'scanlines' | 'spotlight' | 'none';
  variant?: 'default' | 'digital';
  onScrollDown?: () => void;
  imageRight?: string;
  imageAlt?: string;
  rightContent?: React.ReactNode;
}

export const HeroStandard: React.FC<HeroStandardProps> = ({
  backgroundImage,
  title,
  highlightWords = [],
  highlightClassName = 'text-gradient-brand',
  subtitle,
  cta,
  accentColor = THEME_COLOR,
  particleColor = THEME_COLOR,
  particleDirection = 'random',
  overlayTint,
  specialEffect = 'none',
  variant = 'default',
  onScrollDown,
  imageRight,
  imageAlt,
  rightContent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const prefersReducedMotion = usePrefersReducedMotion();

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

  // Mouse move effect for digital variant
  useEffect(() => {
    if (variant !== 'digital') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [variant]);

  const bgTransform = prefersReducedMotion ? {} : {
    transform: `translateY(${scrollY * 20}%) scale(${1 + scrollY * 0.05})`,
  };

  const contentTransform = prefersReducedMotion ? {} : {
    transform: `translateY(${scrollY * -5}%)`,
    opacity: 1 - scrollY * 0.3,
  };

  const defaultOverlay = overlayTint || `linear-gradient(
    to bottom,
    rgba(13, 13, 13, 0.8) 0%,
    rgba(13, 13, 13, 0.5) 50%,
    rgba(13, 13, 13, 0.85) 100%
  )`;

  return (
    <section
      ref={containerRef}
      className={`relative min-h-[70vh] w-full flex items-center justify-center overflow-hidden ${variant === 'digital' ? 'bg-[#0a0a0a]' : ''}`}
      style={{
        position: 'relative',
        zIndex: 0
      }}
    >
      {/* Background Image with Parallax */}
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 will-change-transform"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            ...bgTransform,
          }}
        />
      )}

      {/* Animated Gradient Background (Default) */}
      {!backgroundImage && variant === 'default' && (
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${accentColor}15 0%, transparent 50%),
                         radial-gradient(ellipse at 70% 80%, ${accentColor}08 0%, transparent 50%),
                         #0a0a0a`,
          }}
        />
      )}

      {/* Digital Immersive Background - Fixed Position for Parallax Cover Effect */}
      {!backgroundImage && variant === 'digital' && (
        <div className="fixed inset-0 h-screen w-full -z-10 pointer-events-none overflow-hidden">
          {/* Deep base gradient - Slow Movement */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)',
              transform: prefersReducedMotion ? undefined : `translateY(${scrollY * 5}%)`, // Very subtle movement
            }}
          />

          {/* Brand Glow Centerpiece - Slow-Medium Parallax */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 will-change-transform"
            style={{
              background: `radial-gradient(circle, ${accentColor}40 0%, transparent 60%)`,
              filter: 'blur(80px)',
              animation: 'pulse-glow 6s ease-in-out infinite',
              transform: prefersReducedMotion ? 'translate(-50%, -50%)' : `translate(-50%, calc(-50% + ${scrollY * 15}%))`,
            }}
          />

          {/* Animated grid with perspective - Medium Parallax */}
          <div
            className="absolute inset-0 opacity-20 will-change-transform"
            style={{
              backgroundImage: `
                linear-gradient(${accentColor}25 1px, transparent 1px),
                linear-gradient(90deg, ${accentColor}25 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              transform: `perspective(1000px) rotateX(75deg) translateY(-20%) translateZ(-100px) translateY(${scrollY * 20}%)`,
              animation: 'grid-move 15s linear infinite',
            }}
          />

          {/* Enhanced Light Orbs - Fast Parallax */}
          <div
            className="absolute top-[5%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20 will-change-transform"
            style={{
              background: `radial-gradient(circle, ${accentColor}60 0%, transparent 70%)`,
              filter: 'blur(100px)',
              animation: 'float-slow 20s ease-in-out infinite',
              transform: prefersReducedMotion ? undefined : `translateY(${scrollY * 40}%)`,
            }}
          />
          <div
            className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-15 will-change-transform"
            style={{
              background: `radial-gradient(circle, #E040FB4D 0%, transparent 70%)`,
              filter: 'blur(90px)',
              animation: 'float-slow 18s ease-in-out infinite reverse',
              transform: prefersReducedMotion ? undefined : `translateY(${scrollY * 35}%)`,
            }}
          />

          {/* Interactive Mouse Glow - No scroll parallax, just mouse */}
          <div
            className="absolute w-[800px] h-[800px] rounded-full opacity-20 mix-blend-screen transition-all duration-300"
            style={{
              background: `radial-gradient(circle, ${accentColor}20 0%, transparent 50%)`,
              left: `${mousePosition.x * 100}%`,
              top: `${mousePosition.y * 100}%`,
              transform: 'translate(-50%, -50%)', // Mouse position is relative to viewport/container, handled by state
            }}
          />
        </div>
      )}

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

      {/* Floating Orbs (Default Only) */}
      {variant === 'default' && (
        <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${accentColor}30 0%, transparent 60%)`,
              filter: 'blur(60px)',
              top: '10%',
              left: '5%',
              animation: 'floatOrb1 15s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-15"
            style={{
              background: `radial-gradient(circle, ${accentColor}25 0%, transparent 60%)`,
              filter: 'blur(50px)',
              bottom: '20%',
              right: '10%',
              animation: 'floatOrb2 12s ease-in-out infinite reverse',
            }}
          />
        </div>
      )}

      {/* Particles */}
      <ParticleField
        count={variant === 'digital' ? 50 : 25}
        color={particleColor}
        repulsion={true}
        direction={particleDirection}
        className="z-20"
      />

      {/* Content */}
      <div
        className="relative z-30 container-custom pt-24 pb-16 will-change-transform"
        style={contentTransform}
      >
        <div className={`grid grid-cols-1 ${imageRight || rightContent ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
          {/* Text Content */}
          <div className={`${imageRight || rightContent ? '' : 'max-w-4xl mx-auto text-center'}`}>
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
            {subtitle && (
              <p
                className="text-xl md:text-2xl text-white/80 font-body mb-8"
                style={{
                  opacity: 0,
                  animation: 'fade-in 0.6s ease-out 1s forwards',
                }}
              >
                {subtitle}
              </p>
            )}

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

          {/* Right Content / Image */}
          {(imageRight || rightContent) && (
            <div
              className="relative block mt-12 lg:mt-0"
              style={{
                opacity: 0,
                animation: 'fade-in 0.8s ease-out 0.8s forwards',
              }}
            >
              {rightContent ? (
                rightContent
              ) : (
                <div
                  className="relative"
                  style={{
                    animation: 'float-image 6s ease-in-out infinite',
                  }}
                >
                  <img
                    src={imageRight}
                    alt={imageAlt || ''}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      {onScrollDown && (
        <button
          onClick={onScrollDown}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors cursor-pointer z-30"
          aria-label="Rolar para baixo"
        >
          <svg
            className="w-6 h-6 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Accent Glow on edges */}
      <div
        className="absolute top-0 left-0 right-0 h-32 z-5 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${accentColor}10, transparent)`,
        }}
      />

      <style>{`
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(0.95); }
        }
        @keyframes float-image {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes grid-move {
          0% { transform: perspective(1000px) rotateX(75deg) translateY(0) translateZ(-100px); }
          100% { transform: perspective(1000px) rotateX(75deg) translateY(80px) translateZ(-100px); }
        }
        @keyframes float-slow {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4%, 6%) scale(1.08); }
          100% { transform: translate(-3%, -2%) scale(0.95); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </section>
  );
};

export default HeroStandard;
