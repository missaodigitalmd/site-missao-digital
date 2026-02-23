import { supabase } from '@/lib/supabase';
import type { Locale } from '@/lib/supabase';

export interface Recurso {
    id: string;
    slug: string;
    tipo: string;
    arquivo_url: string | null;
    imagem_url: string | null;
    tags: string[];
    destaque: boolean;
    ativo: boolean;
    ordem: number;
    downloads_count: number;
    // Campos da tradução (injetados após join)
    titulo: string;
    descricao: string;
    descricao_completa: string;
}

/**
 * Busca todos os recursos ativos com tradução para o locale dado.
 * Se não houver tradução no locale solicitado, faz fallback para 'pt'.
 */
export async function getRecursos(locale: Locale = 'pt'): Promise<Recurso[]> {
    const { data, error } = await supabase
        .from('recursos')
        .select(`
      *,
      recursos_traducoes!inner(titulo, descricao, descricao_completa, arquivo_url)
    `)
        .eq('ativo', true)
        .eq('recursos_traducoes.locale', locale)
        .order('ordem', { ascending: true });

    if (error || !data || data.length === 0) {
        // Fallback para PT
        const { data: ptData, error: ptError } = await supabase
            .from('recursos')
            .select(`
        *,
        recursos_traducoes!inner(titulo, descricao, descricao_completa, arquivo_url)
      `)
            .eq('ativo', true)
            .eq('recursos_traducoes.locale', 'pt')
            .order('ordem', { ascending: true });

        if (ptError || !ptData) return [];
        return ptData.map(mapRecurso);
    }

    return data.map(mapRecurso);
}

/**
 * Busca um recurso específico pelo slug.
 */
export async function getRecursoBySlug(slug: string, locale: Locale = 'pt'): Promise<Recurso | null> {
    const { data, error } = await supabase
        .from('recursos')
        .select(`
      *,
      recursos_traducoes!inner(titulo, descricao, descricao_completa, arquivo_url)
    `)
        .eq('slug', slug)
        .eq('recursos_traducoes.locale', locale)
        .single();

    if (error || !data) {
        // Fallback para PT
        const { data: ptData } = await supabase
            .from('recursos')
            .select(`
        *,
        recursos_traducoes!inner(titulo, descricao, descricao_completa, arquivo_url)
      `)
            .eq('slug', slug)
            .eq('recursos_traducoes.locale', 'pt')
            .single();

        if (!ptData) return null;
        return mapRecurso(ptData);
    }

    return mapRecurso(data);
}

/**
 * Gera uma URL assinada para download de um arquivo do Storage.
 */
export async function getDownloadUrl(arquivoUrl: string): Promise<string | null> {
    // Se for URL externa, retorna diretamente
    if (arquivoUrl.startsWith('http')) return arquivoUrl;

    const { data, error } = await supabase.storage
        .from('recursos-arquivos')
        .createSignedUrl(arquivoUrl, 60); // 60 segundos de validade

    if (error || !data) return null;
    return data.signedUrl;
}

// Helper para mapear o resultado do join
function mapRecurso(raw: any): Recurso {
    const trad = Array.isArray(raw.recursos_traducoes)
        ? raw.recursos_traducoes[0]
        : raw.recursos_traducoes;

    return {
        id: raw.id,
        slug: raw.slug,
        tipo: raw.tipo,
        arquivo_url: trad?.arquivo_url || null, // Pega da tradução
        imagem_url: raw.imagem_url,
        tags: raw.tags || [],
        destaque: raw.destaque,
        ativo: raw.ativo,
        ordem: raw.ordem,
        downloads_count: Number(raw.downloads_count || 0),
        titulo: trad?.titulo || '',
        descricao: trad?.descricao || '',
        descricao_completa: trad?.descricao_completa || '',
    };
}
