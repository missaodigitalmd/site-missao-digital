import { useEffect, useState, useCallback } from 'react';

export type DeepLinkModal = 'orar' | 'parceria' | 'cooperar' | 'oferta' | null;

interface DeepLinkState {
    modal: DeepLinkModal;
    recurso: string | null;
    lang: string | null;
}

/**
 * Hook que lê parâmetros de deep link da URL e os expõe para consumo.
 * 
 * Parâmetros suportados:
 *   ?modal=orar       → Abre modal de oração
 *   ?modal=parceria   → Abre modal de parceria mensal
 *   ?modal=cooperar   → Abre modal de cooperação
 *   ?modal=oferta     → Abre modal de oferta pontual
 *   ?recurso=slug     → Abre modal de download do recurso
 *   ?lang=en          → Define idioma (futuro i18n)
 * 
 * Após consumir o deep link, os parâmetros são removidos da URL
 * para evitar reabertura ao navegar.
 */
export function useDeepLink() {
    const [state, setState] = useState<DeepLinkState>({ modal: null, recurso: null, lang: null });

    // Lê os parâmetros na montagem
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const modal = params.get('modal') as DeepLinkModal;
        const recurso = params.get('recurso');
        const lang = params.get('lang');

        if (modal || recurso || lang) {
            setState({
                modal: ['orar', 'parceria', 'cooperar', 'oferta'].includes(modal || '') ? modal : null,
                recurso: recurso || null,
                lang: lang || null,
            });

            // Remove os parâmetros da URL sem recarregar a página
            const url = new URL(window.location.href);
            url.searchParams.delete('modal');
            url.searchParams.delete('recurso');
            // Mantém lang na URL (será usado pelo i18n)
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    // Função para consumir o deep link (limpa o estado após uso)
    const consumeModal = useCallback(() => {
        setState(prev => ({ ...prev, modal: null }));
    }, []);

    const consumeRecurso = useCallback(() => {
        setState(prev => ({ ...prev, recurso: null }));
    }, []);

    return {
        deepLinkModal: state.modal,
        deepLinkRecurso: state.recurso,
        deepLinkLang: state.lang,
        consumeModal,
        consumeRecurso,
    };
}

/**
 * Gera uma URL de deep link para compartilhamento.
 */
export function buildDeepLink(params: {
    route?: string;
    modal?: string;
    recurso?: string;
    lang?: string;
}): string {
    const base = window.location.origin + window.location.pathname;
    const searchParams = new URLSearchParams();

    if (params.modal) searchParams.set('modal', params.modal);
    if (params.recurso) searchParams.set('recurso', params.recurso);
    if (params.lang) searchParams.set('lang', params.lang);

    const hash = params.route ? `#${params.route}` : '';
    const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return `${base}${search}${hash}`;
}
