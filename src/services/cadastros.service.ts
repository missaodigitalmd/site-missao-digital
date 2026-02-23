import { supabase } from '@/lib/supabase';
import { getDownloadUrl } from '@/services/recursos.service';

// =============================================
// INTERCESSORES
// =============================================
export interface IntercessorData {
    nome: string;
    whatsapp: string;
    email: string;
    parceiro_financeiro?: boolean;
    valor_mensal?: string;
}

export async function upsertIntercessor(data: IntercessorData): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('intercessores')
        .upsert(
            { ...data, atualizado_em: new Date().toISOString() },
            { onConflict: 'whatsapp' }
        );

    return { error: error?.message || null };
}

// =============================================
// PARCEIROS MENSAIS
// =============================================
export interface ParceiraMensalData {
    nome: string;
    whatsapp: string;
    email: string;
    valor_mensal?: string;
    intercessor?: boolean;
}

export async function upsertParceiro(data: ParceiraMensalData): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('parceiros_mensais')
        .upsert(
            { ...data, atualizado_em: new Date().toISOString() },
            { onConflict: 'whatsapp' }
        );

    return { error: error?.message || null };
}

// =============================================
// COOPERADORES
// =============================================
export interface CooperadorData {
    nome: string;
    whatsapp: string;
    formas_cooperacao: string[];
    outra_habilidade?: string;
    apoiador_mensal?: boolean;
    parceiro_financeiro?: boolean;
    valor_financeiro?: string;
}

export async function upsertCooperador(data: CooperadorData): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('cooperadores')
        .upsert(
            { ...data, atualizado_em: new Date().toISOString() },
            { onConflict: 'whatsapp' }
        );

    return { error: error?.message || null };
}

// =============================================
// DOWNLOADS DE RECURSOS
// =============================================
export interface DownloadRecursoData {
    recurso_id: string;
    nome: string;
    whatsapp: string;
    email: string;
    cidade?: string;
    igreja?: string;
    arquivo_url?: string | null;
}

// Função auxiliar para verificar erro de duplicidade
function isDuplicateError(error: any): boolean {
    return error && (
        error.code === '23505' ||
        error.message?.includes('duplicate key') ||
        error.details?.includes('already exists')
    );
}

export async function registrarDownload(data: DownloadRecursoData): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('downloads_recursos')
        .insert({
            recurso_id: data.recurso_id,
            nome: data.nome,
            whatsapp: data.whatsapp,
            email: data.email,
            cidade: data.cidade,
            igreja: data.igreja,
        });

    if (!error) {
        return { error: null };
    }

    // Se for erro de duplicidade, consideramos sucesso (já registrado)
    if (isDuplicateError(error)) {
        return { error: null };
    }

    return { error: error.message || 'Erro ao registrar download' };
}

interface IncrementResult {
    error: string | null;
}

async function incrementarDownloadsRecurso(recursoId: string): Promise<IncrementResult> {
    // Preferência por RPC atômica (ver migration em app/supabase/migrations)
    const { error: rpcError } = await supabase.rpc('incrementar_download_recurso', {
        p_recurso_id: recursoId,
    });

    if (!rpcError) {
        return { error: null };
    }

    // Fallback compatível: leitura + update (não atômico, usado somente se RPC inexistente)
    const { data: recurso, error: readError } = await supabase
        .from('recursos')
        .select('downloads_count')
        .eq('id', recursoId)
        .single();

    if (readError) {
        return { error: readError.message };
    }

    const nextCount = Number(recurso?.downloads_count || 0) + 1;
    const { error: updateError } = await supabase
        .from('recursos')
        .update({ downloads_count: nextCount })
        .eq('id', recursoId);

    return { error: updateError?.message || null };
}

async function obterDownloadsCount(recursoId: string): Promise<number | null> {
    const { data, error } = await supabase
        .from('recursos')
        .select('downloads_count')
        .eq('id', recursoId)
        .single();

    if (error) return null;
    return Number(data?.downloads_count || 0);
}

export interface RegistrarDownloadRecursoResult {
    error: string | null;
    downloadUrl: string | null;
    downloadsCount: number | null;
}

export async function registrarDownloadRecurso(
    data: DownloadRecursoData
): Promise<RegistrarDownloadRecursoResult> {
    const registro = await registrarDownload(data);
    if (registro.error) {
        // Se falhar o registro com erro real (não duplicidade), paramos
        return {
            error: registro.error,
            downloadUrl: null,
            downloadsCount: null,
        };
    }

    // Incremento é "best effort" - não deve bloquear o download se falhar
    const incremento = await incrementarDownloadsRecurso(data.recurso_id);
    if (incremento.error) {
        console.warn('Falha ao incrementar downloads:', incremento.error);
    }

    const downloadUrl = data.arquivo_url
        ? await getDownloadUrl(data.arquivo_url)
        : null;

    const downloadsCount = await obterDownloadsCount(data.recurso_id);

    return {
        // Se tivermos URL ou se não precisava de URL (ex: link externo direto), sucesso
        error: data.arquivo_url && !downloadUrl ? 'Falha ao gerar link de download.' : null,
        downloadUrl,
        downloadsCount,
    };
}
