import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectLayout } from '@/components/layout';
import { AnimatedText } from '@/components/effects';
import { AnimatedCounter } from '@/components/effects/AnimatedCounter';
import { GlowCard } from '@/components/ui/GlowCard';
import { HandWrittenCircle } from '@/components/ui/hand-written-circle';
import { Typewriter } from '@/components/ui/typewriter';
import { Timeline } from '@/components/ui/timeline';
import { TimelineSlideshow } from '@/components/ui/timeline-slideshow';
import { ParallaxImage } from '@/components/ui/ParallaxImage';

import { useRouter } from '@/router';
import { usePrefersReducedMotion, useScrollReveal } from '@/hooks';

import {
    MessageCircle,
    ArrowRight,
    ArrowDown,
    Church,
    Target,
    Users,
    Globe,
} from 'lucide-react';

import { THEME_COLOR, THEME_COLOR_LIGHT } from '@/constants/theme';
import { SEOBox } from '@/components/seo/SEOBox';

export const ImersaoPage: React.FC = () => {
    const { t } = useTranslation('imersao');
    const { navigate } = useRouter();
    const prefersReducedMotion = usePrefersReducedMotion();
    const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('whatsapp.message'))}`;

    const diferenciais = t('diferenciais.items', { returnObjects: true }) as Array<{
        number: number;
        highlight: string;
        text: string;
    }>;

    const steps = t('steps.items', { returnObjects: true }) as Array<{
        number: number;
        title: string;
        description: string;
    }>;

    const publicoRaw = t('publico_alvo.items', { returnObjects: true }) as Array<{
        title: string;
        description: string;
    }>;

    const publicoIcons = [Church, Target, Users, Globe];
    const publicoAlvo = publicoRaw.map((item, index) => ({
        ...item,
        icon: publicoIcons[index] ?? Globe,
    }));

    const typewriterWords = t('impacto.typewriter_words', { returnObjects: true }) as string[];

    const timelineData = [
        {
            title: t('timeline.despertar.title'),
            content: (
                <div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {t('timeline.despertar.heading')}
                    </h3>
                    <p className="text-neutral-300 text-lg md:text-xl leading-relaxed mb-10">
                        {t('timeline.despertar.text')}
                    </p>
                    <p className="text-brand-orange-light font-medium mb-4">{t('timeline.examples_label')}</p>
                    <TimelineSlideshow
                        items={[
                            {
                                image: '/assets/imersao/pastoral-tension.png',
                                title: t('timeline.despertar.items.0.title'),
                                description: t('timeline.despertar.items.0.description'),
                            },
                            {
                                image: '/assets/imersao/hero-auditorium.png',
                                title: t('timeline.despertar.items.1.title'),
                                description: t('timeline.despertar.items.1.description'),
                            },
                            {
                                image: '/assets/imersao/imersaoportal.webp',
                                title: t('timeline.despertar.items.2.title'),
                                description: t('timeline.despertar.items.2.description'),
                            },
                        ]}
                    />
                </div>
            ),
        },
        {
            title: t('timeline.equipar.title'),
            content: (
                <div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {t('timeline.equipar.heading')}
                    </h3>
                    <p className="text-neutral-300 text-lg md:text-xl leading-relaxed mb-10">
                        {t('timeline.equipar.text')}
                    </p>
                    <p className="text-brand-orange-light font-medium mb-4">{t('timeline.examples_label')}</p>
                    <TimelineSlideshow
                        items={[
                            {
                                image: '/assets/imersao/teens-gaming.png',
                                title: t('timeline.equipar.items.0.title'),
                                description: t('timeline.equipar.items.0.description'),
                            },
                            {
                                image: '/assets/imersao/evangelism-phone.png',
                                title: t('timeline.equipar.items.1.title'),
                                description: t('timeline.equipar.items.1.description'),
                            },
                            {
                                image: '/assets/imersao/cta-stage.png',
                                title: t('timeline.equipar.items.2.title'),
                                description: t('timeline.equipar.items.2.description'),
                            },
                        ]}
                    />
                </div>
            ),
        },
        {
            title: t('timeline.acompanhar.title'),
            content: (
                <div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {t('timeline.acompanhar.heading')}
                    </h3>
                    <p className="text-neutral-300 text-lg md:text-xl leading-relaxed mb-10">
                        {t('timeline.acompanhar.text')}
                    </p>
                    <p className="text-brand-orange-light font-medium mb-4">{t('timeline.examples_label')}</p>
                    <TimelineSlideshow
                        items={[
                            {
                                image: '/assets/imersao/church-crowd.png',
                                title: t('timeline.acompanhar.items.0.title'),
                                description: t('timeline.acompanhar.items.0.description'),
                            },
                            {
                                image: '/assets/imersao/gallery-1.png',
                                title: t('timeline.acompanhar.items.1.title'),
                                description: t('timeline.acompanhar.items.1.description'),
                            },
                            {
                                image: '/assets/imersao/gallery-2.png',
                                title: t('timeline.acompanhar.items.2.title'),
                                description: t('timeline.acompanhar.items.2.description'),
                            },
                        ]}
                    />
                </div>
            ),
        },
    ];

    const heroRef = useRef<HTMLDivElement>(null);
    const [heroScroll, setHeroScroll] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            if (!heroRef.current) return;
            const rect = heroRef.current.getBoundingClientRect();
            setHeroScroll(Math.max(0, Math.min(1, -rect.top / rect.height)));
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const [s2Ref, s2Visible] = useScrollReveal();
    const [s3Ref] = useScrollReveal();
    const [s5Ref, s5Visible] = useScrollReveal();
    const [s6Ref, s6Visible] = useScrollReveal();
    const [s7Ref, s7Visible] = useScrollReveal();
    const [s8Ref, s8Visible] = useScrollReveal();
    const [s9Ref, s9Visible] = useScrollReveal();

    const reveal = (v: boolean, delay = 0) =>
        prefersReducedMotion
            ? {}
            : {
                opacity: v ? 1 : 0,
                transform: v ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
            };

    return (
        <ProjectLayout themeColor={THEME_COLOR} themeColorLight={THEME_COLOR_LIGHT}>
            <SEOBox
                title={t('seo.title')}
                description={t('seo.description')}
                url="https://missaodigitalmd.com/imersao"
            />
            <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4">
                <div
                    className="absolute inset-0 z-0 will-change-transform"
                    style={prefersReducedMotion ? {} : { transform: `translateY(${heroScroll * 20}%) scale(${1 + heroScroll * 0.05})` }}
                >
                    <div className="absolute inset-0 bg-cover bg-center image-breathe" style={{ backgroundImage: 'url(/assets/imersao/heroimersao01.webp)' }} />
                </div>
                <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(13,13,13,0.65) 0%, rgba(255,172,19,0.08) 35%, rgba(13,13,13,0.55) 65%, rgba(13,13,13,0.97) 100%)' }} />

                <div className="relative z-20 container-custom text-center pt-20 pb-12">
                    <AnimatedText
                        text={t('hero.title')}
                        as="h1"
                        className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8"
                        highlightWords={t('hero.highlight_words').split(',')}
                        highlightClassName="text-gradient-brand"
                        delay={0.2}
                        staggerDelay={0.06}
                    />
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12" style={{ opacity: 0, animation: 'fade-in 0.6s ease-out 1s forwards' }}>
                        {t('hero.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center" style={{ opacity: 0, animation: 'fade-in 0.6s ease-out 1.3s forwards' }}>
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-10 py-5 rounded-xl font-heading font-bold text-lg transition-transform duration-300 hover:scale-105" style={{ background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)`, color: '#000' }}>
                            <MessageCircle className="w-6 h-6 mr-3" />
                            {t('hero.cta_whatsapp')}
                        </a>
                        <button onClick={() => document.getElementById('por-que-imersao')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-lg font-medium transition-colors">
                            {t('hero.cta_scroll')}
                            <ArrowDown className="w-5 h-5 animate-bounce" />
                        </button>
                    </div>
                </div>
            </section>

            <section id="por-que-imersao" className="py-20 md:py-28 lg:py-36 px-4" ref={s2Ref}>
                <div className="container-custom max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div style={reveal(s2Visible)}>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-10 text-white leading-tight">
                                {t('secao2.title_pre')}{' '}
                                <span style={{ color: THEME_COLOR }}>{t('secao2.title_span')}</span>
                            </h2>

                            <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">{t('secao2.paragraph_1')}</p>
                            <p className="text-xl md:text-2xl text-white/80 mb-10 leading-relaxed">{t('secao2.paragraph_2')}</p>

                            <div className="relative pl-8 border-l-4 p-8 rounded-r-xl" style={{ borderColor: THEME_COLOR, background: `linear-gradient(to right, ${THEME_COLOR}1A, transparent)` }}>
                                <p className="text-2xl md:text-3xl font-heading font-bold leading-tight" style={{ color: THEME_COLOR }}>
                                    {t('secao2.pull_quote')}
                                </p>
                            </div>
                        </div>

                        <div style={reveal(s2Visible, 0.2)}>
                            <div className="relative overflow-hidden rounded-2xl">
                                <img src="/assets/imersao/pastoral-tension.png" alt={t('secao2.image_alt')} className="w-full h-[500px] object-cover image-breathe" />
                                <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: `inset 0 0 0 1px ${THEME_COLOR}25, 0 0 40px ${THEME_COLOR}15` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative" ref={s3Ref}>
                <div className="pt-20 md:pt-28 lg:pt-36 px-4 mb-0">
                    <div className="container-custom max-w-6xl relative z-10 text-center">
                        <AnimatedText text={t('timeline.heading')} as="h2" className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6" />
                        <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-16">{t('timeline.subheading')}</p>
                    </div>
                </div>
                <Timeline data={timelineData} />
            </section>

            <section className="py-20 md:py-28 lg:py-36 px-4 relative" ref={s5Ref}>
                <div className="container-custom max-w-4xl relative z-10">
                    <div className="text-center mb-14" style={reveal(s5Visible)}>
                        <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
                            {t('diferenciais.title_pre')} <span style={{ color: THEME_COLOR }}>{t('diferenciais.title_span_1')}</span> {t('diferenciais.title_middle')}{' '}
                            <span style={{ color: THEME_COLOR }}>{t('diferenciais.title_span_2')}</span>
                        </h2>
                    </div>

                    <div className="space-y-8">
                        {diferenciais.map((d, i) => (
                            <div key={d.number} style={reveal(s5Visible, 0.15 * (i + 1))}>
                                <GlowCard glowColor={`${THEME_COLOR}30`} borderColor={`${THEME_COLOR}20`} className="h-full">
                                    <div className="flex gap-8 items-start p-8 md:p-10">
                                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-bold text-3xl" style={{ background: `${THEME_COLOR}15`, color: THEME_COLOR }}>
                                            <AnimatedCounter value={d.number} duration={500} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading text-2xl font-bold text-white mb-3">{d.highlight}</h3>
                                            <p className="text-lg text-white/70 leading-relaxed">{d.text}</p>
                                        </div>
                                    </div>
                                </GlowCard>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden flex items-center min-h-[80vh]" ref={s6Ref}>
                <div className="absolute inset-0 overflow-hidden">
                    <ParallaxImage src="/assets/imersao/imersaoportal.webp" alt={t('impacto.image_alt')} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.9) 30%, rgba(10,10,10,0.4) 60%, rgba(10,10,10,0.2) 100%)' }} />
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(10,10,10,0.9) 0%, transparent 70%)' }} />
                </div>

                <div className="relative z-10 w-full container-custom">
                    <div className="relative w-full h-full min-h-[60vh] flex flex-col justify-between py-12">
                        <div className="max-w-3xl text-left" style={reveal(s6Visible)}>
                            <div className="mb-6 w-16 h-px" style={{ background: `linear-gradient(90deg, ${THEME_COLOR}, transparent)` }} />
                            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight" style={{ color: '#fff', textShadow: '0 4px 60px rgba(0,0,0,0.9)' }}>
                                {t('impacto.top_pre')}{' '}
                                <span className="inline-block min-w-[120px]">
                                    <Typewriter
                                        text={typewriterWords}
                                        speed={70}
                                        waitTime={1500}
                                        deleteSpeed={40}
                                        cursorChar="_"
                                        className="inline-block"
                                        style={{ color: THEME_COLOR }}
                                    />
                                </span>{' '}
                                {t('impacto.top_post')}
                            </h2>
                        </div>

                        <div className="max-w-3xl text-right self-end mt-12 md:mt-0" style={reveal(s6Visible, 0.3)}>
                            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight" style={{ color: '#fff', textShadow: '0 4px 60px rgba(0,0,0,0.9)' }}>
                                {t('impacto.bottom_pre')} <br className="hidden md:block" />
                                <span style={{ color: THEME_COLOR }}>
                                    {t('impacto.bottom_span_pre')}
                                    <HandWrittenCircle className="ml-3" delay={0.8}>{t('impacto.bottom_handwritten')}</HandWrittenCircle>
                                    .
                                </span>
                            </h2>
                            <div className="mt-6 w-16 h-px ml-auto" style={{ background: `linear-gradient(90deg, transparent, ${THEME_COLOR})` }} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-28 lg:py-36 px-4 relative" ref={s7Ref}>
                <div className="container-custom max-w-6xl relative z-10">
                    <div className="text-center mb-20" style={reveal(s7Visible)}>
                        <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            {t('steps.title_pre')}{' '}
                            <span style={{ color: THEME_COLOR }}>{t('steps.title_span')}</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="absolute top-8 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px hidden md:block" style={{ background: `${THEME_COLOR}30` }} />

                        {steps.map((step, i) => (
                            <div key={step.number} className="text-center relative" style={reveal(s7Visible, 0.15 * (i + 1))}>
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 font-heading font-bold text-3xl relative z-10" style={{ background: '#1E1E1E', border: `3px solid ${THEME_COLOR}`, color: THEME_COLOR }}>
                                    <AnimatedCounter value={step.number} duration={400} />
                                </div>
                                <h3 className="font-heading text-2xl font-bold text-white mb-4">{step.title}</h3>
                                <p className="text-lg text-white/70 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12" style={reveal(s7Visible, 0.6)}>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-12 py-6 rounded-xl font-heading font-bold text-lg transition-transform duration-300 hover:scale-105"
                            style={{
                                background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)`,
                                color: '#000',
                                boxShadow: `0 0 30px ${THEME_COLOR}30`,
                                animation: prefersReducedMotion ? 'none' : 'glow-pulse 3s ease-in-out infinite',
                            }}
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            {t('steps.cta')}
                        </a>
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-28 lg:py-36 px-4" ref={s8Ref}>
                <div className="container-custom max-w-6xl">
                    <div className="text-center mb-20" style={reveal(s8Visible)}>
                        <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            {t('publico_alvo.title_pre')}{' '}
                            <span style={{ color: THEME_COLOR }}>{t('publico_alvo.title_span')}</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {publicoAlvo.map((item, i) => (
                            <div key={item.title} style={reveal(s8Visible, 0.1 * (i + 1))}>
                                <GlowCard glowColor={`${THEME_COLOR}30`} borderColor={`${THEME_COLOR}20`} className="h-full">
                                    <div className="p-6 flex gap-5 items-start h-full">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${THEME_COLOR}12` }}>
                                            <item.icon className="w-8 h-8" style={{ color: THEME_COLOR }} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading text-2xl font-bold text-white mb-3">{item.title}</h3>
                                            <p className="text-lg text-white/70 leading-relaxed">{item.description}</p>
                                        </div>
                                    </div>
                                </GlowCard>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-28 lg:py-36 px-4 relative overflow-hidden" ref={s9Ref}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30"
                        style={{ background: `radial-gradient(circle, ${THEME_COLOR}40 0%, transparent 60%)`, filter: 'blur(80px)', animation: 'pulse-glow 6s ease-in-out infinite' }}
                    />
                    <div
                        className="absolute inset-0 opacity-20 mixing-blend-screen"
                        style={{
                            backgroundImage: `
                linear-gradient(${THEME_COLOR}25 1px, transparent 1px),
                linear-gradient(90deg, ${THEME_COLOR}25 1px, transparent 1px)
              `,
                            backgroundSize: '80px 80px',
                            transform: 'perspective(1000px) rotateX(75deg) translateY(-20%) translateZ(-100px)',
                            animation: 'grid-move 15s linear infinite',
                            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
                            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
                        }}
                    />
                </div>

                <div className="container-custom max-w-4xl relative z-10 text-center">
                    <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-12" style={reveal(s9Visible)}>
                        {t('cta_final.title_pre')}{' '}
                        <span style={{ color: THEME_COLOR }}>{t('cta_final.title_span')}</span>
                        <br />
                        {t('cta_final.title_post')}
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center" style={reveal(s9Visible, 0.2)}>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-heading font-bold text-sm transition-transform duration-300 hover:scale-105"
                            style={{
                                background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)`,
                                color: '#000',
                                boxShadow: `0 0 30px ${THEME_COLOR}30`,
                                animation: prefersReducedMotion ? 'none' : 'glow-pulse 3s ease-in-out infinite',
                            }}
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            {t('cta_final.cta_whatsapp')}
                        </a>
                        <button onClick={() => navigate('projetos')} className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-heading font-bold text-sm border border-white/20 text-white btn-shine transition-all duration-300 hover:border-white/40">
                            {t('cta_final.cta_projects')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </section>

            <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px ${THEME_COLOR}25; }
          50% { box-shadow: 0 0 40px ${THEME_COLOR}40; }
        }
        @keyframes grid-move {
          0% { transform: perspective(1000px) rotateX(75deg) translateY(0) translateZ(-100px); }
          100% { transform: perspective(1000px) rotateX(75deg) translateY(80px) translateZ(-100px); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
        </ProjectLayout>
    );
};

export default ImersaoPage;
