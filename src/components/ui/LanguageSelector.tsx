import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const languages = [
    { code: 'pt', flag: '🇧🇷', label: 'PT' },
    { code: 'en', flag: '🇺🇸', label: 'EN' },
    { code: 'es', flag: '🇪🇸', label: 'ES' },
];

interface LanguageSelectorProps {
    variant?: 'navbar' | 'footer';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'navbar' }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        // Atualiza a URL sem recarregar
        const url = new URL(window.location.href);
        url.searchParams.set('lang', langCode);
        window.history.replaceState({}, '', url.toString());
        setIsOpen(false);
    };

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (variant === 'footer') {
        return (
            <div className="flex items-center gap-2">
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${i18n.language === lang.code
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                            }`}
                    >
                        {lang.flag} {lang.label}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                data-cursor="pointer"
            >
                <Globe className="w-4 h-4" />
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.label}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-surface-card/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in z-50">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-all duration-200 text-left ${i18n.language === lang.code
                                    ? 'text-white bg-white/10'
                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-medium">{lang.label}</span>
                            {i18n.language === lang.code && (
                                <Check className="w-4 h-4 ml-auto text-brand-orange-light" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
