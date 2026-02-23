import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout';
import { HeroStandard } from '@/components/effects';
import { GlowCard } from '@/components/ui/GlowCard';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from '@/router';
import { Download, ArrowRight, CheckCircle, User, Phone, Mail, MapPin, Church, Loader2, AlertCircle } from 'lucide-react';

import { THEME_COLOR } from '@/constants/theme';
import { registrarDownloadRecurso } from '@/services/cadastros.service';
import { getRecursos } from '@/services/recursos.service';
import { useDeepLink } from '@/hooks/useDeepLink';
import { mapRecursoToUI, formatDownloadCount, type RecursoUI } from '@/utils/recursosUi';

interface FormData {
  nome: string;
  whatsapp: string;
  email: string;
  cidade: string;
  igreja: string;
}

export const RecursosPage: React.FC = () => {
  const { t, i18n } = useTranslation('recursos');
  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(t('cta.whatsapp_message'))}`;

  const { navigate } = useRouter();
  const [recursos, setRecursos] = useState<RecursoUI[]>([]);
  const [selectedRecurso, setSelectedRecurso] = useState<RecursoUI | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingRecursos, setLoadingRecursos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalDownloadUrl, setModalDownloadUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    whatsapp: '',
    email: '',
    cidade: '',
    igreja: '',
  });
  const { deepLinkRecurso, consumeRecurso } = useDeepLink();

  useEffect(() => {
    let mounted = true;

    const loadRecursos = async () => {
      setLoadingRecursos(true);
      const locale = (i18n.language?.split('-')[0] || 'pt') as 'pt' | 'en' | 'es';
      const data = await getRecursos(locale);
      if (!mounted) return;
      setRecursos(data.map(mapRecursoToUI));
      setLoadingRecursos(false);
    };

    loadRecursos();
    return () => {
      mounted = false;
    };
  }, [i18n.language]);

  // Deep link: abre modal de download automaticamente
  useEffect(() => {
    if (!deepLinkRecurso) return;
    const recurso = recursos.find(r => r.slug === deepLinkRecurso || r.id === deepLinkRecurso);
    if (recurso && !recurso.emBreve) {
      handleOpenModal(recurso);
    }
    consumeRecurso();
  }, [deepLinkRecurso, consumeRecurso, recursos]);

  function handleOpenModal(recurso: RecursoUI) {
    if (recurso.emBreve) return;
    setSelectedRecurso(recurso);
    setShowModal(true);
    setSubmitted(false);
    setLoading(false);
    setError(null);
    setModalDownloadUrl(null);
    setFormData({ nome: '', whatsapp: '', email: '', cidade: '', igreja: '' });
  }

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecurso) return;
    setLoading(true);
    setError(null);

    const result = await registrarDownloadRecurso({
      recurso_id: selectedRecurso.id,
      arquivo_url: selectedRecurso.arquivo_url,
      nome: formData.nome,
      whatsapp: formData.whatsapp,
      email: formData.email,
      cidade: formData.cidade,
      igreja: formData.igreja,
    });

    setLoading(false);
    if (result.error) {
      setError(t('modal.error'));
    } else {
      setModalDownloadUrl(result.downloadUrl);
      setRecursos((prev) => prev.map((item) => (
        item.id === selectedRecurso.id
          ? { ...item, downloads_count: result.downloadsCount ?? item.downloads_count }
          : item
      )));
      setSubmitted(true);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecurso(null);
    setSubmitted(false);
    setModalDownloadUrl(null);
  };

  const filteredRecursos = activeFilter === 'todos'
    ? recursos
    : recursos.filter(r => r.categoria === activeFilter);

  const filters = ['todos', 'gamers', 'lideres', 'pais'] as const;

  return (
    <div className="min-h-screen bg-surface-primary">
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

      {/* Resources Grid */}
      <Section className="relative z-10 bg-surface-primary" imageSrc="/images/recursos-digital.jpg" overlayOpacity={0.9} gradientTint="linear-gradient(135deg, rgba(224,64,251,0.03) 0%, transparent 50%)">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-3 rounded-full font-heading font-bold text-lg transition-all duration-300 ${activeFilter === filter
                ? 'bg-brand-orange-light text-black shadow-lg shadow-brand-orange-light/20 scale-105'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
            >
              {t(`filters.${filter}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {loadingRecursos && (
            <div className="col-span-full text-center text-white/60">{t('modal.processando')}</div>
          )}
          {filteredRecursos.map((recurso, index) => (
            <GlowCard
              key={index}
              glowColor={`${recurso.cor}30`}
              borderColor={`${recurso.cor}20`}
              className="h-full cursor-pointer group"
            >
              <div
                className="h-full flex flex-col"
                onClick={() => handleOpenModal(recurso)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={recurso.imagem}
                    alt={recurso.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, rgba(13,13,13,0.9) 0%, transparent 50%)`,
                    }}
                  />
                  {/* Icon overlay */}
                  <div
                    className="absolute bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${recurso.cor}30`, backdropFilter: 'blur(10px)' }}
                  >
                    <recurso.icone className="w-6 h-6" style={{ color: recurso.cor }} />
                  </div>
                  {recurso.emBreve && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-white/60">
                      {t('card.em_breve')}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-heading text-2xl font-bold text-white mb-3 group-hover:text-brand-orange-light transition-colors">
                    {recurso.titulo}
                  </h3>
                  <p className="text-white/70 text-lg leading-relaxed mb-6 flex-grow">
                    {recurso.descricao}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <Download className="w-4 h-4 text-white/40" />
                    <span className="text-white/40 text-sm">
                      {formatDownloadCount(recurso.downloads_count, i18n.language)} downloads
                    </span>
                  </div>

                  {/* CTA */}
                  {!recurso.emBreve && (
                    <button
                      className="inline-flex items-center justify-center w-full py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90"
                      style={{
                        backgroundColor: `${recurso.cor}20`,
                        color: recurso.cor,
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('card.baixar')}
                    </button>
                  )}
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </Section>

      {/* Quer Mais */}
      <Section>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/80 leading-relaxed mb-10">
            {t('cta.text')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate('projetos')}
              className="inline-flex items-center justify-center px-10 py-5 rounded-xl font-heading font-bold text-lg transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)`,
                color: '#000',
              }}
            >
              {t('cta.button_projects')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-10 py-5 rounded-xl font-heading font-bold text-lg border border-white/20 text-white btn-shine transition-all"
            >
              {t('cta.button_contact')}
            </a>
          </div>
        </div>
      </Section>

      {/* Download Modal - Advanced 2 Column Layout */}
      <Modal
        isOpen={showModal && !!selectedRecurso}
        onClose={handleCloseModal}
        size="xl"
      >
        {!submitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 -m-6">
            {/* Column 1: Visual Content */}
            <div className="relative h-64 lg:h-auto">
              {selectedRecurso && (
                <>
                  <img
                    src={selectedRecurso.imagem}
                    alt={selectedRecurso.titulo}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient overlay for text readability - Increased strength and range */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.6) 50%, rgba(13,13,13,1) 100%)`,
                    }}
                  />
                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 relative z-10"
                      style={{ backgroundColor: `${selectedRecurso.cor}30`, backdropFilter: 'blur(10px)' }}
                    >
                      {selectedRecurso.icone && <selectedRecurso.icone className="w-7 h-7" style={{ color: selectedRecurso.cor }} />}
                    </div>

                    {/* Spacer to push everything to bottom */}
                    <div className="flex-grow" />

                    {/* Bottom Container: Title + Scrollable Description */}
                    <div className="relative z-10 space-y-4">
                      <h3 className="font-heading text-3xl font-bold text-white">
                        {selectedRecurso.titulo}
                      </h3>

                      {/* Only description scrolls */}
                      <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-white/80 text-lg leading-relaxed">
                          {selectedRecurso.descricao_completa}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Column 2: Form */}
            <div className="p-6 lg:p-8 bg-surface-card/50">
              <h4 className="font-heading text-lg font-bold text-white mb-2">
                {t('modal.form_title')}
              </h4>
              <p className="text-white/60 text-sm mb-6">
                {t('modal.form_subtitle')}
              </p>
              <form onSubmit={handleDownload} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t('form.nome')}
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                    placeholder={t('form.placeholders.nome')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                    placeholder={t('form.placeholders.whatsapp')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('form.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                    placeholder={t('form.placeholders.email')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t('form.cidade')}
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                    placeholder={t('form.placeholders.cidade')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-2">
                    <Church className="w-4 h-4" />
                    {t('form.igreja')}
                  </label>
                  <input
                    type="text"
                    value={formData.igreja}
                    onChange={(e) => setFormData({ ...formData, igreja: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                    placeholder={t('form.placeholders.igreja')}
                    required
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-heading font-bold text-sm transition-all hover:scale-[1.02] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${selectedRecurso?.cor || THEME_COLOR}, ${selectedRecurso?.cor ? selectedRecurso.cor + '99' : '#FF8C00'})`,
                    color: '#fff',
                  }}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('modal.processando')}</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" /> {t('modal.baixar_agora')}</>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: `${selectedRecurso?.cor}20` }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: selectedRecurso?.cor || '#4CAF50' }} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-white mb-3">
              {t('modal.success_title', { name: formData.nome.split(' ')[0] })}
            </h3>
            <p className="text-white/60 mb-2">
              {t('modal.success_text', { resource: selectedRecurso?.titulo })}
            </p>
            <p className="text-white/40 text-sm">
              {t('modal.success_email', { email: formData.email })}
            </p>
            {modalDownloadUrl && (
              <a
                href={modalDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-4 text-brand-orange-light hover:opacity-90"
              >
                {t('card.baixar')}
              </a>
            )}
          </div>
        )}
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 172, 19, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 172, 19, 0.5);
        }
      `}</style>
    </div>
  );
};

export default RecursosPage;
