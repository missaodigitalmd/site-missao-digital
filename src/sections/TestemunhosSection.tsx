import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout';
import { AnimatedText } from '@/components/effects';
import { useScrollReveal } from '@/hooks';
import { Quote, Star } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';
import { getDepoimentos } from '@/services/depoimentos.service';

export const TestemunhosSection: React.FC = () => {
  const { t, i18n } = useTranslation('home');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [sectionRef, isVisible] = useScrollReveal<HTMLElement>({ threshold: 0.2 });
  const [testemunhos, setTestemunhos] = useState<Array<{
    nome: string;
    estado: string;
    bandeira: string;
    bandeiraNacao?: string | null;
    foto: string;
    texto: string;
    rating: number;
  }>>([]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      const locale = (i18n.language?.split('-')[0] || 'pt') as 'pt' | 'en' | 'es';
      const data = await getDepoimentos(locale);
      if (!mounted) return;

      // Group testimonials by author to ensure unique people
      const byAuthor = data.reduce((acc, curr) => {
        if (!acc[curr.autor]) acc[curr.autor] = [];
        acc[curr.autor].push(curr);
        return acc;
      }, {} as Record<string, typeof data>);

      // Pick one random testimonial for each author
      const uniqueTestimonials = Object.values(byAuthor).map(authorList => {
        return authorList[Math.floor(Math.random() * authorList.length)];
      });

      // Shuffle the unique authors and take 3
      const mapped = uniqueTestimonials
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((item) => ({
          nome: item.autor,
          estado: item.cidade || 'Brasil',
          bandeira: item.bandeira_estado || item.bandeira_nacao || 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg',
          bandeiraNacao: item.bandeira_nacao,
          foto: item.avatar_url || '/images/carlos.webp',
          texto: item.texto,
          rating: 5,
        }));

      setTestemunhos(mapped);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [i18n.language]);

  return (
    <Section id="testemunhos" imageSrc="/images/campo-digital.jpg" overlayOpacity={0.9} gradientTint="linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, transparent 30%, transparent 70%, rgba(13,13,13,0.3) 100%)" ref={sectionRef} topFade bottomFade parallax>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(255, 172, 19, 0.5) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float-orb 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(224, 64, 251, 0.4) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'float-orb 10s ease-in-out infinite reverse',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-light/10 border border-brand-orange-light/20 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            <Star className="w-4 h-4 text-brand-orange-light fill-brand-orange-light" />
            <span className="text-sm text-brand-orange-light font-medium">{t('testemunhos.badge')}</span>
          </div>

          <AnimatedText
            text={t('testemunhos.title')}
            as="h2"
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          />
          <p
            className={`text-lg text-white/60 max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            {t('testemunhos.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-8">
          {testemunhos.map((testemunho, index) => (
            <div
              key={index}
              className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Glow effect */}
              <div
                className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${hoveredIndex === index ? 'bg-brand-orange-light/20' : ''
                  }`}
              />

              <div className="relative glass-card rounded-2xl p-6 h-full flex flex-col hover:border-brand-orange-light/30 transition-all duration-300 overflow-hidden">
                {/* Quote decoration */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote className="w-16 h-16 text-brand-orange-light" />
                </div>

                {/* Accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-0.5 transition-all duration-500"
                  style={{
                    background: `linear-gradient(to right, ${THEME_COLOR}, transparent)`,
                    width: hoveredIndex === index ? '50%' : '20%',
                  }}
                />

                {/* Quote icon */}
                <div className="relative w-12 h-12 rounded-xl bg-brand-orange-light/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-orange-light/20 transition-all duration-300">
                  <Quote className="w-6 h-6 text-brand-orange-light" />
                </div>

                {/* Rating stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testemunho.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-brand-orange-light fill-brand-orange-light"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-white/70 leading-relaxed mb-6 flex-grow relative z-10 italic">
                  &ldquo;{testemunho.texto}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <div className="relative">
                    <img
                      src={testemunho.foto}
                      alt={testemunho.nome}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-brand-orange-light/50 transition-all duration-300 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-orange-light flex items-center justify-center border-2 border-surface-primary overflow-hidden">
                      {testemunho.bandeiraNacao?.startsWith('http') ? (
                        <img src={testemunho.bandeiraNacao} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] leading-none">{testemunho.bandeiraNacao || '🇧🇷'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-white group-hover:text-brand-orange-light transition-colors">
                      {testemunho.nome}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <img
                        src={testemunho.bandeira}
                        alt={testemunho.estado}
                        className="w-4 h-auto rounded-sm opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <span className="text-white/50 text-xs font-medium uppercase tracking-wider">{testemunho.estado}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>

      <style>{`
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
      `}</style>
    </Section>
  );
};

export default TestemunhosSection;
