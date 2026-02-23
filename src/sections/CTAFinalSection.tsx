import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Zap, ArrowRight } from 'lucide-react';
import { AnimatedText, ParticleField } from '@/components/effects';
import { THEME_COLOR } from '@/constants/theme';

export const CTAFinalSection: React.FC = () => {
  const { t } = useTranslation('home');
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const sectionRef = useRef<HTMLElement>(null);

  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('cta_final.whatsapp_message'))}`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-48 lg:py-64 overflow-hidden bg-[#0a0a0a]"
    >
      {/* Top transition fade */}
      <div
        className="absolute top-0 left-0 right-0 h-32 md:h-48 z-[3] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #0D0D0D 0%, transparent 100%)',
        }}
      />
      {/* Animated background layers */}
      <div className="absolute inset-0 z-0">
        {/* Deep base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)',
          }}
        />

        {/* Brand Glow Centerpiece */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(254, 112, 3, 0.25) 0%, transparent 60%)',
            filter: 'blur(80px)',
            animation: 'pulse-glow 6s ease-in-out infinite',
          }}
        />

        {/* Animated grid with perspective */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 172, 19, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 172, 19, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: `perspective(1000px) rotateX(75deg) translateY(-20%) translateZ(-100px)`,
            animation: 'grid-move 15s linear infinite',
          }}
        />

        {/* Particle Field */}
        <ParticleField
          count={50}
          color={THEME_COLOR}
          className="opacity-40"
        />

        {/* Enhanced Light Orbs */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255, 172, 19, 0.4) 0%, transparent 70%)',
            filter: 'blur(100px)',
            animation: 'float-slow 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(224, 64, 251, 0.3) 0%, transparent 70%)',
            filter: 'blur(90px)',
            animation: 'float-slow 18s ease-in-out infinite reverse',
          }}
        />

        {/* Interactive Mouse Glow */}
        <div
          className="absolute w-[1000px] h-[1000px] rounded-full opacity-25 mix-blend-screen pointer-events-none transition-all duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(255, 172, 19, 0.1) 0%, transparent 50%)',
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-light/10 border border-brand-orange-light/20 mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <Zap className="w-4 h-4 text-brand-orange-light" />
          <span className="text-sm text-brand-orange-light font-medium">{t('cta_final.badge')}</span>
        </div>

        <AnimatedText
          text={t('cta_final.title')}
          as="h2"
          className="font-heading text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-8 max-w-4xl mx-auto"
        />

        <p
          className={`text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          {t('cta_final.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          {/* Primary CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            }}
          >
            {/* Shine effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                animation: 'shine-btn 2s ease-in-out infinite',
              }}
            />
            <MessageCircle className="w-6 h-6 mr-3 relative z-10" />
            <span className="relative z-10">{t('cta_final.cta')}</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
          </a>


        </div>


      </div>

      <style>{`
        @keyframes grid-move {
          0% { transform: perspective(1000px) rotateX(75deg) translateY(0) translateZ(-100px); }
          100% { transform: perspective(1000px) rotateX(75deg) translateY(80px) translateZ(-100px); }
        }
        @keyframes float-slow {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4%, 6%) scale(1.08); }
          100% { transform: translate(-3%, -2%) scale(0.95); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes shine-btn {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
};

export default CTAFinalSection;
