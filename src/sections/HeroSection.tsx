import React, { useEffect, useRef, useState } from 'react';
import { ParticleField, AnimatedText, ScrollIndicator } from '@/components/effects';
import { MessageCircle, ChevronRight, Play, Users, Gamepad2, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { THEME_COLOR } from '@/constants/theme';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation('home');
  const scrollToProjects = () => {
    const element = document.querySelector('#projetos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('hero.whatsapp_message'))}`;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'].forEach(event =>
      window.addEventListener(event, handleInteraction, { once: true })
    );

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'].forEach(event =>
        window.removeEventListener(event, handleInteraction)
      );
    };
  }, [hasInteracted]);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen min-h-[100dvh] w-full flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background Layers */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255, 172, 19, 0.15) 0%, transparent 50%)`,
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 172, 19, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 172, 19, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255, 172, 19, 0.4) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(254, 112, 3, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Background Media with Parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{
          transform: `translate(${(mousePosition.x - 0.5) * -20}px, ${(mousePosition.y - 0.5) * -20}px) scale(1.1)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Cover Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: 'url(/images/hero-cover.jpg)',
            opacity: videoLoaded ? 0 : 1
          }}
        />

        {/* Video Player */}
        {hasInteracted && (
          <video
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            src="/videos/hero.webm"
            autoPlay
            loop
            muted
            playsInline
            onCanPlay={() => setVideoLoaded(true)}
            style={{ opacity: videoLoaded ? 1 : 0 }}
          />
        )}
      </div>

      {/* Overlay with gradient */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `
            linear-gradient(to bottom, rgba(13, 13, 13, 0.85) 0%, rgba(13, 13, 13, 0.5) 40%, rgba(13, 13, 13, 0.7) 70%, rgba(13, 13, 13, 0.98) 100%),
            linear-gradient(135deg, rgba(255, 172, 19, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Particles */}
      <ParticleField
        count={40}
        color={THEME_COLOR}
        repulsion={true}
        className="z-20"
      />

      {/* Content */}
      <div className="relative z-30 container-custom text-center pt-24 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            style={{
              opacity: 0,
              animation: 'fade-in 0.6s ease-out 0.2s forwards',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-brand-orange-light animate-pulse" />
            <span className="text-sm text-white/70">{t('badge')}</span>
          </div>

          {/* Title */}
          <AnimatedText
            text={t('hero.title')}
            as="h1"
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8"
            highlightWords={t('hero.highlight_words').split(',')}
            highlightClassName="text-gradient-brand"
            delay={0.3}
            staggerDelay={0.06}
          />

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-white/70 font-body mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{
              opacity: 0,
              animation: 'fade-in 0.6s ease-out 1.2s forwards',
            }}
          >
            {t('hero.subtitle')}
          </p>

          {/* Stats Row */}
          <div
            className="flex flex-wrap justify-center gap-8 mb-12"
            style={{
              opacity: 0,
              animation: 'fade-in 0.6s ease-out 1.4s forwards',
            }}
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
              <Users className="w-5 h-5 text-brand-orange-light" />
              <div className="text-left">
                <span className="block text-2xl font-bold text-white">{t('stats.gamers_val')}</span>
                <span className="text-xs text-white/50">{t('stats.gamers_label')}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
              <Gamepad2 className="w-5 h-5 text-brand-orange-light" />
              <div className="text-left">
                <span className="block text-2xl font-bold text-white">{t('stats.brasileiros_val')}</span>
                <span className="text-xs text-white/50 leading-tight">{t('stats.brasileiros_label')}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
              <Target className="w-5 h-5 text-brand-orange-light" />
              <div className="text-left">
                <span className="block text-2xl font-bold text-white">{t('stats.jovens_val')}</span>
                <span className="text-xs text-white/50">{t('stats.jovens_label')}</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{
              opacity: 0,
              animation: 'fade-in 0.6s ease-out 1.6s forwards',
            }}
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center btn-glow-border hover:scale-105 transition-transform duration-300"
            >
              <div
                className="btn-content-inner px-8 py-4 font-heading font-bold text-sm"
                style={{
                  background: `linear-gradient(135deg, ${THEME_COLOR}, #FE7003)`,
                  color: '#0D0D0D',
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                    animation: 'shine 2s ease-in-out infinite',
                  }}
                />
                <MessageCircle className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">{t('hero.cta_primary')}</span>
              </div>
            </a>

            <button
              onClick={scrollToProjects}
              className="group inline-flex items-center justify-center px-8 py-4 rounded-xl font-heading font-bold text-sm border border-white/20 text-white btn-shine transition-all"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {t('hero.cta_secondary')}
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator onClick={scrollToProjects} />

      {/* Bottom gradient fade for smooth transition to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 md:h-48 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0D0D0D 0%, transparent 100%)',
        }}
      />
    </section>
  );
};

export default HeroSection;
