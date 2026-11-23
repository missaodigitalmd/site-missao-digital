// Edge Function mpc-briefing: unica porta para o schema `mpc` e o bucket `mpc-briefing`.
// O navegador nunca fala com as tabelas. Tokens chegam em claro, ficam so como sha256.
import postgres from "npm:postgres@3.4.5";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const BUCKET = "mpc-briefing";
const ORIGINS = ["https://missaodigitalmd.com", "https://www.missaodigitalmd.com"];
const MAX_PATCH = 256 * 1024;
const MAX_DATA = 2 * 1024 * 1024;
const MAX_FILE = 50 * 1024 * 1024;
const QUOTA = 500 * 1024 * 1024;
const BLOCKED = /\.(exe|bat|cmd|ps1|js|msi|com|scr|vbs|jar|sh|dll)[\s.]*$/i;
const KEY_RE = /^[A-Za-z0-9_.\-]{1,80}$/;

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { max: 2, prepare: false, idle_timeout: 20 });
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

class Erro extends Error {
  constructor(public status: number, public codigo: string, msg: string, public extra: Record<string, unknown> = {}) { super(msg); }
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuid = (v: unknown) => { if (typeof v !== "string" || !UUID.test(v)) throw new Erro(404, "arquivo", "Ficheiro não encontrado."); return v; };

const hex = async (s: string) =>
  [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))]
    .map((b) => b.toString(16).padStart(2, "0")).join("");

const cors = (req: Request) => {
  const o = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(o) ? o : ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });

async function porToken(token: unknown, campo: "token_hash" | "admin_hash") {
  if (typeof token !== "string" || token.length < 20 || token.length > 200) throw new Erro(404, "nao_encontrado", "Ligação inválida.");
  const h = await hex(token);
  const [b] = campo === "token_hash"
    ? await sql`select * from mpc.briefing where token_hash = ${h}`
    : await sql`select * from mpc.briefing where admin_hash = ${h}`;
  if (!b) throw new Erro(404, "nao_encontrado", "Ligação inválida.");
  return b;
}

const listaArquivos = (briefingId: string) => sql`
  select id, escopo, nome, mime, bytes, created_at from mpc.arquivo
  where briefing_id = ${briefingId} and confirmado and removido_em is null order by created_at`;

const limpoValor = (v: unknown): boolean => {
  if (typeof v === "string") return true;
  if (Array.isArray(v)) return v.every(limpoValor);
  if (v && typeof v === "object") return Object.values(v as object).every(limpoValor);
  return false;
};

const nomeSeguro = (n: string) =>
  n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^\.+/, "").slice(-120) || "arquivo";

async function acao(req: Request, b: Record<string, any>) {
  switch (b.acao) {
    case "ler": {
      const br = await porToken(b.token, "token_hash");
      return { data: br.data, version: br.version, atualizadoEm: br.updated_at, arquivos: await listaArquivos(br.id) };
    }
    case "gravar": {
      const br = await porToken(b.token, "token_hash");
      const patch = b.patch;
      if (!patch || typeof patch !== "object" || Array.isArray(patch)) throw new Erro(400, "patch", "Pedido inválido.");
      if (JSON.stringify(patch).length > MAX_PATCH) throw new Erro(413, "grande", "Esta alteração é grande demais. Divida o texto em partes ou use menos anexos de texto.");
      const chaves = Object.keys(patch);
      if (!chaves.length) return { version: br.version, anterior: br.version, atualizadoEm: br.updated_at };
      if (chaves.length > 200 || !chaves.every((k) => KEY_RE.test(k))) throw new Erro(400, "chave", "Pedido inválido.");
      if (!Object.values(patch).every(limpoValor)) throw new Erro(400, "valor", "Pedido inválido.");
      const reps = chaves.filter((k) => k.startsWith("rep_"));
      if (!reps.every((k) => Array.isArray(patch[k]) && patch[k].every((o: unknown) => o && typeof o === "object" && !Array.isArray(o)))) throw new Erro(400, "rep", "Pedido inválido.");
      // blocos repetiveis substituem o array inteiro: so com a versao que o cliente viu, senao um aparelho apaga o que o outro acrescentou
      const base = Number.isInteger(b.baseVersion) ? b.baseVersion : null;
      const exigeBase = reps.length > 0 && base !== null;
      const [r] = await sql`
        update mpc.briefing set data = data || ${sql.json(patch)}, version = version + 1, updated_at = now()
        where id = ${br.id} and octet_length((data || ${sql.json(patch)})::text) <= ${MAX_DATA} and (${!exigeBase} or version = ${base})
        returning version, version - 1 as anterior, updated_at`;
      if (!r) {
        const [atual] = await sql`select data, version from mpc.briefing where id = ${br.id}`;
        if (exigeBase && atual.version !== base)
          throw new Erro(409, "desatualizado", "Há alterações mais recentes. A atualizar.", { data: atual.data, version: atual.version, arquivos: await listaArquivos(br.id) });
        throw new Erro(413, "total", "O formulário atingiu o tamanho máximo.");
      }
      await sql`insert into mpc.historico (briefing_id, chaves) values (${br.id}, ${chaves})`;
      return { version: r.version, anterior: r.anterior, atualizadoEm: r.updated_at };
    }
    case "url_envio": {
      const br = await porToken(b.token, "token_hash");
      const { escopo, nome, mime } = b; const bytes = Number(b.bytes);
      if (typeof escopo !== "string" || !KEY_RE.test(escopo) || typeof nome !== "string" || !nome.trim() || nome.length > 200 || !Number.isInteger(bytes) || bytes < 0)
        throw new Erro(400, "pedido", "Pedido inválido.");
      if (BLOCKED.test(nome.trim())) throw new Erro(400, "tipo", "Este tipo de ficheiro não é aceite (executáveis e scripts). Comprima num ZIP ou envie uma ligação.");
      if (bytes > MAX_FILE) throw new Erro(413, "arquivo_grande", "Ficheiro acima de 50 MB. Envie uma ligação (YouTube, Google Drive, WeTransfer) no campo de ligações.");
      // envios nao confirmados ha mais de 2 h (validade do URL assinado) sao lixo: limpa antes de contar a quota
      const velhos = await sql`delete from mpc.arquivo where briefing_id = ${br.id} and not confirmado and created_at < now() - interval '2 hours' returning path`;
      if (velhos.length) await sb.storage.from(BUCKET).remove(velhos.map((v: any) => v.path));
      const [{ usado }] = await sql`select coalesce(sum(bytes),0)::bigint as usado from mpc.arquivo where briefing_id = ${br.id} and removido_em is null`;
      if (Number(usado) + bytes > QUOTA) throw new Erro(413, "quota", "Atingiu o limite total de anexos (500 MB). Envie ligações para o resto.");
      const id = crypto.randomUUID();
      const path = `${br.id}/${id}/${nomeSeguro(nome)}`;
      const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
      if (error || !data) throw new Erro(500, "storage", "Não foi possível preparar o envio. Tente outra vez.");
      await sql`insert into mpc.arquivo (id, briefing_id, escopo, nome, path, mime, bytes) values (${id}, ${br.id}, ${escopo}, ${nome}, ${path}, ${String(mime ?? "").slice(0, 100) || null}, ${bytes})`;
      return { arquivoId: id, urlEnvio: data.signedUrl };
    }
    case "confirmar_envio": {
      const br = await porToken(b.token, "token_hash");
      const [a] = await sql`select * from mpc.arquivo where id = ${uuid(b.arquivoId)} and briefing_id = ${br.id} and removido_em is null`;
      if (!a) throw new Erro(404, "arquivo", "Ficheiro não encontrado.");
      const { data: info, error: infoErr } = await sb.storage.from(BUCKET).info(a.path);
      if (!info && infoErr && !/not.?found|does not exist|404/i.test(String((infoErr as any).message ?? "") + String((infoErr as any).statusCode ?? ""))) throw new Erro(503, "storage", "O armazenamento não respondeu. Tente outra vez.");
      if (!info) { await sql`delete from mpc.arquivo where id = ${a.id}`; throw new Erro(409, "sem_objeto", "O envio não chegou ao fim. Tente outra vez."); }
      const real = Number((info as any).size ?? a.bytes);
      if (real > MAX_FILE) { await sb.storage.from(BUCKET).remove([a.path]); await sql`delete from mpc.arquivo where id = ${a.id}`; throw new Erro(413, "arquivo_grande", "Ficheiro acima de 50 MB."); }
      await sql`update mpc.arquivo set confirmado = true, bytes = ${real} where id = ${a.id}`;
      await sql`insert into mpc.historico (briefing_id, chaves) values (${br.id}, ${["arquivo:" + a.escopo]})`;
      return { arquivo: { id: a.id, escopo: a.escopo, nome: a.nome, mime: a.mime, bytes: real } };
    }
    case "remover_arquivo": {
      const br = await porToken(b.token, "token_hash");
      const [a] = await sql`update mpc.arquivo set removido_em = now() where id = ${uuid(b.arquivoId)} and briefing_id = ${br.id} and removido_em is null returning path, escopo`;
      if (!a) throw new Erro(404, "arquivo", "Ficheiro não encontrado.");
      const { error: rmErr } = await sb.storage.from(BUCKET).remove([a.path]);
      if (rmErr) console.error("remove", rmErr.message);
      await sql`insert into mpc.historico (briefing_id, chaves) values (${br.id}, ${["arquivo:" + a.escopo]})`;
      return { ok: true };
    }
    case "url_leitura": {
      const br = b.adminToken ? await porToken(b.adminToken, "admin_hash") : await porToken(b.token, "token_hash");
      const [a] = await sql`select path, nome from mpc.arquivo where id = ${uuid(b.arquivoId)} and briefing_id = ${br.id} and confirmado and removido_em is null`;
      if (!a) throw new Erro(404, "arquivo", "Ficheiro não encontrado.");
      const { data } = await sb.storage.from(BUCKET).createSignedUrl(a.path, 3600);
      return { url: data?.signedUrl };
    }
    case "admin_ler": {
      const br = await porToken(b.adminToken, "admin_hash");
      const desde = b.desde ? new Date(String(b.desde)) : null;
      const arqs = await listaArquivos(br.id);
      const comUrl = await Promise.all(arqs.map(async (a: any) => {
        const [{ path }] = await sql`select path from mpc.arquivo where id = ${a.id}`;
        const { data } = await sb.storage.from(BUCKET).createSignedUrl(path, 3600);
        return { ...a, url: data?.signedUrl };
      }));
      const hist = await sql`select chaves, em from mpc.historico where briefing_id = ${br.id} order by em desc limit 300`;
      const alteradas = desde && !isNaN(+desde)
        ? [...new Set(hist.filter((h: any) => new Date(h.em) > desde).flatMap((h: any) => h.chaves))] : [];
      return { data: br.data, version: br.version, atualizadoEm: br.updated_at, arquivos: comUrl, historico: hist, alteradas };
    }
    default:
      throw new Erro(400, "acao", "Pedido inválido.");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return json(req, { erro: "metodo" }, 405);
  try {
    const raw = await req.text();
    if (raw.length > MAX_PATCH + 4096) throw new Erro(413, "grande", "Pedido grande demais.");
    let corpo: Record<string, any>;
    try { corpo = JSON.parse(raw); } catch { throw new Erro(400, "json", "Pedido inválido."); }
    return json(req, await acao(req, corpo));
  } catch (e) {
    if (e instanceof Erro) return json(req, { erro: e.codigo, mensagem: e.message, ...e.extra }, e.status);
    console.error(e);
    return json(req, { erro: "interno", mensagem: "Erro do servidor. Tente outra vez." }, 500);
  }
});
