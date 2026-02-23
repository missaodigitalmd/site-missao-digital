import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { HandCoins, Copy, CheckCircle } from 'lucide-react';
import { GlowCard } from '@/components/ui/GlowCard';
import { THEME_COLOR } from '@/constants/theme';

interface OfertaPontualModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToParceria: () => void;
}

export const OfertaPontualModal: React.FC<OfertaPontualModalProps> = ({
    isOpen,
    onClose,
    onSwitchToParceria
}) => {
    const { t } = useTranslation('apoie');
    const [copiedPix, setCopiedPix] = useState(false);
    const [copiedNome, setCopiedNome] = useState(false);

    const handleCopyPix = () => {
        navigator.clipboard.writeText('61993978989');
        setCopiedPix(true);
        setTimeout(() => setCopiedPix(false), 2000);
    };

    const handleCopyNome = () => {
        navigator.clipboard.writeText('Navarro Lamounier');
        setCopiedNome(true);
        setTimeout(() => setCopiedNome(false), 2000);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <HandCoins className="w-5 h-5 text-brand-orange-light" />
                    <span>{t('modal_oferta.title')}</span>
                </div>
            }
            size="md"
            headerExtra={
                <button
                    onClick={onSwitchToParceria}
                    className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
                    style={{ borderColor: `${THEME_COLOR}40`, color: THEME_COLOR }}
                >
                    {t('modal_oferta.parceria_mensal')}
                </button>
            }
        >
            <div className="text-center">
                <p className="text-white/60 mb-6 text-sm">
                    {t('modal_oferta.pix_instruction')}
                </p>

                {/* QR Code */}
                <div className="mb-6 flex justify-center">
                    <GlowCard glowColor={`${THEME_COLOR}30`} borderColor={`${THEME_COLOR}20`}>
                        <div className="p-2 bg-white rounded-xl">
                            <img
                                src="/images/qrcodepix.webp"
                                alt="QR Code PIX"
                                className="w-48 h-48 object-contain"
                            />
                        </div>
                    </GlowCard>
                </div>

                {/* Chave PIX */}
                <div className="flex items-center gap-2 bg-surface-secondary rounded-xl p-3 mb-3">
                    <span className="text-white/50 text-xs">{t('modal_oferta.pix_key_label')}</span>
                    <span className="text-white font-mono text-sm flex-grow text-left">61993978989</span>
                    <button
                        onClick={handleCopyPix}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                        {copiedPix ? (
                            <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-green-500 text-xs">{t('modal_oferta.copied')}</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 text-white/50" />
                                <span className="text-white/50 text-xs">{t('modal_oferta.copy')}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Nome favorecido */}
                <div className="flex items-center gap-2 bg-surface-secondary rounded-xl p-3 mb-6">
                    <span className="text-white/50 text-xs">{t('modal_oferta.favorecido_label')}</span>
                    <span className="text-white text-sm flex-grow text-left">Navarro Lamounier</span>
                    <button
                        onClick={handleCopyNome}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                        {copiedNome ? (
                            <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-green-500 text-xs">{t('modal_oferta.copied')}</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 text-white/50" />
                                <span className="text-white/50 text-xs">{t('modal_oferta.copy')}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
