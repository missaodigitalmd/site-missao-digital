
import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Cross, Users, Globe, Heart, Zap, Play, BookOpen, Smile } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';

interface FloatingIconProps {
    icon: React.ElementType;
    initialPos: { x: number; y: number; rotate: number };
    targetPos: { x: number; y: number; rotate: number };
    delay: string;
    duration: string;
    size?: number;
    color?: string;
    isExpanded: boolean;
    boxed?: boolean;
    rotationDuration?: string;
    rotationDirection?: 'normal' | 'reverse';
}

const FloatingIcon: React.FC<FloatingIconProps> = ({
    icon: Icon,
    initialPos,
    targetPos,
    delay,
    duration, // This is now used for the float animation
    size = 24,
    color = THEME_COLOR,
    isExpanded,
    boxed = false,
    rotationDuration = '20s',
    rotationDirection = 'normal',
}) => {
    const currentX = isExpanded ? targetPos.x : initialPos.x;
    const currentY = isExpanded ? targetPos.y : initialPos.y;

    // Base rotation transition (the "burst" effect on expand)
    // We add 360 to ensure it spins at least once during the expansion
    const burstRotate = isExpanded ? targetPos.rotate + 360 : initialPos.rotate;

    const opacity = isExpanded ? 1 : 0;
    const scale = isExpanded ? 1 : 0.5;

    // Render logic:
    // If boxed, the box styles and the content must move together.
    // We apply the spin and float animations to wrapper elements.

    const content = (
        <div className="relative flex items-center justify-center">
            <Icon
                size={size}
                color={color}
                className="drop-shadow-[0_0_8px_rgba(255,165,0,0.5)]"
            />
            {/* Pulse effect - only if not boxed, or subtle if boxed? Let's keep it. */}
            <div
                className="absolute inset-0 rounded-full opacity-0"
                style={{
                    boxShadow: `0 0 15px ${color}`,
                    animation: 'pulse-light 3s ease-in-out infinite'
                }}
            />
        </div>
    );

    return (
        <div
            className="absolute transition-all ease-out"
            style={{
                left: '50%',
                top: '50%',
                transform: `translate(${currentX}px, ${currentY}px) rotate(${burstRotate}deg) scale(${scale})`,
                opacity: opacity,
                transitionDuration: '1000ms',
                transitionDelay: isExpanded ? delay : '0ms',
                zIndex: -1,
            }}
        >
            {/* 
         Structure:
         1. Continuous Rotation Wrapper (Spin)
         2. Continuous Float Wrapper (Up/Down)
         3. Box/Content Wrapper (The actual visual element)
      */}
            <div
                style={{
                    animation: `spin-slow ${rotationDuration} linear infinite ${rotationDirection}`,
                }}
            >
                <div
                    style={{
                        animation: `float ${duration} ease-in-out infinite alternate`
                    }}
                >
                    {/* If boxed, the styling goes here to encompass the icon. 
               The icon inside does NOT have its own animation relative to this box.
           */}
                    <div className={`flex items-center justify-center ${boxed ? 'p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg' : ''}`}>
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const HeroFamilyComposition: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle intersection for mobile/scroll trigger
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // On mobile/touch or just standard visibility, we can trigger it
                    // For desktop, we might want hover, but scroll trigger is safer for visibility
                    if (entry.isIntersecting) {
                        // Optional: Auto-expand on scroll into view for dramatic effect
                        // setIsExpanded(true); 
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Use simple hover handlers for desktop interaction
    const handleMouseEnter = () => setIsExpanded(true);
    const handleMouseLeave = () => setIsExpanded(false);

    // Responsive configurations
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Helper to adjust position for mobile
    // Reduces spread slightly less than before to allow more visibility
    const getResponsivePos = (desktopPos: { x: number, y: number, rotate: number }) => {
        if (!isMobile) return desktopPos;
        return {
            x: desktopPos.x * 0.5, // Slightly reduced horizontal spread to keep in bounds
            y: desktopPos.y * 0.85,
            rotate: desktopPos.rotate
        };
    };

    // Configuration for all floating icons
    // Desktop distances are wide (~450px), Mobile will be constrained
    const rawIconsData = [
        // Top Right Cluster
        { icon: Gamepad2, target: { x: 420, y: -180, rotate: 15 }, delay: '100ms', duration: '4s', size: 32, boxed: true, rotationDuration: '25s', rotationDirection: 'normal' as const },
        { icon: Zap, target: { x: 340, y: -260, rotate: -10 }, delay: '200ms', duration: '5s', size: 24, boxed: false, rotationDuration: '18s', rotationDirection: 'reverse' as const },

        // Right Mid
        { icon: Users, target: { x: 480, y: -40, rotate: 5 }, delay: '150ms', duration: '6s', size: 28, boxed: true, rotationDuration: '30s', rotationDirection: 'normal' as const },

        // Bottom Right
        { icon: Globe, target: { x: 380, y: 150, rotate: -15 }, delay: '300ms', duration: '4.5s', size: 30, boxed: false, rotationDuration: '22s', rotationDirection: 'reverse' as const },

        // Top Left Cluster
        { icon: Cross, target: { x: -420, y: -160, rotate: -12 }, delay: '120ms', duration: '5.5s', size: 34, boxed: true, rotationDuration: '28s', rotationDirection: 'reverse' as const },
        { icon: Heart, target: { x: -320, y: -250, rotate: 20 }, delay: '250ms', duration: '4s', size: 26, boxed: false, rotationDuration: '20s', rotationDirection: 'normal' as const },

        // Left Mid
        { icon: BookOpen, target: { x: -480, y: -20, rotate: -8 }, delay: '180ms', duration: '6.5s', size: 30, boxed: true, rotationDuration: '35s', rotationDirection: 'reverse' as const },

        // Bottom Left
        { icon: Play, target: { x: -380, y: 180, rotate: 10 }, delay: '350ms', duration: '5s', size: 28, boxed: false, rotationDuration: '24s', rotationDirection: 'normal' as const },

        // Extras
        { icon: Smile, target: { x: 0, y: -350, rotate: 0 }, delay: '400ms', duration: '7s', size: 22, boxed: false, rotationDuration: '15s', rotationDirection: 'alternate' as any },
    ];

    const iconsData = rawIconsData.map(item => ({
        ...item,
        target: getResponsivePos(item.target)
    }));

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-[600px] aspect-[4/3] mx-auto flex items-end justify-center perspective-1000 group cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            // Mobile tap toggle
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Back Glow */}
            <div
                className="absolute inset-0 bg-brand-orange/20 rounded-full blur-[100px] transition-all duration-700"
                style={{
                    transform: isExpanded ? 'scale(1.2)' : 'scale(0.8)',
                    opacity: isExpanded ? 0.4 : 0.2
                }}
            />

            {/* Floating Icons Generator */}
            {iconsData.map((item, idx) => (
                <FloatingIcon
                    key={idx}
                    icon={item.icon}
                    initialPos={{ x: 0, y: 50, rotate: 0 }} // Start slightly lower/center
                    targetPos={item.target}
                    delay={item.delay}
                    duration={item.duration}
                    size={isMobile ? item.size * 0.7 : item.size} // Smaller icons on mobile
                    boxed={item.boxed}
                    isExpanded={isExpanded}
                    rotationDuration={item.rotationDuration}
                    rotationDirection={item.rotationDirection}
                />
            ))}

            {/* Main Image */}
            <div className="relative z-10 w-full transition-transform duration-500 ease-out group-hover:scale-[1.02] px-12 sm:px-0">
                <img
                    src="/images/familia-composition.webp"
                    alt="Família Missionária"
                    className="w-full h-auto object-contain drop-shadow-2xl"
                    style={{
                        maskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 100%)',
                        WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 100%)'
                    }}
                />

                {/* Subtle overlay gradient for better text contrast if needed, or just artistic touch */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        @keyframes pulse-light {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
        </div>
    );
};
