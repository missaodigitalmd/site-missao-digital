import React, { useState, useEffect } from 'react';
import { Section } from '@/components/layout';
import { AnimatedText, AnimatedCounter } from '@/components/effects';
import { useScrollReveal } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { Gamepad2, Users, Globe, Target } from 'lucide-react';

export const CampoSection: React.FC = () => {
  const { t } = useTranslation('home');

  const stats = [
    { value: parseFloat(t('stats.gamers_val').replace(',', '.').replace('B', '')), suffix: 'B', label: t('stats.gamers_label'), icon: Users },
    { value: parseFloat(t('stats.brasileiros_val').replace(',', '.').replace('%', '')), suffix: '%', label: t('stats.brasileiros_label'), icon: Gamepad2 },
    { value: parseInt(t('stats.jovens_val').replace('K+', '').replace('K', '')), suffix: 'K+', label: t('stats.jovens_label'), icon: Target },
  ];
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [sectionRef, isVisible] = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Section
      id="campo"
      className="relative overflow-hidden"
      ref={sectionRef}
      topFade
      bottomFade
      imageSrc="/images/campo-digital.jpg"
      overlayOpacity={0.85}
      parallax
      fullWidthContent={
        <div className="absolute inset-0 z-0">
          {/* Gradient orb following mouse */}
          <div
            className="absolute w-[800px] h-[800px] rounded-full opacity-30 transition-all duration-1000 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(255, 172, 19, 0.2) 0%, transparent 60%)',
              left: `${mousePosition.x * 100}%`,
              top: `${mousePosition.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 172, 19, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 172, 19, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Floating orbs */}
          <div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(255, 172, 19, 0.4) 0%, transparent 70%)',
              filter: 'blur(40px)',
              animation: 'float-orb 10s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(224, 64, 251, 0.3) 0%, transparent 70%)',
              filter: 'blur(30px)',
              animation: 'float-orb 8s ease-in-out infinite reverse',
            }}
          />

          {/* Additional Gradient overlay to match original design */}
          <div className="absolute inset-0 bg-gradient-to-b from-surface-primary/60 via-transparent to-surface-primary/60" />
        </div>
      }
    >

      <div className="relative z-10">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-light/10 border border-brand-orange-light/20 mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <Globe className="w-4 h-4 text-brand-orange-light" />
          <span className="text-sm text-brand-orange-light font-medium">{t('campo.badge')}</span>
        </div>

        {/* Title */}
        <AnimatedText
          text={t('campo.title')}
          as="h2"
          className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 max-w-3xl"
        />

        {/* Text */}
        <div className="max-w-2xl mb-10">
          <p
            className={`text-lg text-white/70 leading-relaxed mb-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            {t('campo.text_1_intro', { defaultValue: 'Enquanto debatemos se o digital é bom ou ruim,' })}{' '}
            <span className="text-brand-orange-light font-semibold">{t('campo.text_1_highlight')}</span>{' '}
            {t('campo.text_1_rest')}
          </p>
          <p
            className={`text-lg text-white/70 leading-relaxed transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            {t('campo.text_2')}
          </p>
        </div>

        {/* Highlight Quote with glow effect */}
        <div
          className={`relative pl-6 py-4 mb-12 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          {/* Glow line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-brand-orange-light via-brand-orange-light to-transparent" />
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-brand-orange-light blur-sm"
            style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
          />
          <p className="text-xl md:text-2xl font-heading font-semibold text-white italic">
            &ldquo;{t('campo.quote')}&rdquo;
          </p>
        </div>

        {/* Stats with enhanced cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              style={{ transitionDelay: `${500 + index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-brand-orange-light/20 to-brand-magenta/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

              <div className="relative glass-card rounded-2xl p-6 hover:border-brand-orange-light/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-orange-light/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-orange-light/20 transition-all duration-300">
                    <stat.icon className="w-6 h-6 text-brand-orange-light" />
                  </div>
                </div>
                <div className="font-display text-4xl md:text-5xl font-bold text-gradient-brand mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2500} />
                </div>
                <p className="text-white/60 text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </Section>
  );
};

export default CampoSection;
