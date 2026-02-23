import React from 'react';
import { ProjectLayout } from '@/components/layout';
import { HeroFullscreen, AnimatedText } from '@/components/effects';
import { ProjectSection } from '@/components/ui/ProjectSection';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { GlowCard } from '@/components/ui/GlowCard';
import { MessageCircle, Users, MessageSquare, Heart, Share2, Sparkles, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const THEME_COLOR = '#B388FF';
const THEME_COLOR_LIGHT = '#D1C4FF';



export const GankPage: React.FC = () => {
  const { t } = useTranslation('projetos');
  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('gank.whatsapp.message'))}`;

  const steps = [
    {
      icon: Users,
      title: t('gank.steps.1.title'),
      description: t('gank.steps.1.description'),
    },
    {
      icon: Share2,
      title: t('gank.steps.2.title'),
      description: t('gank.steps.2.description'),
    },
    {
      icon: MessageSquare,
      title: t('gank.steps.3.title'),
      description: t('gank.steps.3.description'),
    },
    {
      icon: Heart,
      title: t('gank.steps.4.title'),
      description: t('gank.steps.4.description'),
    },
    {
      icon: Users,
      title: t('gank.steps.5.title'),
      description: t('gank.steps.5.description'),
    },
  ];

  const testimonials = [
    {
      quote: t('gank.testimonials.1.quote'),
      author: t('gank.testimonials.1.author'),
    },
    {
      quote: t('gank.testimonials.2.quote'),
      author: t('gank.testimonials.2.author'),
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
        backgroundImage="/images/projeto-gank.jpg"
        backgroundVideo="/videos/gank.webm"
        title={t('gank.hero.title')}
        highlightWords={[t('gank.hero.highlightWord')]}
        highlightClassName="text-gradient-gank"
        subtitle={t('gank.hero.subtitle')}
        accentColor={THEME_COLOR}
        particleColor={THEME_COLOR}
        particleDirection="random"
        specialEffect="scanlines"
        overlayTint={`linear-gradient(
          to bottom,
          rgba(13, 13, 13, 0.6) 0%,
          rgba(179, 136, 255, 0.1) 30%,
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
              background: `linear-gradient(135deg, ${THEME_COLOR}, #7C4DFF)`,
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
            <span className="relative z-10">{t('gank.hero.cta')}</span>
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
                <span className="text-sm font-medium" style={{ color: THEME_COLOR }}>{t('gank.about.badge')}</span>
              </div>

              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
                {t('gank.about.titlePrefix')} <span style={{ color: THEME_COLOR }}>{t('gank.about.titleHighlight')}</span>{t('gank.about.titleSuffix')}
              </h2>
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-4xl mx-auto">
                {t('gank.about.paragraphPrefix')}
                <span className="font-semibold" style={{ color: THEME_COLOR }}>{t('gank.about.paragraphHighlight')}</span>
                {t('gank.about.paragraphSuffix')}
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
              text={t('gank.how.title')}
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold text-white mb-6"
            />
            <p className="text-xl text-white/70">{t('gank.how.subtitle')}</p>
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

      {/* Testemunhos - Glow Cards */}
      <section className="py-24 md:py-32 lg:py-40 px-4">
        <div className="container-custom">
          <div className="text-center mb-12">
            <AnimatedText
              text={t('gank.testimonialsTitle')}
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold text-white mb-6"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <GlowCard
                key={index}
                glowColor={`${THEME_COLOR}30`}
                borderColor={`${THEME_COLOR}20`}
              >
                <div className="p-6">
                  <Quote className="w-8 h-8 mb-4" style={{ color: `${THEME_COLOR}50` }} />
                  <p className="text-xl text-white/80 italic mb-6 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <p className="font-medium" style={{ color: THEME_COLOR }}>
                    {testimonial.author}
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
                {t('gank.finalCta.titlePrefix')} <span style={{ color: THEME_COLOR }}>{t('gank.finalCta.titleHighlight')}</span>{t('gank.finalCta.titleSuffix')}
              </h2>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-10 py-5 rounded-xl font-heading font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${THEME_COLOR}, #7C4DFF)`,
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
                <span className="relative z-10">{t('gank.finalCta.button')}</span>
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

export default GankPage;
