import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout';
import { AnimatedText } from '@/components/effects';
import { useRouter } from '@/router';
import { ArrowRight, Sparkles, Trophy, Radio, Gamepad2 } from 'lucide-react';

export const ProjetosSection: React.FC = () => {
  const { t } = useTranslation('home');
  const { navigate } = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const projetos = [
    {
      id: 'daod',
      title: t('projetos.daod_title'),
      subtitle: t('projetos.daod_subtitle'),
      description: t('projetos.daod_desc'),
      image: '/images/projeto-daod.jpg',
      video: '/videos/card-daod.webm',
      color: '#E040FB',
      glowColor: 'rgba(224, 64, 251, 0.4)',
      route: 'projetos/daod' as const,
      icon: Gamepad2,
    },
    {
      id: 'gank',
      title: t('projetos.gank_title'),
      subtitle: t('projetos.gank_subtitle'),
      description: t('projetos.gank_desc'),
      image: '/images/projeto-gank.jpg',
      video: '/videos/card-gank.webm',
      color: '#B388FF',
      glowColor: 'rgba(179, 136, 255, 0.4)',
      route: 'projetos/gank' as const,
      icon: Radio,
    },
    {
      id: 'ninive',
      title: t('projetos.ninive_title'),
      subtitle: t('projetos.ninive_subtitle'),
      description: t('projetos.ninive_desc'),
      image: '/images/projeto-ninive.jpg',
      video: '/videos/card-ninive.webm',
      color: '#FFD740',
      glowColor: 'rgba(255, 215, 64, 0.4)',
      route: 'projetos/ninive-digital' as const,
      icon: Sparkles,
    },
    {
      id: 'campeonato',
      title: t('projetos.campeonato_title'),
      subtitle: t('projetos.campeonato_subtitle'),
      description: t('projetos.campeonato_desc'),
      image: '/images/projeto-campeonato.jpg',
      video: '/videos/card-campeonato.webm',
      color: '#FF5252',
      glowColor: 'rgba(255, 82, 82, 0.4)',
      route: 'projetos/campeonatos-evangelisticos' as const,
      icon: Trophy,
    },
  ];

  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
    };
    ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'].forEach(event =>
      window.addEventListener(event, handleInteraction, { once: true })
    );
    return () => {
      ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'].forEach(event =>
        window.removeEventListener(event, handleInteraction)
      );
    };
  }, []);

  return (
    <Section
      id="projetos"
      className="relative overflow-hidden"
      style={{ clipPath: 'inset(0)' }}
      topFade
      bottomFade
      fullWidthContent={
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Base Background color for consistency */}
          <div className="absolute inset-0 bg-[#0D0D0D]" />

          {/* Grid pattern with movement */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 172, 19, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 172, 19, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              animation: 'grid-float 20s linear infinite',
            }}
          />

          {/* Main Brand Gradient Glows */}
          <div
            className="absolute top-[-10%] left-[-5%] w-[60%] h-[50%] opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 172, 19, 0.4) 0%, transparent 70%)',
              filter: 'blur(100px)',
              animation: 'float-slow 15s ease-in-out infinite alternate',
            }}
          />
          <div
            className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] opacity-15"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(254, 112, 3, 0.35) 0%, transparent 70%)',
              filter: 'blur(120px)',
              animation: 'float-slow 18s ease-in-out infinite alternate-reverse',
            }}
          />

          {/* Accent orbs */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5"
            style={{
              background: 'radial-gradient(circle at 70% 30%, rgba(224, 64, 251, 0.4) 0%, transparent 50%)',
              filter: 'blur(80px)',
            }}
          />

          <style>{`
            @keyframes grid-float {
              0% { background-position: 0 0; }
              100% { background-position: 40px 40px; }
            }
            @keyframes float-slow {
              0% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(3%, 5%) scale(1.05); }
              100% { transform: translate(-2%, -3%) scale(0.98); }
            }
          `}</style>
        </div>
      }
    >

      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <AnimatedText
          text={t('projetos.title')}
          as="h2"
          className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
        />
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          {t('projetos.subtitle')}
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12 relative z-10">
        {projetos.map((projeto, index) => (
          <div
            key={projeto.id}
            className="group relative"
            onMouseEnter={() => setHoveredId(projeto.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {/* Glow effect */}
            <div
              className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
              style={{ background: projeto.glowColor }}
            />

            <button
              onClick={() => navigate(projeto.route)}
              className="relative block w-full glass-card rounded-3xl group-hover:border-white/20 transition-all duration-500 text-left"
              data-cursor="pointer"
              data-project-color={projeto.color}
            >
              {/* Media Container */}
              <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-3xl">
                {/* Fallback Image */}
                <img
                  src={projeto.image}
                  alt={projeto.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 relative z-0"
                />

                {/* Video Overlay on Hover */}
                {hoveredId === projeto.id && hasInteracted && (
                  <div className="absolute inset-0 z-10">
                    <video
                      src={projeto.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Overlay gradient */}
                <div
                  className="absolute inset-0 transition-opacity duration-500 z-20"
                  style={{
                    background: `linear-gradient(to top, ${projeto.color}30, transparent 60%)`,
                    opacity: hoveredId === projeto.id ? 0.3 : 0.5,
                  }}
                />

                {/* Color badge - positioned at bottom left on mobile */}
                <div
                  className="absolute bottom-4 left-4 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 z-30"
                  style={{
                    backgroundColor: projeto.color,
                    color: projeto.id === 'ninive' ? '#0D0D0D' : '#fff',
                  }}
                >
                  <projeto.icon className="w-4 h-4" />
                  {projeto.subtitle}
                </div>

                {/* Hover overlay with icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{ backgroundColor: `${projeto.color}40` }}
                  >
                    <ArrowRight className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 relative">
                {/* Accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-0.5 transition-all duration-500"
                  style={{
                    background: `linear-gradient(to right, ${projeto.color}, transparent)`,
                    width: hoveredId === projeto.id ? '60%' : '30%',
                  }}
                />

                <h3
                  className="font-heading text-xl sm:text-2xl font-bold mb-2 transition-colors duration-300"
                  style={{ color: hoveredId === projeto.id ? projeto.color : '#fff' }}
                >
                  {projeto.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  {projeto.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium transition-all duration-300 group-hover:gap-3 flex items-center group-hover-line hover-line-base"
                    style={{ color: projeto.color }}
                  >
                    {t('projetos.conhecer')}
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center relative z-10">
        <button
          onClick={() => navigate('projetos')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/70 btn-shine transition-all"
          data-cursor="pointer"
        >
          {t('projetos.ver_todos')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </Section>
  );
};

export default ProjetosSection;
