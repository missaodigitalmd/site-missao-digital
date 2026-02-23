import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout';
import { AnimatedText } from '@/components/effects';
import { useScrollReveal } from '@/hooks';
import { Heart, HandCoins, Handshake, ArrowRight, Sparkles, HeartHandshake, Zap } from 'lucide-react';
import { OrarModal } from '@/components/modals/OrarModal';
import { ParceriaMensalModal } from '@/components/modals/ParceriaMensalModal';
import { OfertaPontualModal } from '@/components/modals/OfertaPontualModal';
import { CooperarModal } from '@/components/modals/CooperarModal';

export const ApoieSection: React.FC = () => {
  const { t } = useTranslation('home');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isOrarOpen, setIsOrarOpen] = useState(false);
  const [isParceriaOpen, setIsParceriaOpen] = useState(false);
  const [isOfertaOpen, setIsOfertaOpen] = useState(false);
  const [isCooperarOpen, setIsCooperarOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [sectionRef, isVisible] = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  const caminhos = [
    {
      icone: Heart,
      titulo: t('apoie_section.path_1_titulo'),
      descricao: t('apoie_section.path_1_desc'),
      acao: t('apoie_section.path_1_acao'),
      cor: '#FF6B6B',
      gradient: 'from-[#FF6B6B] to-[#FF8E8E]',
    },
    {
      icone: HandCoins,
      titulo: t('apoie_section.path_2_titulo'),
      descricao: t('apoie_section.path_2_desc'),
      acao: '61993978989',
      cor: '#FFD740',
      gradient: `from-[#FFD740] to-[#FF9100]`,
    },
    {
      icone: Handshake,
      titulo: t('apoie_section.path_3_titulo'),
      descricao: t('apoie_section.path_3_desc'),
      acao: t('apoie_section.path_3_acao'),
      cor: '#00E5FF',
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
    <Section id="apoie" imageSrc="/images/apoie-missao.jpg" overlayOpacity={0.88} gradientTint="linear-gradient(135deg, rgba(255,107,107,0.04) 0%, transparent 50%)" ref={sectionRef} topFade bottomFade parallax>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Floating hearts/particles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 20}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float-heart ${4 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            <Heart className="w-4 h-4 text-brand-orange-light/20" />
          </div>
        ))}

        {/* Gradient orb */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, transparent 60%)',
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-light/10 border border-brand-orange-light/20 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <Sparkles className="w-4 h-4 text-brand-orange-light" />
              <span className="text-sm text-brand-orange-light font-medium">{t('apoie_section.badge')}</span>
            </div>

            <AnimatedText
              text={t('apoie_section.title')}
              as="h2"
              className="font-heading text-3xl md:text-4xl font-bold text-white mb-6"
            />

            <p
              className={`text-lg text-white/70 leading-relaxed mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              {t('apoie_section.description')}
            </p>

            {/* Cards */}
            <div className="space-y-4">
              {caminhos.map((caminho, index) => (
                <div
                  key={index}
                  className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                    }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Glow effect */}
                  <div
                    className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"
                    style={{
                      background: `linear-gradient(135deg, ${caminho.cor}30, transparent)`,
                    }}
                  />

                  <div className="relative glass-card rounded-xl p-5 hover:border-white/15 transition-all duration-300 overflow-hidden">
                    {/* Left accent line */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-500"
                      style={{
                        background: `linear-gradient(to bottom, ${caminho.cor}, transparent)`,
                        opacity: hoveredIndex === index ? 1 : 0.3,
                      }}
                    />

                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${caminho.cor}15` }}
                      >
                        <caminho.icone
                          className="w-7 h-7 transition-all duration-300"
                          style={{ color: caminho.cor }}
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-heading font-semibold text-white text-lg mb-1 group-hover:text-brand-orange-light transition-colors">
                          {caminho.titulo}
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed mb-3">
                          {caminho.descricao}
                        </p>

                        {/* Action */}
                        {caminho.titulo === t('apoie_section.path_2_titulo') ? (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => setIsParceriaOpen(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-secondary border border-white/10 text-sm font-medium hover:bg-white/5 transition-all text-yellow-400"
                              style={{ color: caminho.cor }}
                            >
                              <HeartHandshake className="w-4 h-4" style={{ color: caminho.cor }} />
                              <span style={{ color: caminho.cor }}>{t('apoie_section.path_2_parceiro')}</span>
                            </button>
                            <button
                              onClick={() => setIsOfertaOpen(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-secondary border border-white/10 text-sm font-medium hover:bg-white/5 transition-all text-white"
                            >
                              <Zap className="w-4 h-4 text-white" />
                              <span className="text-white">{t('apoie_section.path_2_oferta')}</span>
                            </button>
                          </div>
                        ) : caminho.titulo === t('apoie_section.path_1_titulo') ? (
                          <button
                            onClick={() => setIsOrarOpen(true)}
                            className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3"
                            style={{ color: caminho.cor }}
                          >
                            {caminho.acao}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsCooperarOpen(true)}
                            className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3"
                            style={{ color: caminho.cor }}
                          >
                            {caminho.acao}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image with enhanced effects */}
          <div
            className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              }`}
          >
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/images/apoie-missao.jpg"
                alt={t('apoie_section.title')}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-primary/80 via-transparent to-transparent" />

              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
                    transform: 'translateX(-100%)',
                    animation: 'shine 3s ease-in-out infinite',
                  }}
                />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-40 h-40 border-2 border-brand-orange-light/20 rounded-2xl -z-10" />
            <div className="absolute -top-4 -right-4 w-24 h-24 border border-brand-magenta/20 rounded-full -z-10" />

            {/* Floating stats card */}
            <div
              className="absolute -bottom-4 right-8 bg-surface-card border border-white/10 rounded-xl px-5 py-4 shadow-xl"
              style={{ animation: 'float-card 3s ease-in-out infinite' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-orange-light to-brand-magenta flex items-center justify-center">
                  <Heart className="w-6 h-6 text-surface-primary fill-surface-primary" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">{t('apoie_section.floating_label')}</p>
                  <p className="text-white font-bold text-lg leading-tight">{t('apoie_section.floating_title')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-heart {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-15px) rotate(10deg); opacity: 0.6; }
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Modals */}
      <OrarModal isOpen={isOrarOpen} onClose={() => setIsOrarOpen(false)} />
      <ParceriaMensalModal isOpen={isParceriaOpen} onClose={() => setIsParceriaOpen(false)} onSwitchToOferta={() => { setIsParceriaOpen(false); setIsOfertaOpen(true); }} />
      <OfertaPontualModal isOpen={isOfertaOpen} onClose={() => setIsOfertaOpen(false)} onSwitchToParceria={() => { setIsOfertaOpen(false); setIsParceriaOpen(true); }} />
      <CooperarModal isOpen={isCooperarOpen} onClose={() => setIsCooperarOpen(false)} />
    </Section>
  );
};

export default ApoieSection;
