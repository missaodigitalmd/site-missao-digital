import React from 'react';
import { cn } from '@/lib/utils';

interface GlassMorphCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  blurIntensity?: 'sm' | 'md' | 'lg' | 'xl';
  borderOpacity?: number;
  backgroundOpacity?: number;
}

/**
 * GlassMorphCard - True glassmorphism card with backdrop-blur
 * 
 * Features:
 * - Backdrop filter blur for frosted glass effect
 * - Semi-transparent background
 * - Subtle borders with customizable opacity
 * - Optional accent color gradient tint
 * - Hover effects with smooth transitions
 */
export const GlassMorphCard: React.FC<GlassMorphCardProps> = ({
  children,
  className,
  accentColor = '#FFAC13',
  blurIntensity = 'md',
  borderOpacity = 0.1,
  backgroundOpacity = 0.6,
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm', // 4px
    md: 'backdrop-blur-md', // 12px
    lg: 'backdrop-blur-lg', // 16px
    xl: 'backdrop-blur-xl', // 24px
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-lg',
        blurClasses[blurIntensity],
        className
      )}
      style={{
        background: `rgba(30, 30, 30, ${backgroundOpacity})`,
        border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
      }}
    >
      {/* Optional gradient tint overlay */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 100%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassMorphCard;
