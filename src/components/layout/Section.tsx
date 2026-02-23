import React, { forwardRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  background?: 'default' | 'secondary' | 'gradient';
  reveal?: boolean;
  /** Background image URL — replaces solid bg with image + dark overlay */
  imageSrc?: string;
  /** Overlay opacity over background image (0-1, default 0.85) */
  overlayOpacity?: number;
  /** Optional gradient tint on top of overlay (CSS gradient string) */
  gradientTint?: string;
  /** Content that should bypass the container-custom and occupy the full width of the section */
  fullWidthContent?: React.ReactNode;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Add a dark gradient fade at the top of the section */
  topFade?: boolean;
  /** Add a dark gradient fade at the bottom of the section */
  bottomFade?: boolean;
  /** Enable parallax effect on background image */
  parallax?: boolean;
  /** Parallax speed factor (default 0.3) */
  parallaxSpeed?: number;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      id,
      className = '',
      containerClassName = '',
      background = 'default',
      reveal = true,
      imageSrc,
      overlayOpacity = 0.85,
      gradientTint,
      fullWidthContent,
      style,
      topFade,
      bottomFade,
      parallax = false,
      parallaxSpeed = 0.3,
    },
    forwardedRef
  ) => {
    // Visibility state
    const [isVisible, setIsVisible] = React.useState(false);
    // State ref for the element to ensure effects run when element is attached
    const [sectionElement, setSectionElement] = React.useState<HTMLElement | null>(null);
    const prefersReducedMotion = usePrefersReducedMotion();
    const [parallaxOffset, setParallaxOffset] = React.useState(0);

    const revealStyles =
      reveal && !prefersReducedMotion
        ? {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }
        : {};

    const backgroundClasses = imageSrc
      ? ''
      : {
        default: '',
        secondary: 'bg-surface-secondary',
        gradient: 'bg-gradient-to-b from-surface-secondary to-surface-primary',
      }[background];

    // Visibility Observer Logic
    React.useEffect(() => {
      // If reveal is disabled, show immediately
      if (!reveal) {
        setIsVisible(true);
        return;
      }

      // If element is not yet attached, return
      if (!sectionElement) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Trigger once
          }
        },
        { threshold: 0.1, rootMargin: '-50px' }
      );

      observer.observe(sectionElement);

      return () => observer.disconnect();
    }, [sectionElement, reveal]);

    // Parallax logic
    React.useEffect(() => {
      if (!parallax || !imageSrc || prefersReducedMotion || !sectionElement) return;

      const handleScroll = () => {
        const rect = sectionElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Only calculate if section is in viewport (with some buffer)
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          // Calculate relative position of section in viewport
          // Center of viewport is 0
          const center = windowHeight / 2;
          const sectionCenter = rect.top + rect.height / 2;
          const distanceFromCenter = sectionCenter - center;

          setParallaxOffset(distanceFromCenter * parallaxSpeed);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial calculation

      return () => window.removeEventListener('scroll', handleScroll);
    }, [parallax, imageSrc, prefersReducedMotion, parallaxSpeed, sectionElement]);

    // Merge refs logic
    const setRefs = React.useCallback(
      (element: HTMLElement | null) => {
        setSectionElement(element);

        if (typeof forwardedRef === 'function') {
          forwardedRef(element);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = element;
        }
      },
      [forwardedRef]
    );

    return (
      <section
        ref={setRefs}
        id={id}
        className={`section-padding relative overflow-hidden ${backgroundClasses} ${className}`}
        style={{ ...revealStyles, ...style }}
      >
        {/* Image Background Layer */}
        {imageSrc && (
          <>
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={imageSrc}
                alt=""
                aria-hidden="true"
                className={`w-full object-cover transition-transform duration-75 ease-out ${parallax ? 'h-[120%] -top-[10%]' : 'h-full'}`}
                style={
                  parallax && !prefersReducedMotion
                    ? { transform: `translateY(${parallaxOffset}px)` }
                    : {}
                }
              />
            </div>
            {/* Dark overlay */}
            <div
              className="absolute inset-0 z-[1]"
              style={{ background: `rgba(13, 13, 13, ${overlayOpacity})` }}
            />
            {/* Optional gradient tint */}
            {gradientTint && (
              <div
                className="absolute inset-0 z-[2]"
                style={{ background: gradientTint }}
              />
            )}
          </>
        )}

        {topFade && (
          <div
            className="absolute top-0 left-0 right-0 h-32 md:h-48 z-[3] pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, #0D0D0D 0%, transparent 100%)',
            }}
          />
        )}

        {bottomFade && (
          <div
            className="absolute bottom-0 left-0 right-0 h-32 md:h-48 z-[3] pointer-events-none"
            style={{
              background: 'linear-gradient(to top, #0D0D0D 0%, transparent 100%)',
            }}
          />
        )}

        {fullWidthContent}

        <div className={`container-custom relative z-[5] ${containerClassName}`}>
          {children}
        </div>
      </section>
    );
  }
);

Section.displayName = 'Section';

export default Section;
