import React from 'react';
import { ProjectLayout } from '@/components/layout';
import { HeroFullscreen, AnimatedText } from '@/components/effects';
import { ProjectSection } from '@/components/ui/ProjectSection';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { GlowCard } from '@/components/ui/GlowCard';
import { MessageCircle, Users, BookOpen, Heart, Church, Sparkles, Target, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const THEME_COLOR = '#E040FB';
const THEME_COLOR_LIGHT = '#F3A5FF';



export const DaoDPage: React.FC = () => {
  const { t } = useTranslation('projetos');
  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('daod.whatsapp.message'))}`;

  const steps = [
    {
      icon: Church,
      title: t('daod.steps.1.title'),
      description: t('daod.steps.1.description'),
    },
    {
      icon: BookOpen,
      title: t('daod.steps.2.title'),
      description: t('daod.steps.2.description'),
    },
    {
      icon: Users,
      title: t('daod.steps.3.title'),
      description: t('daod.steps.3.description'),
    },
    {
      icon: Heart,
      title: t('daod.steps.4.title'),
      description: t('daod.steps.4.description'),
    },
  ];

  const reasons = [
    {
      icon: Target,
      title: t('daod.reasons.1.title'),
      description: t('daod.reasons.1.description'),
    },
    {
      icon: Users,
      title: t('daod.reasons.2.title'),
      description: t('daod.reasons.2.description'),
    },
    {
      icon: Zap,
      title: t('daod.reasons.3.title'),
      description: t('daod.reasons.3.description'),
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
      {/* Hero Fullscreen */}
      <HeroFullscreen
        backgroundImage="/images/projeto-daod.jpg"
        backgroundVideo="/videos/daod.webm"
        title={t('daod.hero.title')}
        highlightWords={[t('daod.hero.highlightWord')]}
        highlightClassName="text-gradient-daod"
        subtitle={t('daod.hero.subtitle')}
        accentColor={THEME_COLOR}
        particleColor={THEME_COLOR}
        particleDirection="random"
        overlayTint={`linear-gradient(
          to bottom,
          rgba(13, 13, 13, 0.6) 0%,
          rgba(224, 64, 251, 0.1) 30%,
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
              background: `linear-gradient(135deg, ${THEME_COLOR}, #AB47BC)`,
              color: '#fff',
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                animation: 'shine 2s ease-in-out infinite',
              }}
            />
            <MessageCircle className="w-5 h-5 mr-2 relative z-10" />
            <span className="relative z-10">{t('daod.hero.cta')}</span>
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
                <span className="text-sm font-medium" style={{ color: THEME_COLOR }}>{t('daod.about.badge')}</span>
              </div>

              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
                {t('daod.about.titlePrefix')} <span style={{ color: THEME_COLOR }}>{t('daod.about.titleHighlight')}</span>{t('daod.about.titleSuffix')}
              </h2>
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-4xl mx-auto">
                {t('daod.about.paragraphPrefix')}
                <span className="font-semibold" style={{ color: THEME_COLOR }}>{t('daod.about.paragraphHighlight')}</span>
                {t('daod.about.paragraphSuffix')}
              </p>
            </div>
          </ProjectSection>
        </div>
      </section>

      {/* Como Funciona - Feature Cards */}
      <section className="py-24 md:py-32 lg:py-40 px-4 relative overflow-hidden">
        {/* Background image layer */}
        <div className="absolute inset-0 z-0">
          <img src="/images/campo-digital.jpg" alt="" aria-hidden="true" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 z-[1]" style={{ background: 'rgba(13, 13, 13, 0.92)' }} />
        <div className="absolute inset-0 z-[2]" style={{ background: `linear-gradient(135deg, ${THEME_COLOR}06 0%, transparent 60%)` }} />
        <div className="container-custom relative z-[5]">
          <div className="text-center mb-16">
            <AnimatedText
              text={t('daod.how.title')}
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold text-white mb-6"
            />
            <p className="text-xl text-white/70">{t('daod.how.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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

          {/* Connector line - desktop only */}
          <div className="hidden lg:block relative h-4 mt-8">
            <div
              className="absolute left-[12%] right-[12%] h-0.5 top-1/2 -translate-y-1/2"
              style={{
                background: `linear-gradient(90deg, transparent, ${THEME_COLOR}60, ${THEME_COLOR}, ${THEME_COLOR}60, transparent)`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Por que funciona - Glow Cards */}
      <section className="py-24 md:py-32 lg:py-40 px-4">
        <div className="container-custom">
          <div className="text-center mb-12">
            <AnimatedText
              text={t('daod.why.title')}
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold text-white mb-6"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reasons.map((reason, index) => (
              <GlowCard
                key={index}
                glowColor={`${THEME_COLOR}30`}
                borderColor={`${THEME_COLOR}20`}
              >
                <div className="p-6 text-center">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: `${THEME_COLOR}15` }}
                  >
                    <reason.icon className="w-8 h-8" style={{ color: THEME_COLOR }} />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-white mb-3">
                    {reason.title}
                  </h3>
                  <p className="text-lg text-white/70 leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </GlowCard>
            ))}
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
                {t('daod.finalCta.titlePrefix')} <span style={{ color: THEME_COLOR }}>{t('daod.finalCta.titleHighlight')}</span>{t('daod.finalCta.titleSuffix')}
              </h2>
              <p className="text-xl md:text-2xl text-white/70 mb-10">
                {t('daod.finalCta.subtitle')}
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-10 py-5 rounded-xl font-heading font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${THEME_COLOR}, #AB47BC)`,
                  color: '#fff',
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                    animation: 'shine 2s ease-in-out infinite',
                  }}
                />
                <MessageCircle className="w-6 h-6 mr-3 relative z-10" />
                <span className="relative z-10">{t('daod.finalCta.button')}</span>
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

export default DaoDPage;
