import React, { useEffect, useRef, useCallback } from 'react';
import { useIsMobile, usePrefersReducedMotion } from '@/hooks';

import { THEME_COLOR } from '@/constants/theme';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  originalY: number;
}

interface ParticleFieldProps {
  count?: number;
  color?: string;
  repulsion?: boolean;
  direction?: 'up' | 'down' | 'random';
  className?: string;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 30,
  color = THEME_COLOR,
  repulsion = true,
  direction = 'random',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number | undefined>(undefined);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  const initParticles = useCallback(
    (width: number, height: number) => {
      const particleCount = isMobile ? Math.min(count, 15) : count;
      particlesRef.current = Array.from({ length: particleCount }, () => {
        const y = Math.random() * height;
        let vx = 0;
        let vy = 0;

        // Set initial velocity based on direction
        switch (direction) {
          case 'up':
            vx = (Math.random() - 0.5) * 0.3;
            vy = -Math.random() * 0.5 - 0.2;
            break;
          case 'down':
            vx = (Math.random() - 0.5) * 0.3;
            vy = Math.random() * 0.5 + 0.2;
            break;
          case 'random':
          default:
            vx = (Math.random() - 0.5) * 0.5;
            vy = (Math.random() - 0.5) * 0.5;
            break;
        }

        return {
          x: Math.random() * width,
          y,
          vx,
          vy,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          originalY: y,
        };
      });
    },
    [count, isMobile, direction]
  );

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Skip if reduced motion is preferred
    if (prefersReducedMotion) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        initParticles(canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (repulsion && !isMobile) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Repulsion from mouse
        if (repulsion && !isMobile) {
          const dx = particle.x - mouseRef.current.x;
          const dy = particle.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100 && dist > 0) {
            const force = (100 - dist) / 100;
            particle.vx += (dx / dist) * force * 0.5;
            particle.vy += (dy / dist) * force * 0.5;
          }
        }

        // Apply velocity with damping
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Add movement based on direction
        switch (direction) {
          case 'up':
            particle.vy -= 0.005; // Constant upward force
            particle.vx += (Math.random() - 0.5) * 0.01; // Slight horizontal drift
            break;
          case 'down':
            particle.vy += 0.005; // Constant downward force
            particle.vx += (Math.random() - 0.5) * 0.01;
            break;
          case 'random':
          default:
            particle.vx += (Math.random() - 0.5) * 0.02;
            particle.vy += (Math.random() - 0.5) * 0.02;
            break;
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;

        if (direction === 'up') {
          if (particle.y < -10) {
            particle.y = canvas.height + 10;
            particle.vy = -Math.random() * 0.5 - 0.2;
          }
        } else if (direction === 'down') {
          if (particle.y > canvas.height + 10) {
            particle.y = -10;
            particle.vy = Math.random() * 0.5 + 0.2;
          }
        } else {
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
        }

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        // Add subtle glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = particle.opacity * 0.3;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, repulsion, isMobile, prefersReducedMotion, initParticles, handleMouseMove, direction]);

  // Don't render if reduced motion is preferred
  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 20 }}
    />
  );
};

export default ParticleField;
