import { BookOpen, ClipboardCheck, FileText, Sparkles, type LucideIcon } from 'lucide-react';
import type { Recurso } from '@/services/recursos.service';

export type RecursoCategoria = 'gamers' | 'lideres' | 'pais';

export interface RecursoUI extends Recurso {
    categoria: RecursoCategoria;
    cor: string;
    icone: LucideIcon;
    imagem: string;
    emBreve: boolean;
}

function resolveCategoria(tags: string[], tipo: string): RecursoCategoria {
    if (tags.includes('gamers')) return 'gamers';
    if (tags.includes('pais')) return 'pais';
    if (tags.includes('lideres')) return 'lideres';

    if (tipo.includes('gamer')) return 'gamers';
    if (tipo.includes('pai')) return 'pais';

    return 'lideres';
}

function resolveCor(tipo: string, categoria: RecursoCategoria): string {
    if (tipo.includes('checklist')) return '#E040FB';
    if (tipo.includes('ia')) return '#B388FF';
    if (tipo.includes('ebook')) return '#4CAF50';
    if (tipo.includes('guia')) return '#FFD740';

    if (categoria === 'gamers') return '#FF5252';
    if (categoria === 'pais') return '#4CAF50';
    return '#E040FB';
}

function resolveIcone(tipo: string): LucideIcon {
    if (tipo.includes('checklist')) return ClipboardCheck;
    if (tipo.includes('ebook')) return BookOpen;
    if (tipo.includes('ia')) return Sparkles;
    return FileText;
}

function resolveImagem(recurso: Recurso, categoria: RecursoCategoria): string {
    if (recurso.imagem_url) return recurso.imagem_url;
    if (categoria === 'gamers') return '/images/projeto-campeonato.jpg';
    if (categoria === 'pais') return '/images/imersao-missao.jpg';
    return '/images/projeto-daod.jpg';
}

export function mapRecursoToUI(recurso: Recurso): RecursoUI {
    const categoria = resolveCategoria(recurso.tags || [], recurso.tipo || '');
    return {
        ...recurso,
        categoria,
        cor: resolveCor(recurso.tipo || '', categoria),
        icone: resolveIcone(recurso.tipo || ''),
        imagem: resolveImagem(recurso, categoria),
        emBreve: !recurso.arquivo_url,
    };
}

export function formatDownloadCount(count: number, locale: string): string {
    return new Intl.NumberFormat(locale).format(count || 0);
}
