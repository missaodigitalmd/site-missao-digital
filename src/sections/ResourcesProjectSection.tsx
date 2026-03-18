import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout';
import { AnimatedText } from '@/components/effects';
import { GlowCard } from '@/components/ui/GlowCard';
import { Modal } from '@/components/ui/Modal';
import { useScrollReveal } from '@/hooks';
import { Download, Sparkles, User, Phone, Mail, MapPin, Church, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';
import { getRecursos } from '@/services/recursos.service';
import { registrarDownloadRecurso } from '@/services/cadastros.service';
import { mapRecursoToUI, type RecursoUI } from '@/utils/recursosUi';

interface FormData {
  nome: string;
  whatsapp: string;
  email: string;
  cidade: string;
  igreja: string;
}

interface ResourcesProjectSectionProps {
  projectTag: string;
  title: string;
  subtitle?: string;
  themeColor?: string;
}

export const ResourcesProjectSection: React.FC<ResourcesProjectSectionProps> = ({ 
  projectTag, 
  title, 
  subtitle,
  themeColor = THEME_COLOR
}) => {
  const { t, i18n } = useTranslation('home');
  const { t: tc } = useTranslation('common');
  
  // Try to use recursos translation namespace if available for modal
  const { t: tr } = useTranslation('recursos');

  const [recursos, setRecursos] = useState<RecursoUI[]>([]);
  const [selectedRecurso, setSelectedRecurso] = useState<RecursoUI | null>(null);
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

  const [sectionRef, isVisible] = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  useEffect(() => {
    let mounted = true;

    const loadRecursos = async () => {
      setLoadingRecursos(true);
      const locale = (i18n.language?.split('-')[0] || 'pt') as 'pt' | 'en' | 'es';
      const data = await getRecursos(locale);
      if (!mounted) return;
      
      // Filter the resources for this specific project tag
      const projectRecursos = data
        .filter(r => r.tags?.some(tag => tag.toLowerCase() === projectTag.toLowerCase()))
        .map(mapRecursoToUI);
        
      setRecursos(projectRecursos);
      setLoadingRecursos(false);
    };

    loadRecursos();
    return () => {
      mounted = false;
    };
  }, [i18n.language, projectTag]);

  // Se não houver recursos após carregar, não renderiza a seção
  if (!loadingRecursos && recursos.length === 0) {
    return null;
  }

  const handleOpenModal = (recurso: RecursoUI) => {
    if (recurso.emBreve) return;
    setSelectedRecurso(recurso);
    setShowModal(true);
    setSubmitted(false);
    setLoading(false);
    setError(null);
    setModalDownloadUrl(null);
    setFormData({ nome: '', whatsapp: '', email: '', cidade: '', igreja: '' });
  };

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
      setError(tr('modal.error') || t('recursos_section.fill_data_desc'));
      return;
    }

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
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecurso(null);
    setSubmitted(false);
    setModalDownloadUrl(null);
  };

  return (
    <Section id={`recursos-${projectTag.toLowerCase()}`} ref={sectionRef} topFade bottomFade>
      <div className="relative z-10">
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ background: `${themeColor}15`, border: `1px solid ${themeColor}30` }}
          >
            <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
            <span className="text-sm font-medium" style={{ color: themeColor }}>Recursos</span>
          </div>

          <AnimatedText
            text={title}
            as="h2"
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          />
          {subtitle && (
            <p
              className={`text-lg text-white/60 max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-10">
          {loadingRecursos && (
            <div className="md:col-span-3 text-center text-white/60 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin"/> Carregando recursos...
            </div>
          )}
          {recursos.map((recurso, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <GlowCard
                glowColor={`${recurso.cor}30`}
                borderColor={`${recurso.cor}20`}
                className="h-full cursor-pointer group"
              >
                <div
                  className="h-full flex flex-col"
                  onClick={() => handleOpenModal(recurso)}
                >
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
                    <div
                      className="absolute bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${recurso.cor}30`, backdropFilter: 'blur(10px)' }}
                    >
                      <recurso.icone className="w-6 h-6" style={{ color: recurso.cor }} />
                    </div>
                    {recurso.emBreve && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-white/60">
                        {tr('card.em_breve') || "Em breve"}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-heading text-xl font-bold text-white mb-2 group-hover:text-brand-orange-light transition-colors">
                      {recurso.titulo}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-6 flex-grow">
                      {recurso.descricao}
                    </p>

                    {!recurso.emBreve && (
                      <button
                        className="inline-flex items-center justify-center w-full py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90 mt-auto"
                        style={{
                          backgroundColor: `${recurso.cor}20`,
                          color: recurso.cor,
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {tr('card.baixar') || t('recursos_section.download')}
                      </button>
                    )}
                  </div>
                </div>
              </GlowCard>
            </div>
          ))}
        </div>
      </div>

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

      {/* Download Modal - Advanced 2 Column Layout (Synced from RecursosPage) */}
      <Modal
        isOpen={showModal && !!selectedRecurso}
        onClose={handleCloseModal}
        size="xl"
      >
        {!submitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 -m-6">
            <div className="relative h-64 lg:h-auto">
              {selectedRecurso && (
                <>
                  <img
                    src={selectedRecurso.imagem}
                    alt={selectedRecurso.titulo}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.6) 50%, rgba(13,13,13,1) 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 p-8 flex flex-col">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 relative z-10"
                      style={{ backgroundColor: `${selectedRecurso.cor}30`, backdropFilter: 'blur(10px)' }}
                    >
                      {selectedRecurso.icone && <selectedRecurso.icone className="w-7 h-7" style={{ color: selectedRecurso.cor }} />}
                    </div>

                    <div className="flex-grow" />

                    <div className="relative z-10 space-y-4">
                      <h3 className="font-heading text-3xl font-bold text-white">
                        {selectedRecurso.titulo}
                      </h3>

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

            <div className="p-6 lg:p-8 bg-surface-card/50">
              <h4 className="font-heading text-lg font-bold text-white mb-2">
                {tr('modal.form_title') || t('recursos_section.fill_data')}
              </h4>
              <p className="text-white/60 text-sm mb-6">
                {tr('modal.form_subtitle') || t('recursos_section.fill_data_desc')}
              </p>
              <form onSubmit={handleDownload} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {tc('fields.nome')}
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                    placeholder={tc('fields.nome_placeholder')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {tc('fields.whatsapp')}
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                    placeholder={tc('fields.whatsapp_placeholder')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {tc('fields.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                    placeholder={tc('fields.email_placeholder')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {tc('fields.cidade')}
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                    placeholder={tc('fields.cidade_placeholder')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-2">
                    <Church className="w-4 h-4" />
                    {tc('fields.igreja')}
                  </label>
                  <input
                    type="text"
                    value={formData.igreja}
                    onChange={(e) => setFormData({ ...formData, igreja: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                    placeholder={tc('fields.igreja_placeholder')}
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
                    background: `linear-gradient(135deg, ${selectedRecurso?.cor || themeColor}, ${selectedRecurso?.cor ? selectedRecurso.cor + '99' : '#FF8C00'})`,
                    color: '#fff',
                  }}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {tr('modal.processando') || "Processando..."}</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" /> {tr('modal.baixar_agora') || t('recursos_section.download_now')}</>
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
              {(tr('modal.success_title', { name: formData.nome.split(' ')[0] }) as string) || 
               (t('recursos_section.success_title', { name: formData.nome.split(' ')[0] }) as string)}
            </h3>
            <p className="text-white/60 mb-2" dangerouslySetInnerHTML={{
              __html: (tr('modal.success_text', { resource: selectedRecurso?.titulo }) as string) || 
                      (t('recursos_section.success_download', { resource: selectedRecurso?.titulo }) as string)
            }} />
            <p className="text-white/40 text-sm">
              {(tr('modal.success_email', { email: formData.email }) as string) ||
               (t('recursos_section.success_email', { email: formData.email }) as string)}
            </p>
            {modalDownloadUrl && (
              <a
                href={modalDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-4 text-brand-orange-light hover:opacity-90"
              >
                {tr('card.baixar') || t('recursos_section.download')}
              </a>
            )}
          </div>
        )}
      </Modal>
    </Section>
  );
};

export default ResourcesProjectSection;
