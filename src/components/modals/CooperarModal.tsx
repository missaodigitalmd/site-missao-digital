import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Handshake, User, Phone, Check, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';
import { upsertCooperador } from '@/services/cadastros.service';
import { InternationalPhoneInput } from '@/components/ui/phone-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

interface CooperarFormData {
    nome: string;
    whatsapp: string;
    formas: string[];
    outraHabilidade: string;
    apoiadorMensal: boolean;
    parceiroFinanceiro: boolean;
    valorFinanceiro: string;
}

interface CooperarModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialFormas?: string[];
}

export const CooperarModal: React.FC<CooperarModalProps> = ({ isOpen, onClose, initialFormas = [] }) => {
    const { t } = useTranslation('apoie');
    const formasCooperacao = t('formas_cooperacao', { returnObjects: true }) as string[];
    const outraHabilidadeLabel = formasCooperacao[formasCooperacao.length - 1] ?? 'Outra habilidade';

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CooperarFormData>({
        nome: '',
        whatsapp: '',
        formas: initialFormas,
        outraHabilidade: '',
        apoiadorMensal: false,
        parceiroFinanceiro: false,
        valorFinanceiro: '',
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
                formas: initialFormas,
                outraHabilidade: '',
                apoiadorMensal: false,
                parceiroFinanceiro: false,
                valorFinanceiro: '',
            });
        }
    }, [isOpen, initialFormas]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.whatsapp || !isValidPhoneNumber(formData.whatsapp)) {
            setError(t('form.invalid_phone'));
            setLoading(false);
            return;
        }

        const result = await upsertCooperador({
            nome: formData.nome,
            whatsapp: formData.whatsapp,
            formas_cooperacao: formData.formas,
            outra_habilidade: formData.outraHabilidade || undefined,
            apoiador_mensal: formData.apoiadorMensal,
            parceiro_financeiro: formData.parceiroFinanceiro,
            valor_financeiro: formData.valorFinanceiro || undefined,
        });

        setLoading(false);
        if (result.error) {
            setError(t('modal_cooperar.error'));
        } else {
            setSubmitted(true);
        }
    };

    const toggleFormaCooperacao = (forma: string) => {
        setFormData(prev => ({
            ...prev,
            formas: prev.formas.includes(forma)
                ? prev.formas.filter(f => f !== forma)
                : [...prev.formas, forma]
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <Handshake className="w-5 h-5 text-brand-orange-light" />
                    <span>{t('modal_cooperar.title')}</span>
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
                        <label className="block text-sm text-white/60 mb-3">
                            {t('modal_cooperar.formas_label')}
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                            {formasCooperacao.map((forma, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                    onClick={() => toggleFormaCooperacao(forma)}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.formas.includes(forma)
                                        ? 'bg-brand-orange-light border-brand-orange-light'
                                        : 'border-white/20'
                                        }`}>
                                        {formData.formas.includes(forma) && <Check className="w-3 h-3 text-black" />}
                                    </div>
                                    <span className="text-sm text-white/70">{forma}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {formData.formas.includes(outraHabilidadeLabel) && (
                        <div>
                            <label className="block text-sm text-white/60 mb-1">
                                {t('modal_cooperar.outra_label')}
                            </label>
                            <textarea
                                value={formData.outraHabilidade}
                                onChange={(e) => setFormData({ ...formData, outraHabilidade: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors resize-none"
                                placeholder={t('modal_cooperar.outra_placeholder')}
                                rows={3}
                            />
                        </div>
                    )}

                    <div className="space-y-3 pt-2">
                        {/* Checkbox apoiador mensal */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="apoiador-mensal"
                                checked={formData.apoiadorMensal}
                                onChange={(e) => setFormData({ ...formData, apoiadorMensal: e.target.checked })}
                                className="mt-1 w-4 h-4 rounded border-white/20 bg-surface-secondary text-brand-orange-light focus:ring-brand-orange-light"
                            />
                            <label htmlFor="apoiador-mensal" className="text-sm text-white/70">
                                {t('modal_cooperar.apoiador_label_pre')} <span className="text-brand-orange-light">{t('modal_cooperar.apoiador_label_highlight')}</span>
                            </label>
                        </div>

                        {/* Checkbox parceiro financeiro */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="parceiro-fin"
                                checked={formData.parceiroFinanceiro}
                                onChange={(e) => setFormData({ ...formData, parceiroFinanceiro: e.target.checked })}
                                className="mt-1 w-4 h-4 rounded border-white/20 bg-surface-secondary text-brand-orange-light focus:ring-brand-orange-light"
                            />
                            <label htmlFor="parceiro-fin" className="text-sm text-white/70">
                                {t('modal_cooperar.parceiro_label_pre')} <span className="text-brand-orange-light">{t('modal_cooperar.parceiro_label_highlight')}</span>
                            </label>
                        </div>

                        {formData.parceiroFinanceiro && (
                            <div className="pl-7">
                                <label className="block text-sm text-white/60 mb-1">
                                    {t('modal_cooperar.valor_label')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.valorFinanceiro}
                                    onChange={(e) => setFormData({ ...formData, valorFinanceiro: e.target.value })}
                                    className="w-full px-4 py-2 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                                    placeholder={t('form.placeholders.valor')}
                                />
                            </div>
                        )}
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
                            background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)`,
                            color: '#000',
                        }}
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('form.enviando')}</>
                        ) : (
                            <><Handshake className="w-4 h-4 mr-2" /> {t('modal_cooperar.submit')}</>
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
                        {t('modal_cooperar.success_title', { name: formData.nome.split(' ')[0] })}
                    </h3>
                    <p className="text-white/60">
                        {t('modal_cooperar.success_text')}
                    </p>
                </div>
            )}
        </Modal>
    );
};
