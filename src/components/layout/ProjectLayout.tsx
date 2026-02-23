import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProjectLayoutProps {
  children: React.ReactNode;
  themeColor: string;
  themeColorLight?: string;
  className?: string;
}

// Per-particle config: left%, top%, opacity, animation duration, parallax factor
// Per-particle config: left%, top%, opacity, animation duration, parallax factor, size
// Increased count to 60 and added size variation
const PARTICLE_CONFIG = Array.from({ length: 60 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 400, // Spread over 400vh height
  opacity: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
  dur: Math.random() * 15 + 10, // 10s to 25s
  factor: -(Math.random() * 0.2 + 0.05), // -0.05 to -0.25 (upward parallax)
  size: Math.random() * 3 + 4, // 4px to 7px size
}));

export const ProjectLayout: React.FC<ProjectLayoutProps> = ({
  children,
  themeColor,
  themeColorLight,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll parallax tracker
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const lightColor = themeColorLight || themeColor;

  return (
    <div
      ref={containerRef}
      className={cn('min-h-screen relative', className)}
    >
      {/* Immersive animated background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, ${themeColor}15 0%, transparent 50%),
                         linear-gradient(180deg, ${themeColor}08 0%, transparent 30%, transparent 70%, ${themeColor}05 100%),
                         #0a0a0a`,
            opacity: isVisible ? 1 : 0,
          }}
        />

        {/* Animated orbs */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${themeColor}30 0%, transparent 60%)`,
            filter: 'blur(80px)',
            left: '10%',
            top: '20%',
            animation: 'float-orb-1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-15"
          style={{
            background: `radial-gradient(circle, ${lightColor}25 0%, transparent 60%)`,
            filter: 'blur(60px)',
            right: '5%',
            bottom: '30%',
            animation: 'float-orb-2 15s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${themeColor}20 0%, transparent 60%)`,
            filter: 'blur(40px)',
            left: '50%',
            top: '60%',
            animation: 'float-orb-3 12s ease-in-out infinite',
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(${themeColor}40 1px, transparent 1px),
              linear-gradient(90deg, ${themeColor}40 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating particles with scroll parallax */}
        {PARTICLE_CONFIG.map((p, i) => (
          <div
            key={i}
            className="absolute will-change-transform"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              // Parallax: each particle moves at its own speed opposite to scroll
              transform: `translateY(${scrollY * p.factor}px)`,
              transition: 'transform 0.1s linear',
            }}
          >
            {/* Inner div: natural float animation */}
            <div
              className="rounded-full"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: themeColor,
                opacity: p.opacity,
                animation: `float-particle ${p.dur}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="pt-20">{children}</div>
      </div>

      <style>{`
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -30px) scale(1.1); }
          66% { transform: translate(-30px, 50px) scale(0.9); }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 40px) scale(1.05); }
        }
        @keyframes float-orb-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -20px) scale(1.1); }
          75% { transform: translate(-20px, 30px) scale(0.95); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ProjectLayout;
