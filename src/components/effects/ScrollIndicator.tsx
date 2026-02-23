import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  className?: string;
  onClick?: () => void;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  className = '',
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer ${className}`}
      style={{ zIndex: 30 }}
      aria-label="Rolar para baixo"
    >
      <ChevronDown className="w-6 h-6 animate-scroll-indicator" />
    </button>
  );
};

export default ScrollIndicator;
