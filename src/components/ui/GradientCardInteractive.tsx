import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface GradientCardInteractiveProps {
  children: React.ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  hoverScale?: boolean;
  animateGradient?: boolean;
}

/**
 * GradientCardInteractive - Card with animated gradient on hover
 * 
 * Features:
 * - Subtle gradient background
 * - Animated gradient shift on hover
 * - Optional scale transform on hover
 * - Smooth color transitions
 * - Mouse position-based gradient movement
 */
export const GradientCardInteractive: React.FC<GradientCardInteractiveProps> = ({
  children,
  className,
  gradientFrom = '#FFAC13',
  gradientTo = '#FF8C00',
  hoverScale = true,
  animateGradient = true,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!animateGradient) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden transition-all duration-500',
        hoverScale && 'hover:scale-[1.03]',
        'shadow-md hover:shadow-xl',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-10 transition-opacity duration-500"
        style={{
          background: animateGradient
            ? `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, ${gradientFrom} 0%, ${gradientTo} 50%, transparent 100%)`
            : `linear-gradient(135deg, ${gradientFrom}20 0%, ${gradientTo}20 100%)`,
          opacity: isHovered ? 0.2 : 0.1,
        }}
      />

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, ${gradientFrom}15 0%, transparent 60%)`,
        }}
      />

      {/* Border gradient */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}30, ${gradientTo}30)`,
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Content */}
      <div className="relative z-10 bg-surface-card rounded-2xl">
        {children}
      </div>
    </div>
  );
};

export default GradientCardInteractive;
