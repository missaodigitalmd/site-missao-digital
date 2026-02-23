import React from 'react';

interface ShinyCardProps {
  children: React.ReactNode;
  className?: string;
}

export const ShinyCard: React.FC<ShinyCardProps> = ({ children, className = "" }) => {
  return (
    <>
      <style>{`
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        .shiny-card {
          --shiny-cards-bg: rgba(10, 10, 10, 0.5); /* Darker, subtler bg */
          --shiny-cards-border-width: 1px;
          --shiny-cards-highlight: #FFAC13;
          
          position: relative;
          border-radius: 1rem;
          background: var(--shiny-cards-bg);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05); /* Subtle inner border */
          transform: translateZ(0);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* The spinning border glow */
        .shiny-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: var(--shiny-cards-border-width);
          
          /* The "Light Loop" Gradient - visible only at the mask area */
          background: conic-gradient(
            from var(--gradient-angle),
            transparent 0%,
            transparent 30%,
            var(--shiny-cards-highlight) 45%,
            var(--shiny-cards-highlight) 50%,
            transparent 60%,
            transparent 100%
          );
          
          /* Mask trick: Content box (inner) vs Border box (full). XOR removes the center. */
          -webkit-mask: 
             linear-gradient(#fff 0 0) content-box, 
             linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          
          opacity: 0.5; /* Baseline visibility */
          animation: spin-gradient 4s linear infinite;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        /* Hover Effects */
        .shiny-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px -10px rgba(255, 172, 19, 0.15); /* Orange atmospheric glow */
        }
        
        .shiny-card:hover::before {
          opacity: 1; /* Brighten the border loop */
          animation-duration: 2s; /* Speed up slightly on hover */
        }

        @keyframes spin-gradient {
          0% { --gradient-angle: 0deg; }
          100% { --gradient-angle: 360deg; }
        }
      `}</style>
      <div className={`shiny-card ${className}`}>
        {children}
      </div>
    </>
  );
};
