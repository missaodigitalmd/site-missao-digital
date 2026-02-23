import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  hoverScale?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  accentColor = '#FFAC13',
  hoverScale = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-white/[0.05] backdrop-blur-md',
        'border border-white/10',
        'transition-all duration-300',
        hoverScale && 'hover:scale-[1.02]',
        className
      )}
      style={{
        boxShadow: isHovering
          ? `0 0 40px ${accentColor}20, 0 20px 60px rgba(0,0,0,0.3)`
          : '0 10px 40px rgba(0,0,0,0.2)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Gradient spotlight following mouse */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: isHovering
            ? `radial-gradient(400px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, ${accentColor}15, transparent 50%)`
            : 'none',
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: isHovering ? 1 : 0.5,
        }}
      />

      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-8 h-8 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${accentColor}30, transparent 50%)`,
          opacity: isHovering ? 1 : 0.5,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-8 h-8 transition-opacity duration-300"
        style={{
          background: `linear-gradient(-45deg, ${accentColor}30, transparent 50%)`,
          opacity: isHovering ? 1 : 0.5,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GlassCard;
