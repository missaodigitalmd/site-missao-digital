import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Heart, User, Phone, Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';
import { upsertIntercessor } from '@/services/cadastros.service';
import { InternationalPhoneInput } from '@/components/ui/phone-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

interface OrarFormData {
    nome: string;
    whatsapp: string;
    email: string;
    parceiroFinanceiro: boolean;
    valor?: string;
}

interface OrarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OrarModal: React.FC<OrarModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation('apoie');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<OrarFormData>({
        nome: '',
        whatsapp: '',
        email: '',
        parceiroFinanceiro: false,
        valor: '',
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setSubmitted(false);
            setLoading(false);
            setError(null);
            setFormData({
                nome: '',
                whatsapp: '',
                email: '',
                parceiroFinanceiro: false,
                valor: '',
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

        const result = await upsertIntercessor({
            nome: formData.nome,
            whatsapp: formData.whatsapp,
            email: formData.email,
            parceiro_financeiro: formData.parceiroFinanceiro,
            valor_mensal: formData.valor || undefined,
        });

        setLoading(false);
        if (result.error) {
            setError(t('modal_orar.error'));
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
                    <Heart className="w-5 h-5 text-brand-orange-light" />
                    <span>{t('modal_orar.title')}</span>
                </div>
            }
            size="md"
        >
            {!submitted ? (
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

                    {/* Checkbox parceiro financeiro */}
                    <div className="flex items-start gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="parceiro"
                            checked={formData.parceiroFinanceiro}
                            onChange={(e) => setFormData({ ...formData, parceiroFinanceiro: e.target.checked })}
                            className="mt-1 w-4 h-4 rounded border-white/20 bg-surface-secondary text-brand-orange-light focus:ring-brand-orange-light"
                        />
                        <label htmlFor="parceiro" className="text-sm text-white/70">
                            {t('modal_orar.parceiro_label_pre')}{' '}
                            <span className="text-brand-orange-light">{t('modal_orar.parceiro_label_highlight')}</span>
                        </label>
                    </div>

                    {formData.parceiroFinanceiro && (
                        <div>
                            <label className="block text-sm text-white/60 mb-1">
                                {t('modal_orar.valor_label')}
                            </label>
                            <input
                                type="text"
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                                placeholder={t('form.placeholders.valor')}
                            />
                        </div>
                    )}

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
                            background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)`,
                            color: '#000',
                        }}
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('form.enviando')}</>
                        ) : (
                            <><Heart className="w-4 h-4 mr-2" /> {t('modal_orar.submit')}</>
                        )}
                    </button>
                </form>
            ) : (
                <div className="text-center py-8">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: `${THEME_COLOR}20` }}
                    >
                        <CheckCircle className="w-8 h-8" style={{ color: THEME_COLOR }} />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white mb-2">
                        {t('modal_orar.success_title', { name: formData.nome.split(' ')[0] })}
                    </h3>
                    <p className="text-white/60">
                        {t('modal_orar.success_text')}
                    </p>
                    {formData.parceiroFinanceiro && (
                        <p className="text-white/40 text-sm mt-2">
                            {t('modal_orar.success_partner_text')}
                        </p>
                    )}
                </div>
            )}
        </Modal>
    );
};
