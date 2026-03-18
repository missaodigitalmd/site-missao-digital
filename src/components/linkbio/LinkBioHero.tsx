
import { SocialIcon } from './SocialIcon';
import { WHATSAPP_LINK } from '../../data/linkbioData';

export function LinkBioHero() {
  return (
    <section className="linkbio-hero" aria-label="Chamada principal">
      {/* Hero background image */}
      <div className="linkbio-hero-bg" aria-hidden="true">
        <img
          src="/images/linkbio/herolinkbio.webp"
          alt=""
          className="linkbio-hero-img"
          fetchPriority="high"
        />
        <div className="linkbio-hero-overlay" />
      </div>

      {/* WhatsApp CTA Card */}
      <div className="linkbio-hero-card linkbio-hero-card--enter">
        <div className="linkbio-hero-card-inner">
          {/* Pulsing border wrapper */}
          <span className="linkbio-hero-border-pulse" aria-hidden="true" />

          <div className="linkbio-hero-icon" aria-hidden="true">
            <SocialIcon type="whatsapp" size={48} color="#25D366" />
          </div>

          <h2 className="linkbio-hero-title">
            Bora trocar ideia, jogar junto e conhecer a Jesus?
          </h2>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            id="linkbio-whatsapp-cta"
            className="linkbio-hero-cta-btn"
            aria-label="Entrar no grupo do WhatsApp da Missão Digital"
          >
            <SocialIcon type="whatsapp" size={20} color="white" />
            <span>ENTRAR NO GRUPO</span>
          </a>
        </div>
      </div>
    </section>
  );
}
