import React, { useState, useEffect } from 'react';
import { Section } from '@/components/layout';
import { HeroStandard, TiltCard } from '@/components/effects';
import { useRouter } from '@/router';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

export const ProjetosPage: React.FC = () => {
  const { t } = useTranslation('projetos');
  const { navigate } = useRouter();
  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('listPage.whatsapp.message'))}`;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const projetos = [
    {
      id: 'daod',
      title: t('listPage.cards.daod.title'),
      subtitle: t('listPage.cards.daod.subtitle'),
      description: t('listPage.cards.daod.description'),
      cta: t('listPage.cards.daod.cta'),
      image: '/images/projeto-daod.jpg',
      video: '/videos/card-daod.webm',
      color: '#E040FB',
      glowColor: 'rgba(224, 64, 251, 0.25)',
      route: 'projetos/daod' as const,
    },
    {
      id: 'gank',
      title: t('listPage.cards.gank.title'),
      subtitle: t('listPage.cards.gank.subtitle'),
      description: t('listPage.cards.gank.description'),
      cta: t('listPage.cards.gank.cta'),
      image: '/images/projeto-gank.jpg',
      video: '/videos/card-gank.webm',
      color: '#B388FF',
      glowColor: 'rgba(179, 136, 255, 0.25)',
      route: 'projetos/gank' as const,
    },
    {
      id: 'ninive',
      title: t('listPage.cards.ninive.title'),
      subtitle: t('listPage.cards.ninive.subtitle'),
      description: t('listPage.cards.ninive.description'),
      cta: t('listPage.cards.ninive.cta'),
      image: '/images/projeto-ninive.jpg',
      video: '/videos/card-ninive.webm',
      color: '#FFD740',
      glowColor: 'rgba(255, 215, 64, 0.25)',
      route: 'projetos/ninive-digital' as const,
    },
    {
      id: 'campeonato',
      title: t('listPage.cards.campeonato.title'),
      subtitle: t('listPage.cards.campeonato.subtitle'),
      description: t('listPage.cards.campeonato.description'),
      cta: t('listPage.cards.campeonato.cta'),
      image: '/images/projeto-campeonato.jpg',
      video: '/videos/card-campeonato.webm',
      color: '#FF5252',
      glowColor: 'rgba(255, 82, 82, 0.25)',
      route: 'projetos/campeonatos-evangelisticos' as const,
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
    <div className="min-h-screen bg-surface-primary">
      {/* Hero */}
      <HeroStandard
        title={t('listPage.hero.title')}
        highlightWords={[t('listPage.hero.highlightWord1'), t('listPage.hero.highlightWord2')]}
        highlightClassName="text-gradient-brand"
        subtitle={t('listPage.hero.subtitle')}
        accentColor={THEME_COLOR}
        particleColor={THEME_COLOR}
        variant="digital"
      />

      {/* Lógica Section */}
      <Section className="relative z-10 bg-surface-primary" imageSrc="/images/hero-bg.jpg" overlayOpacity={0.9}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            {t('listPage.logic.title')}
          </h2>
          <p className="text-xl text-white/80 leading-relaxed">
            {t('listPage.logic.preamble')} <span className="text-brand-orange-light">{t('listPage.logic.pillar1')}</span> {t('listPage.logic.connector1')}
            <span className="text-brand-orange-light"> {t('listPage.logic.pillar2')}</span> {t('listPage.logic.connector2')} <span className="text-brand-orange-light">{t('listPage.logic.pillar3')}</span> {t('listPage.logic.ending')}
          </p>
        </div>
      </Section>

      {/* Projects Grid */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {projetos.map((projeto) => (
            <TiltCard
              key={projeto.id}
              intensity={6}
              glowColor={projeto.glowColor}
              className="h-full"
            >
              <button
                onClick={() => navigate(projeto.route)}
                onMouseEnter={() => setHoveredId(projeto.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="block w-full glass-card rounded-2xl group h-full text-left"
                data-cursor="pointer"
                data-project-color={projeto.color}
              >
                {/* Media Container */}
                <div className="relative h-56 overflow-hidden">
                  {/* Fallback Image */}
                  <img
                    src={projeto.image}
                    alt={projeto.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 relative z-0"
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

                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent z-20" />

                  {/* Color badge */}
                  <div
                    className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold text-surface-primary z-30"
                    style={{ backgroundColor: projeto.color }}
                  >
                    {projeto.subtitle}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className="font-heading text-3xl font-bold mb-3"
                    style={{ color: projeto.color }}
                  >
                    {projeto.title}
                  </h3>
                  <p className="text-white/70 text-lg leading-relaxed mb-6">
                    {projeto.description}
                  </p>
                  <span
                    className="inline-flex items-center text-base font-medium transition-colors group-hover:opacity-80"
                    style={{ color: projeto.color }}
                  >
                    {projeto.cta}
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            </TiltCard>
          ))}
        </div>
      </Section>

      {/* Sob Medida Section */}
      <Section imageSrc="/images/imersao-missao.jpg" overlayOpacity={0.88}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            {t('listPage.immersiveCta.title')}
          </h2>
          <p className="text-xl text-white/80 leading-relaxed mb-6">
            {t('listPage.immersiveCta.paragraph1')}
          </p>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            {t('listPage.immersiveCta.paragraph2')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate('imersao-missionaria')}
              className="btn-primary text-lg px-10 py-5"
              data-cursor="pointer"
            >
              {t('listPage.immersiveCta.primaryButton')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-10 py-5"
              data-cursor="pointer"
            >
              {t('listPage.immersiveCta.secondaryButton')}
            </a>
          </div>
        </div>
      </Section>

      {/* CTA Final */}
      <section className="py-24 md:py-32 lg:py-40 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at center, ${THEME_COLOR}33 0%, transparent 70%)`,
          }}
        />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-8">
              {t('listPage.finalCta.title')}
            </h2>
            <p className="text-xl md:text-2xl text-white/70 mb-12">
              {t('listPage.finalCta.subtitle')}
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-12 py-6"
              data-cursor="pointer"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              {t('listPage.finalCta.button')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjetosPage;
