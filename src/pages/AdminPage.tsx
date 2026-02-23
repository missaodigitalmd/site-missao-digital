import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from '@/router';
import { THEME_COLOR } from '@/constants/theme';
import {
    Lock, LogOut, BookOpen, MessageSquare, Users,
    Plus, Pencil, Trash2, Check,
    Eye, EyeOff, Star, Search,
    Heart, Handshake, HandCoins, ArrowRight, CornerDownRight
} from 'lucide-react';
import { InputFile } from '@/components/admin/InputFile';
import { TranslateButton } from '@/components/admin/TranslateButton';
import { DepoimentosTab } from './admin/tabs/DepoimentosTab';

// ─── Auth ────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'esqueciasenha';
const SESSION_KEY = 'admin_session';

function useAdminAuth() {
    const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
    const login = (pwd: string) => {
        if (pwd === ADMIN_PASSWORD) { sessionStorage.setItem(SESSION_KEY, 'true'); setAuthed(true); return true; }
        return false;
    };
    const logout = () => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); };
    return { authed, login, logout };
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pwd: string) => boolean }) {
    const [pwd, setPwd] = useState('');
    const [error, setError] = useState(false);
    const [show, setShow] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!onLogin(pwd)) { setError(true); setPwd(''); }
    };

    return (
        <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: `${THEME_COLOR}20` }}>
                        <Lock className="w-8 h-8" style={{ color: THEME_COLOR }} />
                    </div>
                    <h1 className="font-heading text-2xl font-bold text-white">Painel Admin</h1>
                    <p className="text-white/40 text-sm mt-1">Missão Digital</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type={show ? 'text' : 'password'}
                            value={pwd}
                            onChange={e => { setPwd(e.target.value); setError(false); }}
                            placeholder="Código de acesso"
                            className={`w-full px-4 py-3 pr-12 bg-surface-card border rounded-xl text-white placeholder-white/30 focus:outline-none transition-colors ${error ? 'border-red-500' : 'border-white/10 focus:border-brand-orange-light'}`}
                            autoFocus
                        />
                        <button type="button" onClick={() => setShow(s => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">Código incorreto</p>}
                    <button type="submit" className="w-full py-3 rounded-xl font-heading font-bold text-black transition-all hover:scale-[1.02]"
                        style={{ background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)` }}>
                        Entrar
                    </button>

                    <div className="text-center pt-4">
                        <Link to="home" className="text-xs text-white/30 hover:text-white transition-colors">Voltar para o site</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Recurso {
    id: string; slug: string; tipo: string;
    imagem_url: string | null; tags: string[]; destaque: boolean; ativo: boolean; ordem: number;
    traducoes?: RecursoTraducao[];
}
interface RecursoTraducao { id?: string; locale: string; titulo: string; descricao: string; descricao_completa: string; arquivo_url?: string | null; }

const LOCALES = ['pt', 'en', 'es'];
const TAGS_RECURSO = ['Líderes', 'Gamers', 'Pais'];
const TIPOS_RECURSO = ['ebook', 'checklist', 'guia', 'ferramenta', 'video'];

// ─── Recursos Tab ─────────────────────────────────────────────────────────────
function RecursosTab() {
    const [recursos, setRecursos] = useState<Recurso[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | 'new' | null>(null);
    const [form, setForm] = useState<Partial<Recurso> & { traducoes: RecursoTraducao[] }>({
        slug: '', tipo: 'ebook', imagem_url: '', tags: [], destaque: false, ativo: true, ordem: 0,
        traducoes: LOCALES.map(l => ({ locale: l, titulo: '', descricao: '', descricao_completa: '', arquivo_url: '' })),
    });
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from('recursos').select('*, recursos_traducoes(*)').order('ordem');
        setRecursos((data || []).map((r: any) => ({ ...r, traducoes: r.recursos_traducoes || [] })));
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const startNew = () => {
        setForm({
            slug: '', tipo: 'ebook', imagem_url: '', tags: [], destaque: false, ativo: true, ordem: recursos.length + 1,
            traducoes: LOCALES.map(l => ({ locale: l, titulo: '', descricao: '', descricao_completa: '', arquivo_url: '' })),
        });
        setEditingId('new');
    };

    const startEdit = (r: Recurso) => {
        setForm({
            ...r,
            traducoes: LOCALES.map(l => {
                const existing = (r.traducoes || []).find(t => t.locale === l);
                return existing || { locale: l, titulo: '', descricao: '', descricao_completa: '', arquivo_url: '' };
            }),
        });
        setEditingId(r.id);
    };

    const handleSave = async () => {
        if (!form.slug) return alert('Slug é obrigatório');
        setSaving(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { traducoes, recursos_traducoes, id, ...recursoData } = form as any; // Remove joined fields and ID
        let recursoId = editingId === 'new' ? null : editingId;

        if (editingId === 'new') {
            const { data, error } = await supabase.from('recursos').insert([recursoData]).select().single();
            if (error || !data) { setSaving(false); alert('Erro ao salvar recurso: ' + error?.message); return; }
            recursoId = data.id;
        } else {
            const { error } = await supabase.from('recursos').update(recursoData).eq('id', recursoId);
            if (error) { setSaving(false); alert('Erro ao atualizar recurso: ' + error.message); return; }
        }

        /* Upsert translations */
        for (const trad of (traducoes || [])) {
            if (!trad.titulo && !trad.arquivo_url) continue; // Pula se vazio
            await supabase.from('recursos_traducoes').upsert(
                { recurso_id: recursoId, ...trad },
                { onConflict: 'recurso_id,locale' }
            );
        }

        setSaving(false);
        setEditingId(null);
        load();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este recurso?')) return;
        await supabase.from('recursos').delete().eq('id', id);
        load();
    };

    const toggleTag = (tag: string) => {
        setForm(f => ({
            ...f,
            tags: f.tags?.includes(tag) ? f.tags.filter(t => t !== tag) : [...(f.tags || []), tag],
        }));
    };

    const handleTranslated = (localeIndex: number, translatedData: any) => {
        setForm(f => {
            const t = [...(f.traducoes || [])];
            t[localeIndex] = { ...t[localeIndex], ...translatedData };
            return { ...f, traducoes: t };
        });
    };

    if (editingId !== null) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between sticky top-0 bg-surface-primary z-10 py-4 border-b border-white/10">
                    <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                        <button onClick={() => setEditingId(null)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                            <CornerDownRight className="w-5 h-5 text-white/50" />
                        </button>
                        {editingId === 'new' ? 'Novo Recurso' : 'Editar Recurso'}
                    </h2>
                    <div className="flex gap-3">
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg text-white/50 hover:text-white transition-colors">Cancelar</button>
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg font-heading font-bold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)` }}>
                            <Check className="w-4 h-4" />{saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Field label="Identificação">
                            <input value={form.slug || ''} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                className={inputCls} placeholder="Slug (ex: checklist-mapa)" />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Tipo">
                                <select value={form.tipo || 'ebook'} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                                    className={inputCls}>
                                    {TIPOS_RECURSO.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Field>
                            <Field label="Ordem">
                                <input type="number" value={form.ordem || 0} onChange={e => setForm(f => ({ ...f, ordem: Number(e.target.value) }))}
                                    className={inputCls} />
                            </Field>
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 font-medium">Tags</label>
                            <div className="flex gap-2 flex-wrap">
                                {TAGS_RECURSO.map(tag => (
                                    <button key={tag} onClick={() => toggleTag(tag)} type="button"
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${form.tags?.includes(tag) ? 'border-transparent text-black' : 'border-white/10 text-white/60 hover:bg-white/10'}`}
                                        style={form.tags?.includes(tag) ? { background: THEME_COLOR } : {}}>
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-6 pt-2">
                            <Toggle label="Destaque" value={!!form.destaque} onChange={v => setForm(f => ({ ...f, destaque: v }))} />
                            <Toggle label="Ativo" value={!!form.ativo} onChange={v => setForm(f => ({ ...f, ativo: v }))} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Field label="Capa do Recurso">
                            <InputFile
                                bucket="uploads"
                                pathPrefix="covers"
                                value={form.imagem_url}
                                onChange={url => setForm(f => ({ ...f, imagem_url: url }))}
                                accept="image/*"
                                label="Selecione uma imagem"
                            />
                        </Field>
                    </div>
                </div>

                {/* Traduções */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="font-heading font-bold text-white/80 text-sm uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Conteúdo & Traduções
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {LOCALES.map((locale, i) => {
                            const ptData = form.traducoes?.find(t => t.locale === 'pt');
                            const showTranslateBtn = locale !== 'pt' && ptData?.titulo; // Só mostra se não for PT e PT tiver algo preenchido

                            return (
                                <div key={locale} className={`p-4 rounded-xl border space-y-3 relative group ${locale === 'pt' ? 'border-brand-orange-light/30 bg-brand-orange-light/5' : 'border-white/10 bg-surface-card/30'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${locale === 'pt' ? 'bg-brand-orange-light text-black' : 'bg-white/10 text-white/60'}`}>{locale}</span>
                                        </div>
                                        {showTranslateBtn && (
                                            <TranslateButton
                                                sourceData={{
                                                    titulo: ptData?.titulo,
                                                    descricao: ptData?.descricao,
                                                    descricao_completa: ptData?.descricao_completa
                                                }}
                                                targetLocale={locale}
                                                onSuccess={(data) => handleTranslated(i, data)}
                                            />
                                        )}
                                    </div>

                                    <input value={form.traducoes?.[i]?.titulo || ''} placeholder="Título"
                                        onChange={e => setForm(f => {
                                            const t = [...(f.traducoes || [])];
                                            t[i] = { ...t[i], titulo: e.target.value };
                                            return { ...f, traducoes: t };
                                        })} className={inputCls} />

                                    <textarea value={form.traducoes?.[i]?.descricao || ''} placeholder="Descrição curta"
                                        onChange={e => setForm(f => {
                                            const t = [...(f.traducoes || [])];
                                            t[i] = { ...t[i], descricao: e.target.value };
                                            return { ...f, traducoes: t };
                                        })} className={`${inputCls} resize-none`} rows={3} />

                                    <textarea value={form.traducoes?.[i]?.descricao_completa || ''} placeholder="Descrição completa (modal)"
                                        onChange={e => setForm(f => {
                                            const t = [...(f.traducoes || [])];
                                            t[i] = { ...t[i], descricao_completa: e.target.value };
                                            return { ...f, traducoes: t };
                                        })} className={`${inputCls} resize-none`} rows={5} />

                                    <div className="pt-2 border-t border-white/5">
                                        <InputFile
                                            bucket="recursos-arquivos"
                                            pathPrefix={`files/${locale}`}
                                            value={form.traducoes?.[i]?.arquivo_url}
                                            onChange={url => setForm(f => {
                                                const t = [...(f.traducoes || [])];
                                                t[i] = { ...t[i], arquivo_url: url };
                                                return { ...f, traducoes: t };
                                            })}
                                            accept=".pdf,.zip,.docx"
                                            label={`Arquivo do Recurso (${locale.toUpperCase()})`}
                                            compact
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-orange-light" /> Recursos <span className="text-white/30 text-sm font-normal">({recursos.length})</span>
                </h2>
                <button onClick={startNew}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-black text-sm transition-all hover:scale-[1.02]"
                    style={{ background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)` }}>
                    <Plus className="w-4 h-4" /> Novo
                </button>
            </div>
            {loading ? <LoadingSpinner /> : (
                <div className="space-y-3">
                    {recursos.length === 0 && <p className="text-white/30 text-center py-8">Nenhum recurso cadastrado.</p>}
                    {recursos.map(r => {
                        const ptTrad = r.traducoes?.find(t => t.locale === 'pt');
                        return (
                            <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-surface-card/50 hover:border-white/20 transition-colors group">
                                {r.imagem_url ? (
                                    <img src={r.imagem_url} alt="" className="w-12 h-12 rounded object-cover bg-white/5" />
                                ) : (
                                    <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center text-white/20"><BookOpen className="w-6 h-6" /></div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-medium text-white truncate">{ptTrad?.titulo || r.slug}</p>
                                        {r.destaque && <Star className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
                                        {!r.ativo && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Inativo</span>}
                                    </div>
                                    <div className="flex gap-2 mt-1 flex-wrap items-center">
                                        <span className="text-xs text-white/30 font-mono bg-white/5 px-1.5 rounded">{r.slug}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                        {r.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/50">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(r)} className="p-2 rounded-lg hover:bg-white/10 text-white hover:text-brand-orange-light transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Cadastros Tab ─────────────────────────────────────────────────────────────
type CadastroType = 'intercessores' | 'parceiros_mensais' | 'cooperadores';

function CadastrosTab() {
    const [subTab, setSubTab] = useState<CadastroType>('intercessores');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        const { data: rows } = await supabase.from(subTab).select('*').order('criado_em', { ascending: false });
        setData(rows || []);
        setLoading(false);
    }, [subTab]);

    useEffect(() => { load(); }, [load]);

    const filtered = data.filter(r =>
        r.nome?.toLowerCase().includes(search.toLowerCase()) ||
        r.whatsapp?.includes(search)
    );

    const exportCSV = () => {
        if (!filtered.length) return;
        const keys = Object.keys(filtered[0]).filter(k => k !== 'id');
        const csv = [keys.join(','), ...filtered.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${subTab}.csv`; a.click();
    };

    const subTabs: { key: CadastroType; label: string; icon: React.ElementType }[] = [
        { key: 'intercessores', label: 'Intercessores', icon: Heart },
        { key: 'parceiros_mensais', label: 'Parceiros', icon: HandCoins },
        { key: 'cooperadores', label: 'Cooperadores', icon: Handshake },
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                    {subTabs.map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setSubTab(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${subTab === key ? 'text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                            style={subTab === key ? { background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)` } : {}}>
                            <Icon className="w-4 h-4" />{label}
                        </button>
                    ))}
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 text-white/60 hover:text-white text-sm transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-90" /> Exportar CSV
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou WhatsApp..."
                    className={`${inputCls} pl-10`} />
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="space-y-2">
                    <p className="text-white/40 text-sm pl-1">{filtered.length} registros</p>
                    {filtered.map((r, i) => (
                        <div key={r.id || i} className="p-4 rounded-xl border border-white/10 bg-surface-card/50 hover:bg-surface-card/80 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium text-white">{r.nome}</p>
                                        {r.criado_em && (
                                            <span className="text-[10px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded">
                                                {new Date(r.criado_em).toLocaleDateString('pt-BR')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-white/50 text-sm space-y-0.5">
                                        <p className="flex items-center gap-1.5"><strong className="font-normal text-white/30 w-16">WhatsApp:</strong> {r.whatsapp}</p>
                                        <p className="flex items-center gap-1.5"><strong className="font-normal text-white/30 w-16">E-mail:</strong> {r.email}</p>
                                    </div>

                                    {subTab === 'cooperadores' && r.formas_cooperacao?.length > 0 && (
                                        <div className="flex gap-1 mt-3 flex-wrap">
                                            {r.formas_cooperacao.map((f: string) => (
                                                <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-brand-orange-light/10 text-brand-orange-light border border-brand-orange-light/20">{f}</span>
                                            ))}
                                        </div>
                                    )}
                                    {(subTab === 'intercessores' || subTab === 'parceiros_mensais') && r.valor_mensal && (
                                        <p className="text-green-400 text-xs mt-2 bg-green-500/10 inline-block px-2 py-1 rounded">R$ {r.valor_mensal} / mês</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="text-center text-white/30 py-8">Nenhum registro encontrado</p>}
                </div>
            )}
        </div>
    );
}

// ─── Shared UI Helpers ────────────────────────────────────────────────────────
const inputCls = 'w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors text-sm';

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">{label}</label>
            {children}
        </div>
    );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div onClick={() => onChange(!value)}
                className={`w-10 h-5 rounded-full transition-all relative ${value ? 'bg-brand-orange-light' : 'bg-white/20 group-hover:bg-white/30'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${value ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-white/60 group-hover:text-white transition-colors">{label}</span>
        </label>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/20 border-t-brand-orange-light rounded-full animate-spin" />
        </div>
    );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
type AdminTab = 'recursos' | 'depoimentos' | 'cadastros';

export const AdminPage: React.FC = () => {
    const { authed, login, logout } = useAdminAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('recursos');

    if (!authed) return <LoginScreen onLogin={login} />;

    const tabs: { key: AdminTab; label: string; icon: React.ElementType }[] = [
        { key: 'recursos', label: 'Recursos', icon: BookOpen },
        { key: 'depoimentos', label: 'Depoimentos', icon: MessageSquare },
        { key: 'cadastros', label: 'Cadastros', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-surface-primary pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-white/10 bg-surface-primary/95 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="home" className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ background: `${THEME_COLOR}20` }}>
                            <Lock className="w-4 h-4" style={{ color: THEME_COLOR }} />
                        </Link>
                        <div>
                            <span className="font-heading font-bold text-white text-sm block leading-none">Admin</span>
                            <span className="text-[10px] text-white/30 uppercase tracking-widest">Painel</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-secondary/50 p-1 rounded-xl border border-white/5">
                        {tabs.map(({ key, label, icon: Icon }) => (
                            <button key={key} onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === key ? 'text-black shadow-lg shadow-brand-orange-light/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                                style={activeTab === key ? { background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)` } : {}}>
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                    <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 text-xs uppercase tracking-wider font-bold transition-colors">
                        <LogOut className="w-4 h-4" /> Sair
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {activeTab === 'recursos' && <RecursosTab />}
                {activeTab === 'depoimentos' && <DepoimentosTab />}
                {activeTab === 'cadastros' && <CadastrosTab />}
            </div>
        </div>
    );
};

export default AdminPage;
