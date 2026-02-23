import React from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout';
import { AnimatedText } from '@/components/effects';
import { useRouter } from '@/router';
import { MessageCircle, ArrowRight, Eye, Wrench, Rocket } from 'lucide-react';

import { THEME_COLOR } from '@/constants/theme';

export const ImersaoSection: React.FC = () => {
  const { t } = useTranslation('home');
  const { navigate } = useRouter();
  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('imersao.whatsapp_message'))}`;

  const tripePills = [
    { icon: Eye, label: t('imersao.pill_1') },
    { icon: Wrench, label: t('imersao.pill_2') },
    { icon: Rocket, label: t('imersao.pill_3') },
  ];

  return (
    <Section
      id="imersao"
      imageSrc="/images/imersao-missao.jpg"
      overlayOpacity={0.85}
      gradientTint="linear-gradient(to right, rgba(13,13,13,0.4) 0%, transparent 60%)"
      topFade
      bottomFade
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
        {/* Content: 3 cols */}
        <div className="lg:col-span-3">
          <AnimatedText
            text={t('imersao.title')}
            as="h2"
            className="font-heading text-3xl md:text-4xl font-bold text-white mb-6"
          />

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            {t('imersao.description')}
          </p>

          <p className="text-white/60 leading-relaxed mb-6">
            {t('imersao.highlight')}
          </p>

          {/* Tripé pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            {tripePills.map((pill) => (
              <div
                key={pill.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: `${THEME_COLOR}12`, border: `1px solid ${THEME_COLOR}25`, color: THEME_COLOR }}
              >
                <pill.icon className="w-4 h-4" />
                {pill.label}
              </div>
            ))}
          </div>



          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {t('imersao.cta')}
            </a>
            <button
              onClick={() => navigate('imersao-missionaria')}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
            >
              {t('imersao.cta_secondary')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Image: 2 cols */}
        <div className="lg:col-span-2 relative">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="/images/imersao-missao.jpg"
              alt={t('imersao.badge')}
              className="w-full h-auto object-cover image-breathe"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-primary/40 to-transparent" />
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 border-2 rounded-2xl -z-10" style={{ borderColor: `${THEME_COLOR}20` }} />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl -z-10" style={{ background: `${THEME_COLOR}08` }} />
        </div>
      </div>
    </Section>
  );
};

export default ImersaoSection;
