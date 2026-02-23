import React, { useState, useEffect, useRef } from 'react';
import { Instagram, MessageCircle, Video, Heart, ArrowUpRight, Copy, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from '@/router';
import { THEME_COLOR } from '@/constants/theme';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

const navLinks = [
  { labelKey: 'nav.home', route: 'home' as const },
  { labelKey: 'nav.quem_somos', route: 'quem-somos' as const },
  { labelKey: 'nav.projetos', route: 'projetos' as const },
  { labelKey: 'nav.imersao', route: 'imersao-missionaria' as const },
  { labelKey: 'nav.recursos', route: 'recursos' as const },
  { labelKey: 'nav.apoie', route: 'apoie' as const },
  { labelKey: 'nav.contato', route: 'contato' as const },
];

const socialLinks = [
  {
    label: '@missaodigitalmd',
    href: 'https://instagram.com/missaodigitalmd',
    icon: Instagram,
    color: '#E4405F',
  },
  {
    label: '@navarrolamounier',
    href: 'https://instagram.com/navarrolamounier',
    icon: Instagram,
    color: '#E4405F',
  },
  {
    label: '@terezagontijo',
    href: 'https://instagram.com/terezagontijo',
    icon: Instagram,
    color: '#E4405F',
  },
  {
    label: '@missaodigitalmd',
    href: 'https://tiktok.com/@missaodigitalmd',
    icon: Video,
    color: '#000000',
  },
];

export const Footer: React.FC = () => {
  const { navigate } = useRouter();
  const { t } = useTranslation('common');
  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('footer.whatsapp_message'))}`;
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleNavigate = (route: string) => {
    navigate(route as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText('61993978989');
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <footer ref={footerRef} className="relative bg-surface-secondary border-t border-white/5 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient orb */}
        <div
          className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(255, 172, 19, 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, rgba(224, 64, 251, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="container-custom py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div
            className={`lg:col-span-1 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div className="mb-6">
              <img
                src="/images/logo-vertical.svg"
                alt="Missão Digital"
                className="h-24 w-auto hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Navigation */}
          <div
            className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <h4 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-brand-orange-light rounded-full" />
              {t('footer.menu')}
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.route}>
                  <button
                    onClick={() => handleNavigate(link.route)}
                    onMouseEnter={() => setHoveredLink(link.route)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="group flex items-center text-sm text-white/60 hover:text-white transition-all duration-300"
                    data-cursor="pointer"
                  >
                    <span
                      className={`w-0 h-0.5 bg-brand-orange-light rounded-full mr-0 transition-all duration-300 ${hoveredLink === link.route ? 'w-3 mr-2' : ''
                        }`}
                    />
                    {t(link.labelKey)}
                    <ArrowUpRight
                      className={`w-3 h-3 ml-1 transition-all duration-300 ${hoveredLink === link.route ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                        }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div
            className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <h4 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-brand-orange-light rounded-full" />
              {t('footer.social')}
            </h4>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm text-white/60 hover:text-white transition-all duration-300"
                    data-cursor="pointer"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${link.color}15` }}
                    >
                      <link.icon
                        className="w-4 h-4 transition-colors"
                        style={{ color: link.color }}
                      />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-sm text-whatsapp hover:text-whatsapp/80 transition-all duration-300"
                data-cursor="pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4 text-whatsapp" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform">+55 62 8642-5598</span>
              </a>

              {/* PIX */}
              <button
                onClick={handleCopyPix}
                className="group flex items-center gap-2 text-sm text-white/60 hover:text-white transition-all duration-300"
                data-cursor="pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-orange-light/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-xs font-bold" style={{ color: THEME_COLOR }}>PIX</span>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="font-mono">{copiedPix ? t('footer.pix_copied') : '61993978989'}</span>
                  <span className="text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedPix ? t('footer.pix_copied_success') : t('footer.pix_copy_key')}
                  </span>
                </div>
                <div className="ml-auto">
                  {copiedPix ? (
                    <CheckCircle className="w-4 h-4 text-green-500 animate-in fade-in zoom-in duration-300" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Verse */}
          <div
            className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <h4 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-brand-orange-light rounded-full" />
              {t('footer.verse_title')}
            </h4>
            <blockquote className="relative">
              <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-orange-light via-brand-magenta to-transparent rounded-full" />
              <p className="text-sm text-white/60 italic leading-relaxed pl-4">
                &ldquo;{t('footer.verse_text')}&rdquo;
              </p>
              <cite className="block mt-3 text-brand-orange-light/70 text-sm not-italic pl-4">
                {t('footer.verse_ref')}
              </cite>
            </blockquote>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <p className="text-xs text-white/40">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            <LanguageSelector variant="footer" />
            <p className="text-xs text-white/40 flex items-center gap-1">
              {t('footer.made_with')} <Heart className="w-3 h-3 text-red-400 fill-red-400 animate-pulse" /> {t('footer.and_purpose')}
            </p>
          </div>
        </div>
      </div >
    </footer >
  );
};

export default Footer;
