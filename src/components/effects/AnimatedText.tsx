import React from 'react';
import { useScrollReveal, usePrefersReducedMotion } from '@/hooks';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  highlightWords?: string[];
  highlightClassName?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.08,
  as: Component = 'h1',
  highlightWords = [],
  highlightClassName = 'text-gradient-brand',
}) => {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();
  const prefersReducedMotion = usePrefersReducedMotion();

  const words = text.split(' ');

  const isHighlighted = (word: string): boolean => {
    return highlightWords.some(
      (hw) => word.toLowerCase().includes(hw.toLowerCase()) || hw.toLowerCase().includes(word.toLowerCase())
    );
  };

  // If reduced motion is preferred, render without animation
  if (prefersReducedMotion) {
    return (
      <Component className={className}>
        {words.map((word, index) => (
          <React.Fragment key={index}>
            <span className={isHighlighted(word) ? highlightClassName : ''}>{word}</span>
            {index < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </Component>
    );
  }

  return (
    <div ref={ref}>
      <Component className={className}>
        {words.map((word, index) => (
          <span
            key={index}
            className="inline-block overflow-hidden mr-[0.3em]"
          >
            <span
              className={`inline-block ${isHighlighted(word) ? highlightClassName : ''}`}
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
                opacity: isVisible ? 1 : 0,
                transition: `transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay + index * staggerDelay}s, 
                            opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay + index * staggerDelay}s`,
              }}
            >
              {word}
            </span>
          </span>
        ))}
      </Component>
    </div>
  );
};

export default AnimatedText;
