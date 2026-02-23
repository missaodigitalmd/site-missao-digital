import React, { useRef, useState, useCallback } from 'react';
import { useSupportsHover, usePrefersReducedMotion } from '@/hooks';

interface TiltCardProps {
  children: React.ReactNode;
  glowColor?: string;
  intensity?: number;
  parallaxIntensity?: number;
  className?: string;
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  glowColor = 'rgba(254, 112, 3, 0.15)',
  intensity = 8,
  parallaxIntensity = 10,
  className = '',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const supportsHover = useSupportsHover();
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !supportsHover || prefersReducedMotion) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -intensity;
      const rotateY = ((x - centerX) / centerX) * intensity;

      setTransform({ rotateX, rotateY });

      setGlowPosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });
    },
    [intensity, parallaxIntensity, supportsHover, prefersReducedMotion]
  );

  const handleMouseEnter = useCallback(() => {
    if (supportsHover && !prefersReducedMotion) {
      setIsHovered(true);
    }
  }, [supportsHover, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        cursor: onClick ? 'pointer' : 'default',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow effect */}
      {supportsHover && !prefersReducedMotion && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, ${glowColor} 0%, transparent 50%)`,
            opacity: isHovered ? 1 : 0,
            zIndex: 1,
          }}
        />
      )}
      
      {/* Border glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300"
        style={{
          boxShadow: isHovered ? `0 0 30px ${glowColor}, inset 0 0 20px ${glowColor}` : 'none',
          opacity: isHovered ? 0.5 : 0,
          zIndex: 2,
        }}
      />
      
      {/* Card content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

// ParallaxImage component for use inside TiltCard
interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ParallaxImage: React.FC<ParallaxImageProps> = ({ src, alt, className = '' }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const supportsHover = useSupportsHover();
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current || !supportsHover || prefersReducedMotion) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / rect.width * -15;
    const y = (event.clientY - rect.top - rect.height / 2) / rect.height * -15;
    
    setTransform({ x, y });
  }, [supportsHover, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setTransform({ x: 0, y: 0 });
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover image-breathe transition-transform duration-300"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(1.05)`,
        }}
      />
    </div>
  );
};

export default TiltCard;
