import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout';
import { AnimatedText } from '@/components/effects';
import { useScrollReveal } from '@/hooks';
import { Eye, Wrench, Users, ArrowRight, Sparkles } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';

export const MissaoSection: React.FC = () => {
  const { t } = useTranslation('home');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [sectionRef, isVisible] = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  const pilares = [
    {
      icon: Eye,
      title: t('missao.step_1_title'),
      description: t('missao.step_1_desc'),
      color: THEME_COLOR,
      gradient: `from-[#FF9100] to-[#FFD740]`,
    },
    {
      icon: Wrench,
      title: t('missao.step_2_title'),
      description: t('missao.step_2_desc'),
      color: '#E040FB',
      gradient: 'from-[#E040FB] to-[#B388FF]',
    },
    {
      icon: Users,
      title: t('missao.step_3_title'),
      description: t('missao.step_3_desc'),
      color: '#00E5FF',
      gradient: 'from-[#00E5FF] to-[#2979FF]',
    },
  ];

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
    <Section id="quem-somos" imageSrc="/images/familia.webp" overlayOpacity={0.88} gradientTint="linear-gradient(135deg, rgba(255,172,19,0.04) 0%, transparent 60%)" ref={sectionRef} topFade bottomFade parallax>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-brand-orange-light/20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float-particle ${4 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        {/* Gradient orb */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(255, 172, 19, 0.3) 0%, transparent 60%)',
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image with enhanced effects */}
          <div
            className={`relative order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
          >
            {/* Main image container */}
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/images/familia.webp"
                alt={t('missao.family_label')}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-primary/80 via-transparent to-transparent" />

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
                    transform: 'translateX(-100%)',
                    animation: 'shine 3s ease-in-out infinite',
                  }}
                />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 border-2 border-brand-orange-light/20 rounded-2xl -z-10" />
            <div className="absolute -top-4 -left-4 w-24 h-24 border border-brand-magenta/20 rounded-full -z-10" />

            {/* Floating badge */}
            <div
              className="absolute -bottom-4 left-8 bg-surface-card border border-white/10 rounded-xl px-4 py-3 shadow-xl"
              style={{ animation: 'float-badge 3s ease-in-out infinite' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange-light/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-orange-light" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t('missao.family_label')}</p>
                  <p className="text-white/50 text-xs">{t('missao.since')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-light/10 border border-brand-orange-light/20 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <span className="text-sm text-brand-orange-light font-medium">{t('missao.badge')}</span>
            </div>

            <AnimatedText
              text={t('missao.title')}
              as="h2"
              className="font-heading text-3xl md:text-4xl font-bold text-white mb-6"
            />

            <p
              className={`text-lg text-white/70 leading-relaxed mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              {t('missao.description')}
            </p>

            {/* Pilares with enhanced cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {pilares.map((pilar, index) => (
                <div
                  key={index}
                  className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Glow effect */}
                  <div
                    className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"
                    style={{ background: `linear-gradient(135deg, ${pilar.color}40, transparent)` }}
                  />

                  <div className="relative glass-card rounded-xl p-5 h-full hover:border-white/15 transition-all duration-300 overflow-hidden">
                    {/* Accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
                      style={{
                        background: `linear-gradient(to right, ${pilar.color}, transparent)`,
                        opacity: hoveredIndex === index ? 1 : 0.3,
                      }}
                    />

                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${pilar.color}15` }}
                    >
                      <pilar.icon
                        className="w-6 h-6 transition-all duration-300"
                        style={{ color: pilar.color }}
                      />
                    </div>
                    <h3 className="font-heading font-semibold text-white mb-2 group-hover:text-brand-orange-light transition-colors">
                      {pilar.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed">{pilar.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="/quem-somos"
              className={`inline-flex items-center text-brand-orange-light hover:text-white transition-all duration-300 font-medium group transition-all duration-700 delay-700 hover-line hover-line-base ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              {t('missao.cta')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </Section>
  );
};

export default MissaoSection;
