import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { MessageSquare, User, Star, Send, CheckCircle } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';

interface FeedbackFormData {
    nome: string;
    email: string;
    tipo: 'Elogio' | 'Sugestão' | 'Problema' | 'Outro';
    rating: number;
    mensagem: string;
}

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation('apoie');
    const [submitted, setSubmitted] = useState(false);
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const [formData, setFormData] = useState<FeedbackFormData>({
        nome: '',
        email: '',
        tipo: 'Sugestão',
        rating: 5,
        mensagem: '',
    });

    useEffect(() => {
        if (isOpen) {
            setSubmitted(false);
            setFormData({
                nome: '',
                email: '',
                tipo: 'Sugestão',
                rating: 5,
                mensagem: '',
            });
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // Em um app real, os dados seriam enviados aqui
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-orange-light" />
                    <span>{t('modal_feedback.title')}</span>
                </div>
            }
            size="md"
        >
            {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-white/60 text-sm mb-2">
                        {t('modal_feedback.description')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <label className="block text-sm text-white/60 mb-1">{t('modal_feedback.type_label')}</label>
                            <select
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                                className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-brand-orange-light transition-colors"
                            >
                                <option value="Sugestão">{t('modal_feedback.types.sugestao')}</option>
                                <option value="Elogio">{t('modal_feedback.types.elogio')}</option>
                                <option value="Problema">{t('modal_feedback.types.problema')}</option>
                                <option value="Outro">{t('modal_feedback.types.outro')}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-2">{t('modal_feedback.rating_label')}</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(null)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${(hoveredStar !== null ? star <= hoveredStar : star <= formData.rating)
                                            ? 'text-brand-orange-light fill-brand-orange-light'
                                            : 'text-white/20'
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-1">{t('modal_feedback.message_label')}</label>
                        <textarea
                            value={formData.mensagem}
                            onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                            className="w-full px-4 py-3 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors resize-none"
                            placeholder={t('modal_feedback.message_placeholder')}
                            rows={4}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl font-heading font-bold text-sm transition-all hover:scale-[1.02] flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)`,
                            color: '#000',
                        }}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {t('modal_feedback.submit')}
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
                        {t('modal_feedback.success_title')}
                    </h3>
                    <p className="text-white/60">
                        {t('modal_feedback.success_text')}
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-6 text-brand-orange-light hover:underline font-medium"
                    >
                        {t('modal_feedback.back')}
                    </button>
                </div>
            )}
        </Modal>
    );
};
