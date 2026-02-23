import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProjectSectionProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glowOnHover?: boolean;
}

export const ProjectSection: React.FC<ProjectSectionProps> = ({
  children,
  className = '',
  accentColor = '#FFAC13',
  glowOnHover = true,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <div
      ref={sectionRef}
      className={cn(
        'relative rounded-3xl overflow-hidden',
        'bg-white/[0.03] backdrop-blur-xl',
        'border border-white/10',
        'transition-all duration-500',
        className
      )}
      style={{
        boxShadow: isHovering && glowOnHover
          ? `0 0 60px ${accentColor}15, 0 25px 80px rgba(0,0,0,0.4)`
          : '0 10px 40px rgba(0,0,0,0.2)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Dynamic spotlight */}
      {glowOnHover && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: isHovering
              ? `radial-gradient(600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, ${accentColor}12, transparent 50%)`
              : 'none',
          }}
        />
      )}

      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentColor} 20%, ${accentColor} 80%, transparent 100%)`,
          opacity: isHovering ? 1 : 0.6,
          boxShadow: isHovering ? `0 0 20px ${accentColor}` : 'none',
        }}
      />

      {/* Corner decorations */}
      <div
        className="absolute top-0 left-0 w-16 h-16 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${accentColor}20, transparent 60%)`,
          opacity: isHovering ? 1 : 0.5,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-16 h-16 transition-opacity duration-300"
        style={{
          background: `linear-gradient(-45deg, ${accentColor}20, transparent 60%)`,
          opacity: isHovering ? 1 : 0.5,
        }}
      />

      {/* Subtle inner gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${accentColor}05 0%, transparent 30%, transparent 70%, ${accentColor}03 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-10">{children}</div>
    </div>
  );
};

export default ProjectSection;
