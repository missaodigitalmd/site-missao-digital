import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor?: string;
  className?: string;
  stepNumber?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  accentColor = '#FFAC13',
  className = '',
  stepNumber,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden group',
        'backdrop-blur-md',
        'border border-white/10',
        'transition-all duration-500',
        'hover:border-white/20',
        className
      )}
      style={{
        background: 'rgba(30, 30, 30, 0.55)',
        boxShadow: isHovering
          ? `0 0 40px ${accentColor}15, 0 15px 50px rgba(0,0,0,0.3)`
          : '0 8px 30px rgba(0,0,0,0.15)',
        transform: isHovering ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Step number badge */}
      {stepNumber && (
        <div
          className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-20 transition-transform duration-300"
          style={{
            background: accentColor,
            color: '#000',
            transform: isHovering ? 'scale(1.1)' : 'scale(1)',
            boxShadow: `0 0 20px ${accentColor}50`,
          }}
        >
          {stepNumber}
        </div>
      )}

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80, transparent)`,
          opacity: isHovering ? 1 : 0.4,
          boxShadow: isHovering ? `0 0 15px ${accentColor}` : 'none',
        }}
      />

      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(300px circle at 50% 0%, ${accentColor}10, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
          style={{
            background: `${accentColor}15`,
            boxShadow: isHovering ? `0 0 20px ${accentColor}30` : 'none',
          }}
        >
          <Icon
            className="w-8 h-8 transition-all duration-300"
            style={{ color: accentColor }}
          />
        </div>

        {/* Title */}
        <h3
          className="text-2xl font-bold mb-3 transition-colors duration-300"
          style={{ color: isHovering ? accentColor : '#fff' }}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-white/70 text-lg leading-relaxed">{description}</p>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none transition-opacity duration-300"
        style={{
          background: `linear-gradient(to top, ${accentColor}08, transparent)`,
          opacity: isHovering ? 1 : 0,
        }}
      />
    </div>
  );
};

export default FeatureCard;
