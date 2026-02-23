import React from 'react';
import { ProjectLayout } from '@/components/layout';
import { HeroFullscreen, AnimatedText } from '@/components/effects';
import { ProjectSection } from '@/components/ui/ProjectSection';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { GlowCard } from '@/components/ui/GlowCard';
import { MessageCircle, Users, Gamepad2, Church, Heart, BookOpen, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const THEME_COLOR = '#FFD740';
const THEME_COLOR_LIGHT = '#FFECB3';



import { SEOBox } from '@/components/seo/SEOBox';

export const NinivePage: React.FC = () => {
  const { t } = useTranslation('projetos');
  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('ninive.whatsapp.message'))}`;

  const steps = [
    {
      icon: Users,
      title: t('ninive.steps.1.title'),
      description: t('ninive.steps.1.description'),
    },
    {
      icon: Gamepad2,
      title: t('ninive.steps.2.title'),
      description: t('ninive.steps.2.description'),
    },
    {
      icon: MessageCircle,
      title: t('ninive.steps.3.title'),
      description: t('ninive.steps.3.description'),
    },
    {
      icon: Church,
      title: t('ninive.steps.4.title'),
      description: t('ninive.steps.4.description'),
    },
    {
      icon: Heart,
      title: t('ninive.steps.5.title'),
      description: t('ninive.steps.5.description'),
    },
  ];

  const scrollToContent = () => {
    const element = document.getElementById('oque');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ProjectLayout themeColor={THEME_COLOR} themeColorLight={THEME_COLOR_LIGHT}>
      <SEOBox
        title={t('seo.ninive.title')}
        description={t('seo.ninive.description')}
        url="https://missaodigitalmd.com/projetos/ninive-digital"
      />
      {/* Hero Fullscreen */}
      <HeroFullscreen
        backgroundImage="/images/projeto-ninive.jpg"
        backgroundVideo="/videos/ninive.webm"
        title={t('ninive.hero.title')}
        highlightWords={[t('ninive.hero.highlightWord')]}
        highlightClassName="text-gradient-ninive"
        subtitle={t('ninive.hero.subtitle')}
        accentColor={THEME_COLOR}
        particleColor={THEME_COLOR}
        particleDirection="up"
        overlayTint={`linear-gradient(
          to bottom,
          rgba(13, 13, 13, 0.6) 0%,
          rgba(255, 215, 64, 0.08) 30%,
          rgba(13, 13, 13, 0.5) 60%,
          rgba(13, 13, 13, 0.95) 100%
        )`}
        onScrollDown={scrollToContent}
        cta={
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-heading font-bold text-sm overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${THEME_COLOR}, #FFC107)`,
              color: '#0D0D0D',
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
                animation: 'shine 2s ease-in-out infinite',
              }}
            />
            <MessageCircle className="w-5 h-5 mr-2 relative z-10" />
            <span className="relative z-10">{t('ninive.hero.cta')}</span>
          </a>
        }
      />

      {/* O que é - Glass Section */}
      <section id="oque" className="py-24 md:py-32 lg:py-40 px-4">
        <div className="container-custom max-w-4xl">
          <ProjectSection accentColor={THEME_COLOR}>
            <div className="text-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: `${THEME_COLOR}15`, border: `1px solid ${THEME_COLOR}30` }}
              >
                <Sparkles className="w-4 h-4" style={{ color: THEME_COLOR }} />
                <span className="text-sm font-medium" style={{ color: THEME_COLOR }}>{t('ninive.about.badge')}</span>
              </div>

              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
                {t('ninive.about.titlePrefix')} <span style={{ color: THEME_COLOR }}>{t('ninive.about.titleHighlight')}</span>{t('ninive.about.titleSuffix')}
              </h2>
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-4xl mx-auto">
                {t('ninive.about.paragraphPrefix')}
                <span className="font-semibold" style={{ color: THEME_COLOR }}>{t('ninive.about.paragraphHighlight')}</span>
                {t('ninive.about.paragraphSuffix')}
              </p>
            </div>
          </ProjectSection>
        </div>
      </section>

      {/* Como Funciona - Feature Cards */}
      <section className="py-24 md:py-32 lg:py-40 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/campo-digital.jpg" alt="" aria-hidden="true" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 z-[1]" style={{ background: 'rgba(13, 13, 13, 0.92)' }} />
        <div className="absolute inset-0 z-[2]" style={{ background: `linear-gradient(135deg, ${THEME_COLOR}06 0%, transparent 60%)` }} />
        <div className="container-custom relative z-[5]">
          <div className="text-center mb-16">
            <AnimatedText
              text={t('ninive.how.title')}
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold text-white mb-6"
            />
            <p className="text-xl text-white/70">{t('ninive.how.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <FeatureCard
                key={index}
                icon={step.icon}
                title={step.title}
                description={step.description}
                accentColor={THEME_COLOR}
                stepNumber={index + 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Conexão Bíblica - Two Column */}
      <section className="py-24 md:py-32 lg:py-40 px-4">
        <div className="container-custom max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <ProjectSection accentColor={THEME_COLOR}>
              <div className="flex items-center gap-4 mb-6">
                <BookOpen className="w-10 h-10" style={{ color: THEME_COLOR }} />
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  {t('ninive.bible.title')}
                </h2>
              </div>

              <div className="space-y-6 text-xl text-white/80 leading-relaxed">
                <p>
                  {t('ninive.bible.paragraph1')}
                </p>
                <p>
                  {t('ninive.bible.paragraph2')}
                </p>
                <p className="font-semibold text-2xl" style={{ color: THEME_COLOR }}>
                  {t('ninive.bible.paragraph3')}
                </p>
              </div>
            </ProjectSection>

            <GlowCard
              glowColor={`${THEME_COLOR}30`}
              borderColor={`${THEME_COLOR}20`}
            >
              <div className="p-8">
                <blockquote className="text-2xl text-white/90 italic leading-relaxed">
                  &ldquo;{t('ninive.bible.quote.text')}&rdquo;
                </blockquote>
                <cite className="block mt-4 not-italic font-medium" style={{ color: THEME_COLOR }}>
                  {t('ninive.bible.quote.reference')}
                </cite>
              </div>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* CTA Final - Immersive */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, ${THEME_COLOR}15 0%, transparent 60%)`,
          }}
        />
        <div className="container-custom relative z-10">
          <GlowCard
            glowColor={`${THEME_COLOR}40`}
            borderColor={`${THEME_COLOR}30`}
            className="max-w-3xl mx-auto"
          >
            <div className="p-8 md:p-12 text-center">
              <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-10">
                {t('ninive.finalCta.titlePrefix')} <span style={{ color: THEME_COLOR }}>{t('ninive.finalCta.titleHighlight')}</span>{t('ninive.finalCta.titleSuffix')}
              </h2>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-10 py-5 rounded-xl font-heading font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${THEME_COLOR}, #FFC107)`,
                  color: '#0D0D0D',
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
                    animation: 'shine 2s ease-in-out infinite',
                  }}
                />
                <MessageCircle className="w-6 h-6 mr-3 relative z-10" />
                <span className="relative z-10">{t('ninive.finalCta.button')}</span>
              </a>
            </div>
          </GlowCard>
        </div>
      </section>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </ProjectLayout>
  );
};

export default NinivePage;
