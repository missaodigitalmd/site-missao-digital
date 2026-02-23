import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Sparkles, HandHeart, User, Phone, Mail, HandCoins, ArrowRight, Heart, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';
import { upsertParceiro } from '@/services/cadastros.service';
import { InternationalPhoneInput } from '@/components/ui/phone-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

interface ParceriaFormData {
    nome: string;
    whatsapp: string;
    email: string;
    valor: string;
    intercessor: boolean;
}

interface ParceriaMensalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToOferta: () => void;
}

export const ParceriaMensalModal: React.FC<ParceriaMensalModalProps> = ({
    isOpen,
    onClose,
    onSwitchToOferta
}) => {
    const { t } = useTranslation('apoie');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ParceriaFormData>({
        nome: '',
        whatsapp: '',
        email: '',
        valor: '',
        intercessor: false,
    });

    useEffect(() => {
        if (isOpen) {
            setSubmitted(false);
            setLoading(false);
            setError(null);
            setFormData({
                nome: '',
                whatsapp: '',
                email: '',
                valor: '',
                intercessor: false,
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.whatsapp || !isValidPhoneNumber(formData.whatsapp)) {
            setError(t('form.invalid_phone'));
            setLoading(false);
            return;
        }

        const result = await upsertParceiro({
            nome: formData.nome,
            whatsapp: formData.whatsapp,
            email: formData.email,
            valor_mensal: formData.valor || undefined,
            intercessor: formData.intercessor,
        });

        setLoading(false);
        if (result.error) {
            setError(t('modal_parceria.error'));
        } else {
            setSubmitted(true);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <HandHeart className="w-5 h-5 text-brand-orange-light" />
                    <span>{t('modal_parceria.title')}</span>
                </div>
            }
            size="xl"
        >
            {submitted ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${THEME_COLOR}20` }}>
                        <CheckCircle className="w-8 h-8" style={{ color: THEME_COLOR }} />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white mb-2">
                        {t('modal_parceria.success_title', { name: formData.nome.split(' ')[0] })}
                    </h3>
                    <p className="text-white/60">
                        {t('modal_parceria.success_text')}
                    </p>
                </div>
            ) : (<>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Coluna Esquerda: Impacto emocional */}
                    <div className="flex flex-col justify-center">
                        <h3 className="font-heading text-2xl font-bold text-white mb-4">
                            {t('modal_parceria_impact.title_pre')} <span style={{ color: THEME_COLOR }}>{t('modal_parceria_impact.title_highlight')}</span>
                        </h3>

                        <div className="space-y-3 text-white/60 leading-relaxed text-sm">
                            <p>
                                {t('modal_parceria_impact.text')}
                            </p>
                        </div>

                        {/* Micro-impacto visual */}
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-3 text-sm">
                                <Sparkles className="w-4 h-4 shrink-0" style={{ color: THEME_COLOR }} />
                                <span className="text-white/50">{t('modal_parceria_impact.impact_1')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Sparkles className="w-4 h-4 shrink-0" style={{ color: THEME_COLOR }} />
                                <span className="text-white/50">{t('modal_parceria_impact.impact_2')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Sparkles className="w-4 h-4 shrink-0" style={{ color: THEME_COLOR }} />
                                <span className="text-white/50">{t('modal_parceria_impact.impact_3')}</span>
                            </div>
                        </div>

                        {/* Versículo */}
                        <blockquote
                            className="mt-8 pl-4 text-sm italic text-white/40 leading-relaxed"
                            style={{ borderLeft: `2px solid ${THEME_COLOR}40` }}
                        >
                            &ldquo;{t('modal_parceria_impact.verse')}&rdquo;
                            <cite className="block mt-1 not-italic text-xs" style={{ color: `${THEME_COLOR}80` }}>{t('modal_parceria_impact.verse_ref')}</cite>
                        </blockquote>
                    </div>

                    {/* Coluna Direita: Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <InternationalPhoneInput
                                value={formData.whatsapp}
                                onChange={(value: string | undefined) => setFormData({ ...formData, whatsapp: value || '' })}
                                className="bg-surface-secondary border-white/10 text-white [&_.PhoneInputInput]:placeholder:text-white/30 focus-within:border-brand-orange-light"
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
                                <HandCoins className="w-4 h-4" />
                                {t('modal_parceria.valor_label')}
                            </label>
                            <input
                                type="text"
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                                placeholder={t('form.placeholders.valor')}
                            />
                        </div>

                        {/* Checkbox intercessor */}
                        <div className="flex items-start gap-3 pt-1">
                            <input
                                type="checkbox"
                                id="intercessor-parceria"
                                checked={formData.intercessor}
                                onChange={(e) => setFormData({ ...formData, intercessor: e.target.checked })}
                                className="mt-1 w-4 h-4 rounded border-white/20 bg-surface-secondary text-brand-orange-light focus:ring-brand-orange-light"
                            />
                            <label htmlFor="intercessor-parceria" className="text-sm text-white/70">
                                {t('modal_parceria.intercessor_label_pre')} <span className="text-brand-orange-light">{t('modal_parceria.intercessor_label_highlight')}</span> {t('modal_parceria.intercessor_label_post')}
                            </label>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Botão premium */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative inline-flex items-center justify-center btn-glow-border hover:scale-105 transition-transform duration-300 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <div
                                className="btn-content-inner px-8 py-4 font-heading font-bold text-sm"
                                style={{
                                    background: `linear-gradient(135deg, ${THEME_COLOR}, #FE7003)`,
                                    color: '#0D0D0D',
                                }}
                            >
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                                        animation: 'shine 2s ease-in-out infinite',
                                    }}
                                />
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin relative z-10" /><span className="relative z-10">{t('form.enviando')}</span></>
                                ) : (
                                    <><Heart className="w-4 h-4 mr-2 relative z-10" /><span className="relative z-10">{t('modal_parceria.submit')}</span></>
                                )}
                            </div>
                        </button>
                    </form>
                </div>

                {/* Linha inferior: Oferta pontual */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <button
                        onClick={onSwitchToOferta}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm border transition-all hover:scale-[1.02] hover:bg-white/5"
                        style={{ borderColor: `${THEME_COLOR}50`, color: THEME_COLOR }}
                    >
                        <HandCoins className="w-4 h-4" />
                        {t('modal_parceria.oferta_pontual')}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </>)}
        </Modal>
    );
};
