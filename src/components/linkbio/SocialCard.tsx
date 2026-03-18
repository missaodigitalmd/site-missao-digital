import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { SocialCardData } from '../../data/linkbioData';
import { SocialIcon } from './SocialIcon.tsx';

interface SocialCardProps {
  card: SocialCardData;
  animationDelay?: number;
}

const FPS = 14; // smoother, less aggressive frame animation

export function SocialCard({ card, animationDelay = 0 }: SocialCardProps) {
  const hasFrames = card.frames.length > 0;
  const isInstagramAnimated = card.id === 'instagram' && hasFrames;
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Preload images
  useEffect(() => {
    if (!isInstagramAnimated) return;
    card.frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [card.frames, isInstagramAnimated]);

  // Intersection observer for staggered entrance
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), animationDelay);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animationDelay]);

  const clearAnim = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleActivate = useCallback(() => {
    setIsHovering(true);

    if (!isInstagramAnimated) return;
    clearAnim();
    intervalRef.current = setInterval(() => {
      frameRef.current = Math.min(frameRef.current + 1, card.frames.length - 1);
      setCurrentFrame(frameRef.current);
      if (frameRef.current >= card.frames.length - 1) clearAnim();
    }, 1000 / FPS);
  }, [isInstagramAnimated, card.frames.length, clearAnim]);

  const handleDeactivate = useCallback(() => {
    setIsHovering(false);

    if (!isInstagramAnimated) return;
    clearAnim();
    intervalRef.current = setInterval(() => {
      frameRef.current = Math.max(frameRef.current - 1, 0);
      setCurrentFrame(frameRef.current);
      if (frameRef.current <= 0) clearAnim();
    }, 1000 / FPS);
  }, [isInstagramAnimated, clearAnim]);

  useEffect(() => () => clearAnim(), [clearAnim]);

  const glowStyle = {
    '--card-glow': card.glowColor,
    '--card-glow-2': card.glowColorSecondary || card.glowColor,
    '--card-gradient': card.gradient || `linear-gradient(135deg, ${card.glowColor}, ${card.glowColorSecondary || card.glowColor})`,
  } as CSSProperties;

  return (
    <a
      ref={cardRef}
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`linkbio-social-card linkbio-social-card--${card.id} ${isHovering ? 'linkbio-social-card--hover' : ''} ${isVisible ? 'linkbio-social-card--visible' : ''} ${isInstagramAnimated ? 'linkbio-social-card--instagram-animated' : ''}`}
      style={glowStyle}
      onMouseEnter={handleActivate}
      onMouseLeave={handleDeactivate}
      onFocus={handleActivate}
      onBlur={handleDeactivate}
      aria-label={`Acessar o ${card.label} do Missão Digital`}
    >
      {/* Mask layer that used to be a pseudo-element */}
      <span className="linkbio-card-mask" aria-hidden="true" />

      {/* Photo slot — left side */}
      <div className="linkbio-card-photo-slot" aria-hidden="true">
        {hasFrames ? (
          <img
            src={card.frames[currentFrame]}
            alt=""
            className="linkbio-card-photo"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="linkbio-card-photo-placeholder">
            <SocialIcon type={card.iconType} size={48} color={card.glowColor} />
          </div>
        )}
      </div>

      {/* Content — right side */}
      <div className="linkbio-card-content">
        <SocialIcon type={card.iconType} size={32} color={card.glowColor} />
        <span className="linkbio-card-label">{card.label}</span>
        {card.sublabel && (
          <span className="linkbio-card-sublabel">{card.sublabel}</span>
        )}
      </div>

      {/* Hover shimmer overlay */}
      <span className="linkbio-card-shimmer" aria-hidden="true" />
    </a>
  );
}
