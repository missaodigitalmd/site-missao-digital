
import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Cross, Users, Globe, Heart, Zap, Play, BookOpen, Smile } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';
import { ParticleField } from '@/components/effects/ParticleField';
import { AnimatedText } from '@/components/effects/AnimatedText';
import { usePrefersReducedMotion } from '@/hooks';

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
    duration,
    size = 24,
    color = THEME_COLOR,
    isExpanded,
    boxed = false,
    rotationDuration = '20s',
    rotationDirection = 'normal',
}) => {
    const currentX = isExpanded ? targetPos.x : initialPos.x;
    const currentY = isExpanded ? targetPos.y : initialPos.y;
    const burstRotate = isExpanded ? targetPos.rotate + 360 : initialPos.rotate;
    const opacity = isExpanded ? 1 : 0;
    const scale = isExpanded ? 1 : 0.5;

    const content = (
        <div className="relative flex items-center justify-center">
            <Icon
                size={size}
                color={color}
                className="drop-shadow-[0_0_8px_rgba(255,165,0,0.5)]"
            />
            {/* Pulse effect */}
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
                    <div className={`flex items-center justify-center ${boxed ? 'p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg' : ''}`}>
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface HeroApoieProps {
    title: string;
    subtitle?: string;
    highlightWords?: string[];
    highlightClassName?: string;
    whatsappUrl?: string; // Optional direct CTA in subtitle area? Or keep standard
}

export const HeroApoie: React.FC<HeroApoieProps> = ({
    title,
    subtitle,
    highlightWords = [],
    highlightClassName = 'text-gradient-brand',
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollY, setScrollY] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    const prefersReducedMotion = usePrefersReducedMotion();

    // Scroll parallax effect
    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
                setScrollY(progress);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mouse move effect for digital variant
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePosition({
                    x: (e.clientX - rect.left) / rect.width,
                    y: (e.clientY - rect.top) / rect.height,
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Mobile check for icon positioning (reduced spread)
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Helper to adjust position for mobile
    const getResponsivePos = (desktopPos: { x: number, y: number, rotate: number }) => {
        if (!isMobile) return desktopPos;
        return {
            x: desktopPos.x * 0.5,
            y: desktopPos.y * 0.85,
            rotate: desktopPos.rotate
        };
    };

    const handleMouseEnter = () => setIsExpanded(true);
    const handleMouseLeave = () => setIsExpanded(false);

    // Icons Data (Same as HeroFamilyComposition)
    const rawIconsData = [
        { icon: Gamepad2, target: { x: 420, y: -180, rotate: 15 }, delay: '100ms', duration: '4s', size: 32, boxed: true, rotationDuration: '25s', rotationDirection: 'normal' as const },
        { icon: Zap, target: { x: 340, y: -260, rotate: -10 }, delay: '200ms', duration: '5s', size: 24, boxed: false, rotationDuration: '18s', rotationDirection: 'reverse' as const },
        { icon: Users, target: { x: 480, y: -40, rotate: 5 }, delay: '150ms', duration: '6s', size: 28, boxed: true, rotationDuration: '30s', rotationDirection: 'normal' as const },
        { icon: Globe, target: { x: 380, y: 150, rotate: -15 }, delay: '300ms', duration: '4.5s', size: 30, boxed: false, rotationDuration: '22s', rotationDirection: 'reverse' as const },
        { icon: Cross, target: { x: -420, y: -160, rotate: -12 }, delay: '120ms', duration: '5.5s', size: 34, boxed: true, rotationDuration: '28s', rotationDirection: 'reverse' as const },
        { icon: Heart, target: { x: -320, y: -250, rotate: 20 }, delay: '250ms', duration: '4s', size: 26, boxed: false, rotationDuration: '20s', rotationDirection: 'normal' as const },
        { icon: BookOpen, target: { x: -480, y: -20, rotate: -8 }, delay: '180ms', duration: '6.5s', size: 30, boxed: true, rotationDuration: '35s', rotationDirection: 'reverse' as const },
        { icon: Play, target: { x: -380, y: 180, rotate: 10 }, delay: '350ms', duration: '5s', size: 28, boxed: false, rotationDuration: '24s', rotationDirection: 'normal' as const },
        { icon: Smile, target: { x: 0, y: -350, rotate: 0 }, delay: '400ms', duration: '7s', size: 22, boxed: false, rotationDuration: '15s', rotationDirection: 'alternate' as any },
    ];

    const iconsData = rawIconsData.map(item => ({
        ...item,
        target: getResponsivePos(item.target)
    }));

    // Background Parallax Helpers (from HeroStandard)
    const accentColor = THEME_COLOR;

    return (
        <section
            ref={containerRef}
            className="relative min-h-[66vh] md:min-h-[85vh] w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a] pt-16 pb-6 md:pt-24 md:pb-12 lg:pt-0 lg:pb-0"
            style={{ position: 'relative', zIndex: 0 }}
        >
            {/* --- BACKGROUND LAYERS (Simplified from HeroStandard 'digital' variant) --- */}

            {/* Deep base gradient */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)',
                    transform: prefersReducedMotion ? undefined : `translateY(${scrollY * 5}%)`,
                }}
            />

            {/* Brand Glow Centerpiece */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${accentColor}40 0%, transparent 60%)`,
                    filter: 'blur(80px)',
                    animation: 'pulse-glow 6s ease-in-out infinite',
                    transform: prefersReducedMotion ? 'translate(-50%, -50%)' : `translate(-50%, calc(-50% + ${scrollY * 15}%))`,
                }}
            />

            {/* Grid */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(${accentColor}25 1px, transparent 1px), linear-gradient(90deg, ${accentColor}25 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                    transform: `perspective(1000px) rotateX(75deg) translateY(-20%) translateZ(-100px) translateY(${scrollY * 20}%)`,
                    animation: 'grid-move 15s linear infinite',
                }}
            />

            {/* Interactive Mouse Glow */}
            <div
                className="absolute w-[800px] h-[800px] rounded-full opacity-20 mix-blend-screen transition-all duration-300 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${accentColor}20 0%, transparent 50%)`,
                    left: `${mousePosition.x * 100}%`,
                    top: `${mousePosition.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                }}
            />

            {/* Standard Overlay */}
            <div
                className="absolute inset-0 z-10 pointers-events-none"
                style={{
                    background: `linear-gradient(to bottom, rgba(13, 13, 13, 0.8) 0%, rgba(13, 13, 13, 0.5) 50%, rgba(13, 13, 13, 0.85) 100%)`
                }}
            />

            {/* Particles */}
            <ParticleField count={50} color={accentColor} repulsion={true} direction="random" className="z-0" />


            {/* --- FOREGROUND CONTENT (Layout: Title TL - Image Center - Subtitle BR) --- */}

            <div className="relative z-20 container mx-auto px-4 flex flex-col w-full h-full min-h-[66vh] md:min-h-[85vh]">

                {/* 1. Title Area (Mid-Left) */}
                <div className="absolute top-20 md:top-32 lg:top-36 left-6 md:left-10 lg:left-16 max-w-[30rem] z-20 pointer-events-none select-none">
                    <AnimatedText
                        text={title}
                        as="h1"
                        className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.06]"
                        highlightWords={highlightWords}
                        highlightClassName={highlightClassName}
                        delay={0.2}
                        staggerDelay={0.08}
                    />
                </div>

                {/* 2. Image Composition (Center - Bottom Aligned - 90% height) */}
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[90%] flex items-end justify-center z-10"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="relative w-[560px] max-w-[145vw] md:w-[760px] md:max-w-[68vw] lg:w-[820px] lg:max-w-[60vw] flex items-end justify-center perspective-1000 group cursor-pointer pointer-events-auto">
                        {/* Back Glow */}
                        <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-brand-orange/20 rounded-full blur-[100px] transition-all duration-700"
                            style={{
                                transform: isExpanded ? 'scale(1.2)' : 'scale(0.8)',
                                opacity: isExpanded ? 0.4 : 0.2
                            }}
                        />

                        {/* Icons */}
                        {iconsData.map((item, idx) => (
                            <FloatingIcon
                                key={idx}
                                icon={item.icon}
                                initialPos={{ x: 0, y: 50, rotate: 0 }}
                                targetPos={item.target}
                                delay={item.delay}
                                duration={item.duration}
                                size={isMobile ? item.size * 0.7 : item.size}
                                boxed={item.boxed}
                                isExpanded={isExpanded}
                                rotationDuration={item.rotationDuration}
                                rotationDirection={item.rotationDirection}
                            />
                        ))}

                        {/* Image - Max Height logic */}
                        <div className="relative z-10 w-full translate-y-0 md:translate-y-[14px] lg:-translate-y-[14px] xl:-translate-y-[20px] transition-transform duration-500 ease-out group-hover:scale-[1.02] flex items-end">
                            <img
                                src="/images/familiaLaranja43.webp"
                                alt="Missionary Family"
                                className="w-full h-auto object-contain drop-shadow-2xl"
                                style={{
                                    maskImage: 'linear-gradient(to top, transparent 0%, black 6%, black 100%)',
                                    WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 6%, black 100%)'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    </div>
                </div>

                {/* 3. Subtitle Area (Mid-Right) - Visible only on Desktop (>= lg) */}
                <div className="absolute bottom-20 md:bottom-24 lg:bottom-28 right-8 md:right-12 lg:right-16 max-w-[360px] lg:max-w-[420px] text-right z-20 pointer-events-none select-none hidden lg:block">
                    {subtitle && (
                        <div
                            className="text-xl md:text-2xl text-white/80 font-body"
                            style={{
                                opacity: 0,
                                animation: 'fade-in 0.6s ease-out 1s forwards',
                            }}
                        >
                            <p>{subtitle}</p>
                        </div>
                    )}
                </div>


            </div>

            {/* Styles (duplicated from HeroStandard/HeroFamilyComposition to ensure self-contained) */}
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
                @keyframes grid-move {
                    0% { transform: perspective(1000px) rotateX(75deg) translateY(0) translateZ(-100px); }
                    100% { transform: perspective(1000px) rotateX(75deg) translateY(80px) translateZ(-100px); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.15); }
                }
            `}</style>
        </section>
    );
};
