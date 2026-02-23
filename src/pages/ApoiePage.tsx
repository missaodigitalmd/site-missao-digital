import React, { useState, useEffect } from 'react';
import { Section } from '@/components/layout';
import { AnimatedText } from '@/components/effects';
import { HeroApoie } from '@/components/hero/HeroApoie';
import { GlowCard } from '@/components/ui/GlowCard';
import { BookOpen, MessageCircle, HeartHandshake, Zap, Heart, HandCoins, Handshake } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

import { THEME_COLOR } from '@/constants/theme';

import { OrarModal } from '@/components/modals/OrarModal';
import { CooperarModal } from '@/components/modals/CooperarModal';
import { ParceriaMensalModal } from '@/components/modals/ParceriaMensalModal';
import { OfertaPontualModal } from '@/components/modals/OfertaPontualModal';
import { useDeepLink } from '@/hooks/useDeepLink';

export const ApoiePage: React.FC = () => {
  const { t } = useTranslation('apoie');
  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('cta.whatsapp_message'))}`;
  const [showOrarModal, setShowOrarModal] = useState(false);
  const [showCooperarModal, setShowCooperarModal] = useState(false);
  const [showContribuirModal, setShowContribuirModal] = useState(false);
  const [showOfertaPontualModal, setShowOfertaPontualModal] = useState(false);
  const { deepLinkModal, consumeModal } = useDeepLink();

  const caminhos = [
    {
      icone: Heart,
      titulo: t('caminhos.orar.titulo'),
      descricao: t('caminhos.orar.descricao'),
      acao: t('caminhos.orar.acao'),
      tipo: 'orar',
    },
    {
      icone: HandCoins,
      titulo: t('caminhos.contribuir.titulo'),
      descricao: t('caminhos.contribuir.descricao'),
      acao: t('caminhos.contribuir.acao_oferta'),
      tipo: 'pix',
    },
    {
      icone: Handshake,
      titulo: t('caminhos.cooperar.titulo'),
      descricao: t('caminhos.cooperar.descricao'),
      acao: t('caminhos.cooperar.acao'),
      tipo: 'cooperar',
    },
  ];

  const formasCooperacao = t('formas_cooperacao', { returnObjects: true }) as string[];

  // Deep link: abre modal automaticamente
  useEffect(() => {
    if (!deepLinkModal) return;
    switch (deepLinkModal) {
      case 'orar': setShowOrarModal(true); break;
      case 'parceria': setShowContribuirModal(true); break;
      case 'cooperar': setShowCooperarModal(true); break;
      case 'oferta': setShowOfertaPontualModal(true); break;
    }
    consumeModal();
  }, [deepLinkModal, consumeModal]);

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Hero */}
      <HeroApoie
        title={t('hero.title')}
        highlightWords={t('hero.highlight_words').split(',')}
        highlightClassName="text-gradient-brand"
        subtitle={t('hero.subtitle')}
      />

      {/* Três Caminhos */}
      <Section className="relative z-10 bg-surface-primary" imageSrc="/images/apoie-missao.jpg" overlayOpacity={0.88} gradientTint="linear-gradient(135deg, rgba(255,172,19,0.04) 0%, transparent 50%)">
        <div className="text-center mb-12">
          <AnimatedText
            text={t('caminhos.title')}
            as="h2"
            className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {caminhos.map((caminho, index) => (
            <GlowCard
              key={index}
              glowColor={`${THEME_COLOR}30`}
              borderColor={`${THEME_COLOR}20`}
              className="h-full"
            >
              <div className="p-8 h-full flex flex-col">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: `${THEME_COLOR}15` }}
                >
                  <caminho.icone className="w-7 h-7" style={{ color: THEME_COLOR }} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white mb-4">
                  {caminho.titulo}
                </h3>
                <p className="text-white/60 leading-relaxed mb-6 flex-grow">
                  {caminho.descricao}
                </p>

                {caminho.tipo === 'pix' ? (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setShowContribuirModal(true)}
                      className="w-full py-3 rounded-lg font-medium text-sm border transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                      style={{ borderColor: THEME_COLOR, color: THEME_COLOR }}
                    >
                      <HeartHandshake className="w-4 h-4" />
                      {t('caminhos.contribuir.acao_parceiro')}
                    </button>
                    <button
                      onClick={() => setShowOfertaPontualModal(true)}
                      className="w-full py-3 rounded-lg font-medium text-sm border transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                      style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                    >
                      <Zap className="w-4 h-4" />
                      {t('caminhos.contribuir.acao_oferta')}
                    </button>
                  </div>
                ) : caminho.tipo === 'orar' ? (
                  <button
                    onClick={() => setShowOrarModal(true)}
                    className="w-full py-3 rounded-lg font-medium text-sm border transition-all hover:scale-[1.02]"
                    style={{ borderColor: THEME_COLOR, color: THEME_COLOR }}
                  >
                    {caminho.acao}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCooperarModal(true)}
                    className="w-full py-3 rounded-lg font-medium text-sm border transition-all hover:scale-[1.02]"
                    style={{ borderColor: THEME_COLOR, color: THEME_COLOR }}
                  >
                    {caminho.acao}
                  </button>
                )}
              </div>
            </GlowCard>
          ))}
        </div>
      </Section>

      {/* Família Section - REMOVED (Duplicate of Hero) */}
      {/* <Section> ... </Section> */}

      {/* Transparência */}
      <Section imageSrc="/images/campo-digital.jpg" overlayOpacity={0.92}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('transparencia.title')}
          </h2>
          <p className="text-xl text-white/80 leading-relaxed">
            {t('transparencia.text')}
          </p>
        </div>
      </Section>

      {/* Versículo Âncora */}
      <Section>
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="w-10 h-10" style={{ color: THEME_COLOR }} />
          </div>
          <blockquote className="text-3xl md:text-4xl lg:text-5xl font-heading text-white italic leading-relaxed mb-6">
            &ldquo;{t('versiculo.text')}&rdquo;
          </blockquote>
          <cite className="not-italic text-xl" style={{ color: THEME_COLOR }}>{t('versiculo.ref')}</cite>
        </div>
      </Section>

      {/* CTA Final */}
      <Section className="relative overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <GlowCard
            glowColor={`${THEME_COLOR}40`}
            borderColor={`${THEME_COLOR}30`}
            className="w-full"
          >
            <div className="p-8 md:p-12 text-center">
              <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8">
                <Trans
                  ns="apoie"
                  i18nKey="cta.title"
                  components={{ highlight: <span style={{ color: THEME_COLOR }} /> }}
                />
              </h2>
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
                  <span className="relative z-10">{t('cta.cta')}</span>
                </div>
              </a>
            </div>
          </GlowCard>
        </div>
      </Section>

      {/* Modals */}
      <OrarModal
        isOpen={showOrarModal}
        onClose={() => setShowOrarModal(false)}
      />
      <CooperarModal
        isOpen={showCooperarModal}
        onClose={() => setShowCooperarModal(false)}
        initialFormas={[formasCooperacao[0] ?? 'Conexões com igrejas e líderes']}
      />
      <ParceriaMensalModal
        isOpen={showContribuirModal}
        onClose={() => setShowContribuirModal(false)}
        onSwitchToOferta={() => {
          setShowContribuirModal(false);
          setShowOfertaPontualModal(true);
        }}
      />
      <OfertaPontualModal
        isOpen={showOfertaPontualModal}
        onClose={() => setShowOfertaPontualModal(false)}
        onSwitchToParceria={() => {
          setShowOfertaPontualModal(false);
          setShowContribuirModal(true);
        }}
      />
    </div>
  );
};
