import { useState } from 'react';

type Lang = 'PT' | 'EN' | 'ES';

const languages: { code: Lang; label: string; flag: string }[] = [
  { code: 'PT', label: 'Português', flag: '🇧🇷' },
  { code: 'EN', label: 'English', flag: '🇺🇸' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
];

export function LanguageSelector() {
  const [active, setActive] = useState<Lang>('PT');

  return (
    <div className="linkbio-lang-section text-center px-4 py-8">
      <p className="linkbio-lang-title mb-5">
        Conheça nossas redes nos outros idiomas
      </p>
      <div className="flex items-center justify-center gap-3">
        {languages.map(({ code, label, flag }) => (
          <button
            key={code}
            onClick={() => setActive(code)}
            aria-label={label}
            className={`linkbio-lang-btn ${active === code ? 'linkbio-lang-btn--active' : ''}`}
          >
            <span className="text-lg">{flag}</span>
            <span className="ml-1.5 font-bold tracking-wider text-sm">{code}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
