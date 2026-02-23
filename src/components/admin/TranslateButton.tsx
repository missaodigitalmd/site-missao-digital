
import React, { useState } from 'react';
import { translateContent } from '@/services/translation.service';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { THEME_COLOR } from '@/constants/theme';

interface TranslateButtonProps {
    sourceData: any; // { titulo, descricao ... }
    targetLocale: string;
    onSuccess: (data: any) => void;
    className?: string;
    label?: string;
}

export const TranslateButton: React.FC<TranslateButtonProps> = ({
    sourceData,
    targetLocale,
    onSuccess,
    className,
    label = 'Traduzir com IA'
}) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleTranslate = async () => {
        if (loading) return;
        setLoading(true);
        setSuccess(false);

        try {
            const translated = await translateContent(sourceData, targetLocale);
            onSuccess(translated);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error('Erro ao traduzir:', error);
            alert('Não foi possível traduzir automaticamente. Verifique conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleTranslate}
            disabled={loading}
            className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
        ${success ? 'bg-green-500/20 text-green-400' : 'bg-brand-orange-light/10 text-brand-orange-light hover:bg-brand-orange-light/20'}
        ${loading ? 'opacity-70 cursor-wait' : ''}
        ${className}
      `}
            title="Traduzir campos automaticamente"
        >
            {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : success ? (
                <Check className="w-3 h-3" />
            ) : (
                <Sparkles className="w-3 h-3" style={{ color: THEME_COLOR }} />
            )}
            {loading ? 'Traduzindo...' : success ? 'Traduzido!' : label}
        </button>
    );
};
