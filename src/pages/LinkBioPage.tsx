import { useEffect } from 'react';
import {
  FloatingParticles,
  LinkBioHero,
  BibleVerse,
  LanguageSelector,
  SocialCard,
} from '../components/linkbio';
import { socialCards } from '../data/linkbioData';

export function LinkBioPage() {
  const [siteCard, ...networkCards] = socialCards;

  // Remove site's grid background body style for this page
  useEffect(() => {
    document.body.classList.add('linkbio-body');
    return () => {
      document.body.classList.remove('linkbio-body');
    };
  }, []);

  return (
    <div className="linkbio-page">
      {/* Ambient particles */}
      <FloatingParticles />

      {/* Scroll container */}
      <main className="linkbio-scroll-container" aria-label="Página de links Missão Digital">
        {/* Logo */}
        <header className="linkbio-header" role="banner">
          <img
            src="/images/logo-horizontal.svg"
            alt="Missão Digital"
            className="linkbio-logo"
            fetchPriority="high"
          />
        </header>

        {/* Hero + WhatsApp CTA */}
        <LinkBioHero />

        {/* Site card */}
        {siteCard && (
          <section className="linkbio-site-section" aria-label="Site Missão Digital">
            <SocialCard card={siteCard} animationDelay={80} />
          </section>
        )}

        {/* Social cards list */}
        <section
          className="linkbio-cards-section"
          aria-label="Nossas redes sociais"
        >
          {networkCards.map((card, idx) => (
            <SocialCard
              key={card.id}
              card={card}
              animationDelay={120 + idx * 80}
            />
          ))}
        </section>

        {/* Language selector */}
        <LanguageSelector />

        {/* Bible verse footer */}
        <BibleVerse />
      </main>
    </div>
  );
}
