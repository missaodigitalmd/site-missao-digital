import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout';
import { HeroStandard, AnimatedText } from '@/components/effects';
import { HeroFamilyComposition } from '@/components/hero/HeroFamilyComposition';
import { ProjectSection } from '@/components/ui/ProjectSection';
import { GlowCard } from '@/components/ui/GlowCard';
import { ShinyCard } from '@/components/ui/ShinyCard';
import { Eye, Wrench, Users, MessageCircle, BookOpen, Sparkles, Heart, Cross, Globe } from 'lucide-react';
import SpotlightReveal from '@/components/ui/SpotlightReveal';

import { THEME_COLOR } from '@/constants/theme';

import { SEOBox } from '@/components/seo/SEOBox';

export const QuemSomosPage: React.FC = () => {
  const { t } = useTranslation('quem-somos');
  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('cta.whatsapp_message'))}`;

  const pilares = [
    {
      icon: Eye,
      title: t('pilares.items.despertar.title'),
      description: t('pilares.items.despertar.description'),
    },
    {
      icon: Wrench,
      title: t('pilares.items.equipar.title'),
      description: t('pilares.items.equipar.description'),
    },
    {
      icon: Users,
      title: t('pilares.items.alcancar.title'),
      description: t('pilares.items.alcancar.description'),
    },
  ];

  const navarroTags = t('navarro.tags', { returnObjects: true }) as string[];
  const terezaTags = t('tereza.tags', { returnObjects: true }) as string[];

  const unifiedSectionRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (unifiedSectionRef.current) {
        const rect = unifiedSectionRef.current.getBoundingClientRect();
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
    <div className="min-h-screen bg-surface-primary">
      <SEOBox
        title={t('seo.title')}
        description={t('seo.description')}
        url="https://missaodigitalmd.com/quem-somos"
      />
      <HeroStandard
        title={t('hero.title')}
        highlightWords={t('hero.highlight_words').split(',')}
        highlightClassName="text-gradient-brand"
        subtitle={t('hero.subtitle')}
        accentColor={THEME_COLOR}
        particleColor={THEME_COLOR}
        variant="digital"
        rightContent={<HeroFamilyComposition />}
      />

      {/* Navarro Section */}
      <Section className="relative z-10 bg-surface-primary" imageSrc="/images/hero-bg.jpg" overlayOpacity={0.9}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Name header with decorative line */}
            <div className="flex items-center gap-4 mb-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${THEME_COLOR}25, ${THEME_COLOR}10)`, border: `1px solid ${THEME_COLOR}30` }}
              >
                <Cross className="w-7 h-7" style={{ color: THEME_COLOR }} />
              </div>
              <div>
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white">{t('navarro.name')}</h2>
                <div className="h-0.5 w-16 mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${THEME_COLOR}, transparent)` }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 ml-[4.5rem]">
              {navarroTags.map((tag, index) => (
                <span key={index} className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/60 border border-white/10">
                  {tag}
                </span>
              ))}
            </div>

            <div
              className="relative pl-8 py-6 pr-6 rounded-xl mb-10"
              style={{
                borderLeft: `3px solid ${THEME_COLOR}`,
                background: `linear-gradient(135deg, ${THEME_COLOR}0A, ${THEME_COLOR}03 50%, transparent)`,
              }}
            >
              <span
                className="absolute -top-3 left-4 font-heading text-6xl leading-none select-none pointer-events-none"
                style={{ color: `${THEME_COLOR}30` }}
              >
                &ldquo;
              </span>
              <p className="text-xl md:text-2xl text-white/85 italic leading-relaxed relative z-10">
                {t('navarro.quote.pre')}{' '}
                <span className="font-semibold not-italic" style={{ color: THEME_COLOR }}>{t('navarro.quote.highlight')}</span>
                , {t('navarro.quote.post')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-10">
              <div className="text-center py-3 px-2 rounded-xl" style={{ background: `${THEME_COLOR}08`, border: `1px solid ${THEME_COLOR}15` }}>
                <p className="font-heading text-2xl font-bold" style={{ color: THEME_COLOR }}>15+</p>
                <p className="text-xs text-white/50 mt-1">{t('navarro.stats.years_missions')}</p>
              </div>
              <div className="text-center py-3 px-2 rounded-xl" style={{ background: `${THEME_COLOR}08`, border: `1px solid ${THEME_COLOR}15` }}>
                <p className="font-heading text-2xl font-bold" style={{ color: THEME_COLOR }}>50+</p>
                <p className="text-xs text-white/50 mt-1">{t('navarro.stats.volunteers_led')}</p>
              </div>
              <div className="text-center py-3 px-2 rounded-xl" style={{ background: `${THEME_COLOR}08`, border: `1px solid ${THEME_COLOR}15` }}>
                <p className="font-heading text-2xl font-bold" style={{ color: THEME_COLOR }}>7</p>
                <p className="text-xs text-white/50 mt-1">{t('navarro.stats.full_time_missionaries')}</p>
              </div>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ background: `linear-gradient(to bottom, ${THEME_COLOR}40, ${THEME_COLOR}10)` }} />

              <div className="space-y-10">
                <div className="relative">
                  <div className="absolute -left-8 top-1 w-[7px] h-[7px] rounded-full" style={{ background: THEME_COLOR, boxShadow: `0 0 8px ${THEME_COLOR}60` }} />
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ background: `${THEME_COLOR}15`, color: THEME_COLOR, border: `1px solid ${THEME_COLOR}30` }}
                  >
                    {t('navarro.timeline.0.year')}
                  </span>
                  <p className="text-lg text-white/80 leading-relaxed">{t('navarro.timeline.0.text')}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-8 top-1 w-[7px] h-[7px] rounded-full" style={{ background: THEME_COLOR, boxShadow: `0 0 8px ${THEME_COLOR}60` }} />
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ background: `${THEME_COLOR}15`, color: THEME_COLOR, border: `1px solid ${THEME_COLOR}30` }}
                  >
                    {t('navarro.timeline.1.year')}
                  </span>
                  <p className="text-lg text-white/80 leading-relaxed">{t('navarro.timeline.1.text')}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[34px] top-0.5 w-[9px] h-[9px] rounded-full" style={{ background: THEME_COLOR, boxShadow: `0 0 12px ${THEME_COLOR}80` }} />
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                    style={{ background: `${THEME_COLOR}20`, color: THEME_COLOR, border: `1px solid ${THEME_COLOR}50` }}
                  >
                    {t('navarro.timeline.2.year')}
                  </span>
                  <p className="text-xl text-white/90 leading-relaxed font-medium">{t('navarro.timeline.2.text')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <SpotlightReveal
              frontImage="/images/navarro.webp"
              backImage="/images/navarrogamer.webp"
              alt={t('navarro.image_alt')}
              revealRadius={150}
              className="w-full max-w-[480px] mx-auto lg:ml-auto lg:mr-0"
            />
            <div
              className="absolute -inset-4 -z-10 rounded-3xl opacity-30"
              style={{
                background: `radial-gradient(circle, ${THEME_COLOR}40 0%, transparent 70%)`,
                filter: 'blur(30px)',
              }}
            />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-brand-orange-light/20 rounded-2xl -z-10" />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative">
            <SpotlightReveal
              frontImage="/images/tereza.webp"
              backImage="/images/terezagamer.webp"
              alt={t('tereza.image_alt')}
              revealRadius={150}
              className="w-full max-w-[480px] mx-auto lg:mr-auto lg:ml-0"
            />
            <div
              className="absolute -inset-4 -z-10 rounded-3xl opacity-30"
              style={{
                background: `radial-gradient(circle, ${THEME_COLOR}40 0%, transparent 70%)`,
                filter: 'blur(30px)',
              }}
            />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border-2 border-brand-orange-light/20 rounded-2xl -z-10" />
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-4 mb-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${THEME_COLOR}25, ${THEME_COLOR}10)`, border: `1px solid ${THEME_COLOR}30` }}
              >
                <Heart className="w-7 h-7" style={{ color: THEME_COLOR }} />
              </div>
              <div>
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white">{t('tereza.name')}</h2>
                <div className="h-0.5 w-16 mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${THEME_COLOR}, transparent)` }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 ml-[4.5rem]">
              {terezaTags.map((tag, index) => (
                <span key={index} className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/60 border border-white/10">
                  {tag}
                </span>
              ))}
            </div>

            <div
              className="relative pl-8 py-6 pr-6 rounded-xl mb-10"
              style={{
                borderLeft: `3px solid ${THEME_COLOR}`,
                background: `linear-gradient(135deg, ${THEME_COLOR}0A, ${THEME_COLOR}03 50%, transparent)`,
              }}
            >
              <span
                className="absolute -top-3 left-4 font-heading text-6xl leading-none select-none pointer-events-none"
                style={{ color: `${THEME_COLOR}30` }}
              >
                &ldquo;
              </span>
              <p className="text-xl md:text-2xl text-white/85 italic leading-relaxed relative z-10">
                {t('tereza.quote.pre')}{' '}
                <span className="font-semibold not-italic" style={{ color: THEME_COLOR }}>{t('tereza.quote.highlight')}</span>{' '}
                {t('tereza.quote.post')}
              </p>
            </div>

            {/* Stat badges */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              <div className="text-center py-3 px-2 rounded-xl" style={{ background: `${THEME_COLOR}08`, border: `1px solid ${THEME_COLOR}15` }}>
                <p className="font-heading text-2xl font-bold" style={{ color: THEME_COLOR }}>9</p>
                <p className="text-xs text-white/50 mt-1">{t('tereza.stats.training_months')}</p>
              </div>
              <div className="text-center py-3 px-2 rounded-xl" style={{ background: `${THEME_COLOR}08`, border: `1px solid ${THEME_COLOR}15` }}>
                <p className="font-heading text-2xl font-bold" style={{ color: THEME_COLOR }}>5</p>
                <p className="text-xs text-white/50 mt-1">{t('tereza.stats.years_asas')}</p>
              </div>
              <div className="text-center py-3 px-2 rounded-xl" style={{ background: `${THEME_COLOR}08`, border: `1px solid ${THEME_COLOR}15` }}>
                <p className="font-heading text-2xl font-bold" style={{ color: THEME_COLOR }}>100%</p>
                <p className="text-xs text-white/50 mt-1">{t('tereza.stats.full_time_dedication')}</p>
              </div>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ background: `linear-gradient(to bottom, ${THEME_COLOR}40, ${THEME_COLOR}10)` }} />

              <div className="space-y-10">
                <div className="relative">
                  <div className="absolute -left-8 top-1 w-[7px] h-[7px] rounded-full" style={{ background: THEME_COLOR, boxShadow: `0 0 8px ${THEME_COLOR}60` }} />
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ background: `${THEME_COLOR}15`, color: THEME_COLOR, border: `1px solid ${THEME_COLOR}30` }}
                  >
                    {t('tereza.timeline.0.year')}
                  </span>
                  <p className="text-lg text-white/80 leading-relaxed">{t('tereza.timeline.0.text')}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-8 top-1 w-[7px] h-[7px] rounded-full" style={{ background: THEME_COLOR, boxShadow: `0 0 8px ${THEME_COLOR}60` }} />
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ background: `${THEME_COLOR}15`, color: THEME_COLOR, border: `1px solid ${THEME_COLOR}30` }}
                  >
                    {t('tereza.timeline.1.year')}
                  </span>
                  <p className="text-lg text-white/80 leading-relaxed">{t('tereza.timeline.1.text')}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[34px] top-0.5 w-[9px] h-[9px] rounded-full" style={{ background: THEME_COLOR, boxShadow: `0 0 12px ${THEME_COLOR}80` }} />
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                    style={{ background: `${THEME_COLOR}20`, color: THEME_COLOR, border: `1px solid ${THEME_COLOR}50` }}
                  >
                    {t('tereza.timeline.2.year')}
                  </span>
                  <p className="text-xl text-white/90 leading-relaxed font-medium">{t('tereza.timeline.2.text')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section imageSrc="/images/campo-digital.jpg" overlayOpacity={0.9} gradientTint="linear-gradient(135deg, rgba(255,172,19,0.03) 0%, transparent 50%)">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 mx-auto"
            style={{ background: `${THEME_COLOR}15`, border: `1px solid ${THEME_COLOR}30` }}
          >
            <Sparkles className="w-4 h-4" style={{ color: THEME_COLOR }} />
            <span className="text-sm font-medium" style={{ color: THEME_COLOR }}>{t('pilares.badge')}</span>
          </div>
          <AnimatedText
            text={t('pilares.title')}
            as="h2"
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          />
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            {t('pilares.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {pilares.map((pilar, index) => (
            <GlowCard
              key={index}
              glowColor={`${THEME_COLOR}30`}
              borderColor={`${THEME_COLOR}20`}
            >
              <div className="p-8 h-full">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: `${THEME_COLOR}15` }}
                >
                  <pilar.icon className="w-7 h-7" style={{ color: THEME_COLOR }} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white mb-4">
                  {pilar.title}
                </h3>
                <p className="text-lg text-white/70 leading-relaxed">
                  {pilar.description}
                </p>
              </div>
            </GlowCard>
          ))}
        </div>
      </Section>

      <section
        ref={unifiedSectionRef}
        className="relative py-32 overflow-hidden bg-[#0a0a0a]"
      >
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)',
            }}
          />

          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30"
            style={{
              background: `radial-gradient(circle, ${THEME_COLOR}40 0%, transparent 60%)`,
              filter: 'blur(80px)',
              animation: 'pulse-glow 6s ease-in-out infinite',
            }}
          />

          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(${THEME_COLOR}25 1px, transparent 1px),
                linear-gradient(90deg, ${THEME_COLOR}25 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              transform: `perspective(1000px) rotateX(75deg) translateY(-20%) translateZ(-100px)`,
              animation: 'grid-move 15s linear infinite',
            }}
          />

          <div
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${THEME_COLOR}60 0%, transparent 70%)`,
              filter: 'blur(100px)',
              animation: 'float-slow 20s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
            style={{
              background: `radial-gradient(circle, #E040FB4D 0%, transparent 70%)`,
              filter: 'blur(90px)',
              animation: 'float-slow 18s ease-in-out infinite reverse',
            }}
          />

          <div
            className="absolute w-[800px] h-[800px] rounded-full opacity-20 mix-blend-screen pointer-events-none transition-all duration-300"
            style={{
              background: `radial-gradient(circle, ${THEME_COLOR}20 0%, transparent 50%)`,
              left: `${mousePosition.x * 100}%`,
              top: `${mousePosition.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        <div className="container-custom relative z-10">

          <div className="max-w-4xl mx-auto mb-24">
            <ProjectSection accentColor={THEME_COLOR}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: `${THEME_COLOR}15` }}
                  >
                    <Globe className="w-8 h-8" style={{ color: THEME_COLOR }} />
                  </div>
                  <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                    {t('crenca.title')}
                  </h2>
                </div>

                <div className="space-y-6 text-white/80 leading-relaxed max-w-4xl mx-auto">
                  <p className="text-xl">{t('crenca.paragraph_1')}</p>

                  <ShinyCard className="p-8 my-8 text-left">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5" style={{ color: THEME_COLOR }} />
                        <span className="text-sm font-medium uppercase tracking-wider" style={{ color: THEME_COLOR }}>
                          {t('crenca.highlight_title')}
                        </span>
                      </div>
                      <p className="text-xl md:text-2xl font-heading text-white leading-relaxed">
                        {t('crenca.highlight_pre')}
                        <span style={{ color: THEME_COLOR }}> {t('crenca.highlight_span')}</span>.
                        {' '}{t('crenca.highlight_post')}
                      </p>
                    </div>
                  </ShinyCard>

                  <p className="text-xl">{t('crenca.paragraph_2')}</p>
                </div>
              </div>
            </ProjectSection>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="p-8 md:p-12 text-center">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-8">
                {t('cta.title_pre')} <span style={{ color: THEME_COLOR }}>{t('cta.title_span')}</span>?
              </h2>
              <p className="text-xl text-white/70 mb-10">
                {t('cta.subtitle')}
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center btn-glow-border hover:scale-105 transition-transform duration-300"
              >
                <div
                  className="btn-content-inner px-12 py-6 font-heading font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)`,
                    color: '#000',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
                      animation: 'shine 2s ease-in-out infinite',
                    }}
                  />
                  <MessageCircle className="w-6 h-6 mr-3 relative z-10" />
                  <span className="relative z-10">{t('cta.button')}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
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
      `}</style>
    </div>
  );
};

export default QuemSomosPage;
