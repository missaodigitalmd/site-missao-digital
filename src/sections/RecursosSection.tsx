import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout';
import { AnimatedText } from '@/components/effects';
import { GlowCard } from '@/components/ui/GlowCard';
import { Modal } from '@/components/ui/Modal';
import { useScrollReveal } from '@/hooks';
import { useRouter } from '@/router';
import { Download, ArrowRight, Sparkles, User, Phone, Mail, MapPin, Church, CheckCircle } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';
import { getRecursos } from '@/services/recursos.service';
import { registrarDownloadRecurso } from '@/services/cadastros.service';
import { mapRecursoToUI, formatDownloadCount, type RecursoUI } from '@/utils/recursosUi';

interface FormData {
  nome: string;
  whatsapp: string;
  email: string;
  cidade: string;
  igreja: string;
}

export const RecursosSection: React.FC = () => {
  const { t, i18n } = useTranslation('home');
  const { t: tc } = useTranslation('common');
  const { navigate } = useRouter();
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

  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [sectionRef, isVisible] = useScrollReveal<HTMLElement>({ threshold: 0.2 });

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

  const recursosHome = recursos.slice(0, 3);

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
      setError(t('recursos_section.fill_data_desc'));
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Section id="recursos" imageSrc="/images/recursos-digital.jpg" overlayOpacity={0.9} gradientTint="linear-gradient(135deg, rgba(224,64,251,0.03) 0%, transparent 60%)" ref={sectionRef} topFade bottomFade parallax>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating gradient orb */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(224, 64, 251, 0.3) 0%, transparent 60%)',
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => {
          const color = recursosHome[i % Math.max(recursosHome.length, 1)]?.cor || '#E040FB';
          return (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: color,
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
                opacity: 0.3,
                animation: `float-particle ${5 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-light/10 border border-brand-orange-light/20 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            <Sparkles className="w-4 h-4 text-brand-orange-light" />
            <span className="text-sm text-brand-orange-light font-medium">{t('recursos_section.badge')}</span>
          </div>

          <AnimatedText
            text={t('recursos_section.title')}
            as="h2"
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          />
          <p
            className={`text-lg text-white/60 max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            {t('recursos_section.description')}
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-10">
          {loadingRecursos && (
            <div className="md:col-span-3 text-center text-white/60">{t('recursos_section.description')}</div>
          )}
          {recursosHome.map((recurso, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
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
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-heading text-xl font-bold text-white mb-2 group-hover:text-brand-orange-light transition-colors">
                      {recurso.titulo}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-6 flex-grow">
                      {recurso.descricao}
                    </p>

                    {/* Download count */}
                    <div className="flex items-center gap-2 mb-4">
                      <Download className="w-4 h-4 text-white/40" />
                      <span className="text-white/40 text-sm">{formatDownloadCount(recurso.downloads_count, i18n.language)} downloads</span>
                    </div>

                    {/* CTA Button */}
                    <button
                      className="inline-flex items-center justify-center w-full py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90 mt-auto"
                      style={{
                        backgroundColor: `${recurso.cor}20`,
                        color: recurso.cor,
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('recursos_section.download')}
                    </button>
                  </div>
                </div>
              </GlowCard>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <button
            onClick={() => navigate('recursos')}
            className="inline-flex items-center text-white/60 hover:text-white transition-colors group hover-line hover-line-base"
          >
            {t('recursos_section.cta')}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-15px) rotate(180deg); opacity: 0.5; }
        }
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

      {/* Download Modal - Same as RecursosPage */}
      <Modal
        isOpen={showModal && !!selectedRecurso}
        onClose={handleCloseModal}
        size="xl"
      >
        {!submitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 -m-6">
            {/* Column 1: Visual Content */}
            <div className="relative h-64 lg:h-auto overflow-hidden">
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
                      background: `linear-gradient(to bottom, rgba(13,13,13,0.7) 0%, rgba(13,13,13,0.4) 40%, rgba(13,13,13,0.9) 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 p-6 flex flex-col">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${selectedRecurso.cor}30`, backdropFilter: 'blur(10px)' }}
                    >
                      <selectedRecurso.icone className="w-7 h-7" style={{ color: selectedRecurso.cor }} />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white mb-2">
                      {selectedRecurso.titulo}
                    </h3>
                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                      <p className="text-white/80 leading-relaxed text-sm">
                        {selectedRecurso.descricao_completa}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Column 2: Form */}
            <div className="p-6 lg:p-8 bg-surface-card/50">
              <h4 className="font-heading text-lg font-bold text-white mb-2">
                {t('recursos_section.fill_data')}
              </h4>
              <p className="text-white/60 text-sm mb-6">
                {t('recursos_section.fill_data_desc')}
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-heading font-bold text-sm transition-all hover:scale-[1.02] flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${selectedRecurso?.cor || THEME_COLOR}, ${selectedRecurso?.cor ? selectedRecurso.cor + '99' : '#FF8C00'})`,
                    color: '#fff',
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('recursos_section.download_now')}
                </button>
                {error && <p className="text-red-400 text-sm">{error}</p>}
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
              {t('recursos_section.success_title', { name: formData.nome.split(' ')[0] })}
            </h3>
            <p className="text-white/60 mb-2" dangerouslySetInnerHTML={{
              __html: t('recursos_section.success_download', { resource: selectedRecurso?.titulo })
            }} />
            <p className="text-white/40 text-sm">
              {t('recursos_section.success_email', { email: formData.email })}
            </p>
            {modalDownloadUrl && (
              <a
                href={modalDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-4 text-brand-orange-light hover:opacity-90"
              >
                {t('recursos_section.download')}
              </a>
            )}
          </div>
        )}
      </Modal>
    </Section>
  );
};

export default RecursosSection;
