import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  gradientColors?: string[];
  duration?: number;
}

export const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  children,
  className = '',
  gradientColors = ['#FFAC13', '#E040FB', '#00E5FF', '#FFAC13'],
  duration = 4,
}) => {
  const gradientString = gradientColors.join(', ');

  return (
    <div
      className={cn(
        'relative rounded-2xl p-[2px] overflow-hidden group',
        className
      )}
      style={{
        background: `linear-gradient(90deg, ${gradientString})`,
        backgroundSize: '300% 100%',
        animation: `border-rotate ${duration}s linear infinite`,
      }}
    >
      {/* Inner content with glass effect */}
      <div className="relative h-full w-full rounded-2xl bg-surface-primary/90 backdrop-blur-xl overflow-hidden">
        {/* Subtle inner glow */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: `linear-gradient(135deg, ${gradientColors[0]}10, transparent 50%, ${gradientColors[1]}10)`,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>

      <style>{`
        @keyframes border-rotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBorder;
