import { supabase } from '@/lib/supabase';
import type { Locale } from '@/lib/supabase';

export interface Depoimento {
    id: string;
    autor: string;
    cargo: string | null;
    igreja: string | null;
    cidade: string | null;
    bandeira_estado: string | null;
    bandeira_nacao: string | null;
    avatar_url: string | null;
    tags: string[];
    destaque: boolean;
    // Texto da tradução (injetado após join)
    texto: string;
}

/**
 * Busca depoimentos aprovados com tradução para o locale dado.
 * Fallback para PT se não houver tradução no locale solicitado.
 */
export async function getDepoimentos(locale: Locale = 'pt', tag?: string): Promise<Depoimento[]> {
    let query = supabase
        .from('depoimentos')
        .select(`
      *,
      depoimentos_traducoes!inner(texto)
    `)
        .eq('aprovado', true)
        .eq('depoimentos_traducoes.locale', locale)
        .order('destaque', { ascending: false });

    if (tag) {
        query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
        // Fallback para PT
        let ptQuery = supabase
            .from('depoimentos')
            .select(`
        *,
        depoimentos_traducoes!inner(texto)
      `)
            .eq('aprovado', true)
            .eq('depoimentos_traducoes.locale', 'pt')
            .order('destaque', { ascending: false });

        if (tag) ptQuery = ptQuery.contains('tags', [tag]);

        const { data: ptData } = await ptQuery;
        if (!ptData) return [];
        return ptData.map(mapDepoimento);
    }

    return data.map(mapDepoimento);
}

function mapDepoimento(raw: any): Depoimento {
    const trad = Array.isArray(raw.depoimentos_traducoes)
        ? raw.depoimentos_traducoes[0]
        : raw.depoimentos_traducoes;

    return {
        id: raw.id,
        autor: raw.autor,
        cargo: raw.cargo,
        igreja: raw.igreja,
        cidade: raw.cidade,
        bandeira_estado: raw.bandeira_estado,
        bandeira_nacao: raw.bandeira_nacao,
        avatar_url: raw.avatar_url,
        tags: raw.tags || [],
        destaque: raw.destaque,
        texto: trad?.texto || '',
    };
}
