import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from '@/router';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface NavbarProps {
  transparent?: boolean;
}

const navLinks = [
  { labelKey: 'nav.home', route: 'home' as const },
  { labelKey: 'nav.quem_somos', route: 'quem-somos' as const },
  {
    labelKey: 'nav.projetos',
    route: 'projetos' as const,
    dropdown: [
      { labelKey: 'nav_dropdown.daod', route: 'projetos/daod' as const, color: '#E040FB', descriptionKey: 'nav_dropdown.daod_desc' },
      { labelKey: 'nav_dropdown.gank', route: 'projetos/gank' as const, color: '#B388FF', descriptionKey: 'nav_dropdown.gank_desc' },
      { labelKey: 'nav_dropdown.ninive', route: 'projetos/ninive-digital' as const, color: '#FFD740', descriptionKey: 'nav_dropdown.ninive_desc' },
      { labelKey: 'nav_dropdown.campeonato', route: 'projetos/campeonatos-evangelisticos' as const, color: '#FF5252', descriptionKey: 'nav_dropdown.campeonato_desc' },
    ],
  },
  { labelKey: 'nav.imersao', route: 'imersao-missionaria' as const },
  { labelKey: 'nav.recursos', route: 'recursos' as const },
  { labelKey: 'nav.apoie', route: 'apoie' as const },
  { labelKey: 'nav.contato', route: 'contato' as const },
];

export const Navbar: React.FC<NavbarProps> = ({ transparent = true }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { navigate, currentRoute } = useRouter();
  const { t } = useTranslation('common');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (route: string) => {
    navigate(route as any);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  // Check if a route is active
  const isActiveRoute = (route: string) => {
    return currentRoute === route;
  };

  // Check if any project route is active
  const isProjectRouteActive = () => {
    return currentRoute?.startsWith('projetos/');
  };

  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('nav.whatsapp_message'))}`;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || !transparent
          ? 'bg-surface-primary/90 backdrop-blur-xl py-3 shadow-lg shadow-black/10'
          : 'bg-transparent py-5'
          }`}
      >
        {/* Progress bar on scroll */}
        <div
          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-brand-orange-light via-brand-magenta to-brand-cyan transition-all duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            width: isScrolled ? '100%' : '0%',
            transition: 'width 0.3s ease-out, opacity 0.3s ease-out',
          }}
        />

        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => handleNavigate('home')}
              className="group flex items-center gap-2"
              data-cursor="pointer"
            >
              {/* Desktop Horizontal Logo */}
              <img
                src="/images/logo-horizontal.svg"
                alt="Missão Digital"
                className="hidden sm:block h-12 w-auto group-hover:scale-105 transition-transform duration-300"
              />

              {/* Mobile Icon Logo */}
              <img
                src="/images/icone.svg"
                alt="Missão Digital"
                className="block sm:hidden h-10 w-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
              />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = isActiveRoute(link.route);
                const isProjectActive = link.route === 'projetos' && isProjectRouteActive();
                const showActive = isActive || isProjectActive;

                return (
                  <div
                    key={link.route}
                    className="relative"
                    onMouseEnter={link.dropdown ? handleDropdownEnter : undefined}
                    onMouseLeave={link.dropdown ? handleDropdownLeave : undefined}
                  >
                    {link.dropdown ? (
                      <>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleNavigate(link.route)}
                            className={`text-sm font-medium transition-all duration-300 ${showActive ? 'text-white' : 'text-white/80 hover:text-white'
                              }`}
                            data-cursor="pointer"
                          >
                            {/* Active indicator dot */}
                            {showActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange-light animate-pulse mr-1 inline-block" />
                            )}
                            {t(link.labelKey)}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              isDropdownOpen ? setIsDropdownOpen(false) : handleDropdownEnter();
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>

                        {/* Active underline for projects */}
                        {showActive && (
                          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-orange-light to-brand-magenta rounded-full" />
                        )}

                        {isDropdownOpen && (
                          <div
                            className="absolute top-full left-0 mt-3 w-64 bg-surface-card/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in"
                            onMouseEnter={handleDropdownEnter}
                            onMouseLeave={handleDropdownLeave}
                          >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-brand-orange-light/5 to-transparent pointer-events-none" />

                            {link.dropdown.map((item) => {
                              const isItemActive = isActiveRoute(item.route);
                              return (
                                <button
                                  key={item.route}
                                  onClick={() => handleNavigate(item.route)}
                                  onMouseEnter={() => setHoveredDropdownItem(item.route)}
                                  onMouseLeave={() => setHoveredDropdownItem(null)}
                                  className={`relative flex items-center gap-3 w-full px-4 py-3 text-sm transition-all duration-300 text-left ${isItemActive
                                    ? 'text-white bg-white/10'
                                    : 'text-white/80 hover:text-white hover:bg-white/5'
                                    }`}
                                  data-cursor="pointer"
                                >
                                  {/* Active indicator for dropdown item */}
                                  {isItemActive && (
                                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange-light" />
                                  )}

                                  {/* Left accent line on hover */}
                                  <div
                                    className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${hoveredDropdownItem === item.route && !isItemActive ? 'opacity-100' : 'opacity-0'
                                      }`}
                                    style={{ backgroundColor: item.color }}
                                  />

                                  <span
                                    className={`w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300 ${isItemActive ? 'ring-2 ring-offset-1 ring-offset-surface-card' : ''
                                      }`}
                                    style={{
                                      backgroundColor: item.color,
                                      boxShadow: hoveredDropdownItem === item.route || isItemActive ? `0 0 10px ${item.color}` : 'none',
                                      '--tw-ring-color': isItemActive ? item.color : 'transparent',
                                    } as React.CSSProperties}
                                  />
                                  <div>
                                    <span className="block font-medium">{t(item.labelKey)}</span>
                                    <span className="block text-xs text-white/40">{t(item.descriptionKey)}</span>
                                  </div>

                                  {/* Checkmark for active */}
                                  {isItemActive && (
                                    <span className="ml-auto text-brand-orange-light">✓</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleNavigate(link.route)}
                        className={`text-sm font-medium transition-colors relative group ${isActive ? 'text-white' : 'text-white/80 hover:text-white'
                          }`}
                        data-cursor="pointer"
                      >
                        {/* Active indicator dot */}
                        {isActive && (
                          <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-orange-light animate-pulse" />
                        )}
                        {t(link.labelKey)}
                        <span
                          className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-brand-orange-light to-brand-magenta rounded-full transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                            }`}
                        />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA Button + Language Selector */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSelector variant="navbar" />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center px-5 py-2.5 rounded-xl font-medium text-sm overflow-hidden transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                }}
                data-cursor="pointer"
              >
                {/* Shine effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                    animation: 'shine 2s ease-in-out infinite',
                  }}
                />
                <MessageCircle className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">{t('nav.fale_conosco')}</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-brand-orange-light transition-colors"
              aria-label={t('nav.toggle_menu')}
              data-cursor="pointer"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute left-0 w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'top-3 rotate-45' : 'top-1'
                    }`}
                />
                <span
                  className={`absolute left-0 top-3 w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                />
                <span
                  className={`absolute left-0 w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'top-3 -rotate-45' : 'top-5'
                    }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-16 left-0 right-0 bg-surface-card border-b border-white/10 p-4 max-h-[80vh] overflow-y-auto transition-all duration-500 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
            }`}
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full mb-4"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t('nav.fale_conosco_whatsapp')}
          </a>

          <div className="space-y-1">
            {navLinks.map((link, index) => {
              const isActive = isActiveRoute(link.route);
              const isProjectActive = link.route === 'projetos' && isProjectRouteActive();

              return (
                <div
                  key={link.route}
                  className={`transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {link.dropdown ? (
                    <div className="py-2">
                      <span className={`text-sm font-medium px-3 flex items-center gap-2 ${isProjectActive ? 'text-brand-orange-light' : 'text-white/60'}`}>
                        {isProjectActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-orange-light animate-pulse" />}
                        {t(link.labelKey)}
                      </span>
                      <div className="mt-1 space-y-1">
                        {link.dropdown.map((item) => {
                          const isItemActive = isActiveRoute(item.route);
                          return (
                            <button
                              key={item.route}
                              onClick={() => handleNavigate(item.route)}
                              className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors text-left ${isItemActive
                                ? 'text-white bg-white/10'
                                : 'text-white/80 hover:text-white hover:bg-white/5'
                                }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${isItemActive ? 'ring-2 ring-offset-1 ring-offset-surface-card' : ''}`}
                                style={{ backgroundColor: item.color, '--tw-ring-color': item.color } as React.CSSProperties}
                              />
                              {t(item.labelKey)}
                              {isItemActive && <span className="ml-auto text-brand-orange-light text-xs">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavigate(link.route)}
                      className={`flex items-center gap-2 w-full text-left px-3 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                        ? 'text-white bg-white/10'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-orange-light animate-pulse" />}
                      {t(link.labelKey)}
                      {isActive && <span className="ml-auto text-brand-orange-light text-xs">✓</span>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Language Selector in Mobile */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <LanguageSelector variant="footer" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
