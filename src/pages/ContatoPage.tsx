import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { Section } from '@/components/layout';
import { HeroStandard, AnimatedText } from '@/components/effects';
import { GlowCard } from '@/components/ui/GlowCard';
import { MessageCircle, Instagram, Mail, MapPin } from 'lucide-react';

import { THEME_COLOR } from '@/constants/theme';

import { SEOBox } from '@/components/seo/SEOBox';

export const ContatoPage: React.FC = () => {
  const { t } = useTranslation('contato');
  const whatsappUrlMain = `https://wa.me/556286425598?text=${encodeURIComponent(t('whatsapp_cta.whatsapp_message'))}`;
  const whatsappUrlFinal = `https://wa.me/556286425598?text=${encodeURIComponent(t('cta_final.whatsapp_message'))}`;

  const contatos = [
    {
      icone: MessageCircle,
      titulo: t('info.whatsapp'),
      valor: '(62) 8642-5598',
      href: `https://wa.me/556286425598?text=${encodeURIComponent(t('info.whatsapp_message'))}`,
      cor: '#25D366',
    },
    {
      icone: Mail,
      titulo: t('info.email'),
      valor: 'casalmissaodigital@gmail.com',
      href: 'mailto:casalmissaodigital@gmail.com',
      cor: '#EA4335',
    },
    {
      icone: Instagram,
      titulo: 'Instagram',
      valor: '@missaodigitalmd',
      href: 'https://instagram.com/missaodigitalmd',
      cor: '#E1306C',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-primary">
      <SEOBox
        title={t('seo.title')}
        description={t('seo.description')}
        url="https://missaodigitalmd.com/contato"
      />
      {/* Hero */}
      <HeroStandard
        title={t('hero.title')}
        highlightWords={t('hero.highlight_words').split(',')}
        highlightClassName="text-gradient-brand"
        subtitle={t('hero.subtitle')}
        accentColor={THEME_COLOR}
        particleColor={THEME_COLOR}
        variant="digital"
      />

      {/* WhatsApp CTA Principal */}
      <Section className="relative z-10 bg-surface-primary" imageSrc="/images/hero-bg.jpg" overlayOpacity={0.88} gradientTint="linear-gradient(135deg, rgba(255,172,19,0.04) 0%, transparent 50%)">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: `${THEME_COLOR}15`, border: `1px solid ${THEME_COLOR}30` }}
          >
            <MessageCircle className="w-4 h-4" style={{ color: THEME_COLOR }} />
            <span className="text-sm font-medium" style={{ color: THEME_COLOR }}>{t('whatsapp_cta.badge')}</span>
          </div>

          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            {t('whatsapp_cta.title')}
          </h2>
          <p className="text-xl text-white/80 leading-relaxed mb-10">
            {t('whatsapp_cta.text')}
          </p>

          <a
            href={whatsappUrlMain}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-10 py-5 rounded-xl font-heading font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: '#25D366',
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
            <span className="relative z-10">{t('whatsapp_cta.button')}</span>
          </a>
        </div>
      </Section>

      {/* Outras Formas de Contato */}
      <Section>
        <div className="text-center mb-12">
          <AnimatedText
            text={t('outras_formas.title')}
            as="h2"
            className="font-heading text-4xl md:text-5xl font-bold text-white mb-6"
          />
          <p className="text-xl text-white/70">
            {t('outras_formas.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {contatos.map((contato, index) => (
            <GlowCard
              key={index}
              glowColor={`${contato.cor}30`}
              borderColor={`${contato.cor}20`}
            >
              <a
                href={contato.href}
                target={contato.href.startsWith('http') ? '_blank' : undefined}
                rel={contato.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="block p-6 text-center group"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${contato.cor}15` }}
                >
                  <contato.icone className="w-7 h-7" style={{ color: contato.cor }} />
                </div>
                <p className="text-white/60 text-sm mb-1">{contato.titulo}</p>
                <p className="text-white font-medium group-hover:text-brand-orange-light transition-colors break-all md:break-words">
                  {contato.valor}
                </p>
              </a>
            </GlowCard>
          ))}
        </div>
      </Section>

      {/* Localização */}
      <Section imageSrc="/images/campo-digital.jpg" overlayOpacity={0.92}>
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: `${THEME_COLOR}15`, border: `1px solid ${THEME_COLOR}30` }}
          >
            <MapPin className="w-4 h-4" style={{ color: THEME_COLOR }} />
            <span className="text-sm font-medium" style={{ color: THEME_COLOR }}>{t('localizacao.badge')}</span>
          </div>

          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            {t('localizacao.title')}
          </h2>
          <p className="text-xl text-white/80 leading-relaxed">
            {t('localizacao.text')}
          </p>
        </div>
      </Section>

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${THEME_COLOR}15 0%, transparent 70%)`,
          }}
        />
        <div className="container-custom relative z-10">
          <GlowCard
            glowColor={`${THEME_COLOR}40`}
            borderColor={`${THEME_COLOR}30`}
            className="max-w-2xl mx-auto"
          >
            <div className="p-8 md:p-12 text-center">
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
                <Trans
                  ns="contato"
                  i18nKey="cta_final.title"
                  components={{ highlight: <span style={{ color: THEME_COLOR }} /> }}
                />
              </h2>
              <p className="text-xl text-white/70 mb-10">
                {t('cta_final.text')}
              </p>
              <a
                href={whatsappUrlFinal}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-heading font-bold text-sm overflow-hidden transition-all duration-300 hover:scale-105"
                style={{
                  background: '#25D366',
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
                <span className="relative z-10 text-lg">{t('cta_final.button')}</span>
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
    </div>
  );
};

export default ContatoPage;
