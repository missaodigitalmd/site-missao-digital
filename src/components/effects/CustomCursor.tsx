import React, { useEffect, useState, useRef } from 'react';
import { useIsMobile, usePrefersReducedMotion } from '@/hooks';
import { THEME_COLOR } from '@/constants/theme';

interface CursorContextType {
  color: string;
  scale: number;
  isPointer: boolean;
}

export const CustomCursor: React.FC = () => {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<CursorContextType>({
    color: 'rgba(255, 255, 255, 0.3)',
    scale: 1,
    isPointer: false,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const ringRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | undefined>(undefined);

  // Set isClient on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on mobile, if reduced motion is preferred, or if not client
  if (!isClient || isMobile || prefersReducedMotion) return null;

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setDotPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Spring animation for ring following the dot
    const animateRing = () => {
      const targetX = dotPosition.x;
      const targetY = dotPosition.y;

      // Spring physics
      const stiffness = 0.15;

      const dx = targetX - ringRef.current.x;
      const dy = targetY - ringRef.current.y;

      ringRef.current.x += dx * stiffness;
      ringRef.current.y += dy * stiffness;

      setPosition({ x: ringRef.current.x, y: ringRef.current.y });
      animationRef.current = requestAnimationFrame(animateRing);
    };

    // Detect interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for data-cursor attributes
      const cursorType = target.closest('[data-cursor]')?.getAttribute('data-cursor');
      const projectColor = target.closest('[data-project-color]')?.getAttribute('data-project-color');

      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        cursorType === 'pointer';

      if (isInteractive) {
        setCursorState({
          color: projectColor || `linear-gradient(135deg, ${THEME_COLOR}, #FE7003)`,
          scale: 1.5,
          isPointer: true,
        });
      } else if (cursorType === 'expand') {
        setCursorState({
          color: 'rgba(255, 255, 255, 0.5)',
          scale: 2,
          isPointer: false,
        });
      } else {
        setCursorState({
          color: 'rgba(255, 255, 255, 0.3)',
          scale: 1,
          isPointer: false,
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousemove', handleElementHover);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    animationRef.current = requestAnimationFrame(animateRing);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleElementHover);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.body.style.cursor = 'auto';
    };
  }, [dotPosition]);

  if (!isVisible) return null;

  return (
    <>
      {/* Ring cursor */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${cursorState.scale})`,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: `2px solid ${cursorState.color}`,
          background: cursorState.isPointer ? `${cursorState.color}20` : 'transparent',
          transition: 'transform 0.15s ease-out, border-color 0.2s ease, background 0.2s ease',
        }}
      />

      {/* Dot cursor */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: dotPosition.x,
          top: dotPosition.y,
          transform: 'translate(-50%, -50%)',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'opacity 0.2s ease',
        }}
      />
    </>
  );
};

export default CustomCursor;
