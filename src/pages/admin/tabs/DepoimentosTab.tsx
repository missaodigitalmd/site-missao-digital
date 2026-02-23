
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { THEME_COLOR } from '@/constants/theme';
import {
    Plus, Check, MessageSquare, Star, Search,
    Filter, ArrowUpDown, ArrowUp, ArrowDown, X, CornerDownRight, Pencil, Trash2, Users
} from 'lucide-react';
import { InputFile } from '@/components/admin/InputFile';
import { TranslateButton } from '@/components/admin/TranslateButton';
import { useDepoimentosFilter } from '@/hooks/useDepoimentosFilter';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Depoimento {
    id: string; autor: string; cargo: string | null; igreja: string | null; cidade: string | null;
    bandeira_estado: string | null; bandeira_nacao: string | null; avatar_url: string | null;
    tags: string[]; aprovado: boolean; destaque: boolean; traducoes?: DepoimentoTraducao[];
    criado_em?: string;
}
export interface DepoimentoTraducao { id?: string; locale: string; texto: string; }

const LOCALES = ['pt', 'en', 'es'];
const TAGS_DEPOIMENTO = ['IA', 'DaoD', 'Gank', 'Ninive', 'Campeonato'];
const TAGS_META: Record<string, { color: string; activeText: string }> = {
    IA: { color: '#FFAC13', activeText: '#0D0D0D' },
    DaoD: { color: '#E040FB', activeText: '#FFFFFF' },
    Gank: { color: '#B388FF', activeText: '#0D0D0D' },
    Ninive: { color: '#FFD740', activeText: '#0D0D0D' },
    Campeonato: { color: '#FF5252', activeText: '#FFFFFF' },
};
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

function CategoryButton({
    tag,
    active,
    onClick,
    compact = false,
    disabled = false,
}: {
    tag: string;
    active: boolean;
    onClick: () => void;
    compact?: boolean;
    disabled?: boolean;
}) {
    const meta = TAGS_META[tag] || { color: THEME_COLOR, activeText: '#0D0D0D' };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`rounded-md border font-medium transition-all ${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} hover:bg-[var(--tag-color)] hover:text-[var(--tag-hover-text)]`}
            style={{
                ['--tag-color' as any]: meta.color,
                ['--tag-hover-text' as any]: meta.activeText,
                backgroundColor: active ? meta.color : 'transparent',
                borderColor: active ? meta.color : `${meta.color}90`,
                color: active ? meta.activeText : meta.color,
            }}
        >
            {tag}
        </button>
    );
}

export function DepoimentosTab() {
    const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | 'new' | null>(null);
    const [form, setForm] = useState<Partial<Depoimento> & { traducoes: DepoimentoTraducao[] }>({
        autor: '', cargo: '', igreja: '', cidade: '', bandeira_estado: '', bandeira_nacao: '',
        avatar_url: '', tags: [], aprovado: false, destaque: false,
        traducoes: LOCALES.map(l => ({ locale: l, texto: '' })),
    });
    const [saving, setSaving] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [updatingTagId, setUpdatingTagId] = useState<string | null>(null);

    // Initial Load
    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from('depoimentos').select('*, depoimentos_traducoes(*)').order('criado_em', { ascending: false });
        setDepoimentos((data || []).map((d: any) => ({ ...d, traducoes: d.depoimentos_traducoes || [] })));
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    // Filtering Hook
    const filter = useDepoimentosFilter(depoimentos);
    const { filteredDepoimentos } = filter;

    const startNew = () => {
        setForm({
            autor: '', cargo: '', igreja: '', cidade: '', bandeira_estado: '', bandeira_nacao: '',
            avatar_url: '', tags: [], aprovado: false, destaque: false,
            traducoes: LOCALES.map(l => ({ locale: l, texto: '' })),
        });
        setEditingId('new');
    };

    const startEdit = (d: Depoimento) => {
        setForm({
            ...d,
            traducoes: LOCALES.map(l => {
                const existing = (d.traducoes || []).find(t => t.locale === l);
                return existing || { locale: l, texto: '' };
            }),
        });
        setEditingId(d.id);
    };

    const handleSave = async () => {
        setSaving(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { traducoes, depoimentos_traducoes, id, criado_em, ...depData } = form as any;
        let depId = editingId === 'new' ? null : editingId;

        console.log('Sending update payload:', depData);

        if (editingId === 'new') {
            const { data, error } = await supabase.from('depoimentos').insert([depData]).select().single();
            if (error || !data) {
                setSaving(false);
                alert('Erro ao salvar depoimento: ' + error?.message);
                return;
            }
            depId = data.id;
        } else {
            const { error } = await supabase.from('depoimentos').update(depData).eq('id', depId);
            if (error) {
                console.error('Update error:', error);
                setSaving(false);
                alert('Erro ao atualizar depoimento: ' + error.message + '\nDetalhes no console.');
                return;
            } else {
                console.log('Update successful');
            }
        }

        for (const trad of (traducoes || [])) {
            if (!trad.texto) continue;
            await supabase.from('depoimentos_traducoes').upsert(
                { depoimento_id: depId, ...trad },
                { onConflict: 'depoimento_id,locale' }
            );
        }

        setSaving(false);
        setEditingId(null);
        load();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este depoimento?')) return;
        await supabase.from('depoimentos').delete().eq('id', id);
        load();
    };

    const toggleAprovado = async (d: Depoimento) => {
        await supabase.from('depoimentos').update({ aprovado: !d.aprovado }).eq('id', d.id);
        load();
    };

    const toggleDestaque = async (d: Depoimento) => {
        await supabase.from('depoimentos').update({ destaque: !d.destaque }).eq('id', d.id);
        load();
    };

    const toggleTag = (tag: string) => {
        setForm(f => ({
            ...f,
            tags: f.tags?.includes(tag) ? f.tags.filter(t => t !== tag) : [...(f.tags || []), tag],
        }));
    };

    const toggleTagInCard = async (d: Depoimento, tag: string) => {
        if (updatingTagId === d.id) return;

        const previousTags = d.tags || [];
        const nextTags = previousTags.includes(tag)
            ? previousTags.filter(t => t !== tag)
            : [...previousTags, tag];

        setDepoimentos(current => current.map(item =>
            item.id === d.id ? { ...item, tags: nextTags } : item
        ));
        setUpdatingTagId(d.id);

        const { error } = await supabase.from('depoimentos').update({ tags: nextTags }).eq('id', d.id);

        if (error) {
            setDepoimentos(current => current.map(item =>
                item.id === d.id ? { ...item, tags: previousTags } : item
            ));
            alert('Erro ao atualizar categoria do depoimento: ' + error.message);
        }

        setUpdatingTagId(null);
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
                        {editingId === 'new' ? 'Novo Depoimento' : 'Editar Depoimento'}
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
                    <div className="bg-surface-card/30 p-5 rounded-xl border border-white/10 space-y-4">
                        <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Dados do Autor</h3>
                        <Field label="Nome do Autor"><input value={form.autor || ''} onChange={e => setForm(f => ({ ...f, autor: e.target.value }))} className={inputCls} placeholder="Nome completo" /></Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Cargo / Função"><input value={form.cargo || ''} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} className={inputCls} placeholder="Ex: Pastor" /></Field>
                            <Field label="Igreja"><input value={form.igreja || ''} onChange={e => setForm(f => ({ ...f, igreja: e.target.value }))} className={inputCls} placeholder="Nome da igreja" /></Field>
                        </div>
                        <Field label="Cidade"><input value={form.cidade || ''} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} className={inputCls} placeholder="Cidade, Estado" /></Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Bandeira Estado (emoji/URL)"><input value={form.bandeira_estado || ''} onChange={e => setForm(f => ({ ...f, bandeira_estado: e.target.value }))} className={inputCls} placeholder="🏳️" /></Field>
                            <Field label="Bandeira País (emoji/URL)"><input value={form.bandeira_nacao || ''} onChange={e => setForm(f => ({ ...f, bandeira_nacao: e.target.value }))} className={inputCls} placeholder="🇧🇷" /></Field>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Field label="Avatar">
                            <InputFile
                                bucket="uploads"
                                pathPrefix="avatars"
                                value={form.avatar_url}
                                onChange={url => setForm(f => ({ ...f, avatar_url: url }))}
                                accept="image/*"
                                label="Foto do autor"
                                previewUrl={form.avatar_url}
                            />
                        </Field>

                        <div className="border border-white/10 p-4 rounded-xl space-y-4">
                            <label className="block text-xs text-white/50 font-medium">Classificação</label>
                            <div className="flex gap-2 flex-wrap">
                                {TAGS_DEPOIMENTO.map(tag => (
                                    <CategoryButton
                                        key={tag}
                                        tag={tag}
                                        active={!!form.tags?.includes(tag)}
                                        onClick={() => toggleTag(tag)}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-6 pt-2">
                                <Toggle label="Aprovado (Publicar)" value={!!form.aprovado} onChange={v => setForm(f => ({ ...f, aprovado: v }))} />
                                <Toggle label="Destaque (Home)" value={!!form.destaque} onChange={v => setForm(f => ({ ...f, destaque: v }))} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="font-heading font-bold text-white/80 text-sm uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Comentários & Traduções
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {LOCALES.map((locale, i) => {
                            const ptData = form.traducoes?.find(t => t.locale === 'pt');
                            const showTranslateBtn = locale !== 'pt' && ptData?.texto;

                            return (
                                <div key={locale} className={`p-4 rounded-xl border space-y-2 relative group ${locale === 'pt' ? 'border-brand-orange-light/30 bg-brand-orange-light/5' : 'border-white/10 bg-surface-card/30'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${locale === 'pt' ? 'bg-brand-orange-light text-black' : 'bg-white/10 text-white/60'}`}>{locale}</span>
                                        {showTranslateBtn && (
                                            <TranslateButton
                                                sourceData={{ texto: ptData?.texto }}
                                                targetLocale={locale}
                                                onSuccess={(data) => handleTranslated(i, data)}
                                            />
                                        )}
                                    </div>
                                    <textarea value={form.traducoes?.[i]?.texto || ''} placeholder={`Depoimento em ${locale}`}
                                        onChange={e => setForm(f => {
                                            const t = [...(f.traducoes || [])];
                                            t[i] = { ...t[i], texto: e.target.value };
                                            return { ...f, traducoes: t };
                                        })} className={`${inputCls} resize-none min-h-[120px]`} rows={5} />
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
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2 whitespace-nowrap">
                        <MessageSquare className="w-5 h-5 text-brand-orange-light" />
                        Depoimentos <span className="text-white/30 text-sm font-normal">({filteredDepoimentos.length})</span>
                    </h2>

                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            value={filter.search}
                            onChange={(e) => filter.setSearch(e.target.value)}
                            placeholder="Buscar autor ou cidade..."
                            className="w-full pl-9 pr-4 py-2 bg-surface-secondary/50 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light transition-colors"
                        />
                        {filter.search && (
                            <button onClick={() => filter.setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Sorting */}
                    <div className="flex bg-surface-secondary/50 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => filter.toggleSort('criado_em')}
                            className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium transition-all ${filter.sortConfig.field === 'criado_em' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                        >
                            Data
                            {filter.sortConfig.field === 'criado_em'
                                ? (filter.sortConfig.direction === 'asc'
                                    ? <ArrowUp className="w-3 h-3" />
                                    : <ArrowDown className="w-3 h-3" />)
                                : <ArrowUpDown className="w-3 h-3 opacity-60" />}
                        </button>
                        <button
                            onClick={() => filter.toggleSort('autor')}
                            className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium transition-all ${filter.sortConfig.field === 'autor' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                        >
                            Nome
                            {filter.sortConfig.field === 'autor'
                                ? (filter.sortConfig.direction === 'asc'
                                    ? <ArrowUp className="w-3 h-3" />
                                    : <ArrowDown className="w-3 h-3" />)
                                : <ArrowUpDown className="w-3 h-3 opacity-60" />}
                        </button>
                    </div>

                    {/* Filters Toggle Button - update check */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg border transition-all ${showFilters || filter.filters.destaque !== 'all' || filter.filters.tags.length > 0 || filter.filters.includeUncategorized
                            ? 'bg-brand-orange-light/10 border-brand-orange-light/30 text-brand-orange-light'
                            : 'bg-surface-secondary/50 border-white/10 text-white/60 hover:text-white'
                            }`}
                        title="Filtros"
                    >
                        <Filter className="w-5 h-5" />
                    </button>

                    <button onClick={startNew}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-black text-sm transition-all hover:scale-[1.02] ml-2"
                        style={{ background: `linear-gradient(135deg, ${THEME_COLOR}, #FF8C00)` }}>
                        <Plus className="w-4 h-4" /> Novo
                    </button>
                </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="p-4 bg-surface-secondary/30 border border-white/5 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-wrap gap-6 items-center">
                        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Status</span>
                            <button
                                onClick={filter.toggleDestaque}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${filter.filters.destaque === 'featured'
                                    ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                                    : filter.filters.destaque === 'not_featured'
                                        ? 'bg-white/10 border-white/20 text-white/60'
                                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                                    }`}
                            >
                                <Star
                                    className={`w-3 h-3 ${filter.filters.destaque === 'not_featured' ? 'opacity-50' : ''}`}
                                    fill={filter.filters.destaque === 'featured' ? "currentColor" : "none"}
                                />
                                {filter.filters.destaque === 'all' && 'Destaque: Todos'}
                                {filter.filters.destaque === 'featured' && 'Destaque: Sim'}
                                {filter.filters.destaque === 'not_featured' && 'Destaque: Não'}
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Categorias</span>
                            <div className="flex flex-wrap gap-2">
                                {TAGS_DEPOIMENTO.map(tag => (
                                    <CategoryButton
                                        key={tag}
                                        tag={tag}
                                        active={filter.filters.tags.includes(tag)}
                                        onClick={() => filter.toggleFilterTag(tag)}
                                        disabled={filter.filters.includeUncategorized}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={filter.toggleIncludeUncategorized}
                                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${filter.filters.includeUncategorized
                                        ? 'bg-brand-orange-light text-black border-brand-orange-light'
                                        : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    Sem categoria
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? <LoadingSpinner /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDepoimentos.length === 0 && (
                        <div className="col-span-full py-12 text-center text-white/30 bg-surface-card/30 rounded-xl border border-white/5 border-dashed">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhum depoimento encontrado.</p>
                        </div>
                    )}
                    {filteredDepoimentos.map(d => {
                        const ptTrad = d.traducoes?.find(t => t.locale === 'pt');
                        return (
                            <div key={d.id} className="p-4 rounded-xl border border-white/10 bg-surface-card/50 flex flex-col gap-3 group hover:border-white/20 transition-colors">
                                <div className="flex items-start gap-3">
                                    {d.avatar_url ? (
                                        <img src={d.avatar_url} alt={d.autor} className="w-12 h-12 rounded-full object-cover flex-shrink-0 bg-white/5" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20"><Users className="w-6 h-6" /></div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-medium text-white">{d.autor}</p>
                                            {d.destaque && <Star className="w-3.5 h-3.5 text-yellow-400" />}
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${d.aprovado ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                {d.aprovado ? 'Aprovado' : 'Pendente'}
                                            </span>
                                        </div>
                                        <p className="text-white/40 text-xs mt-0.5">{d.cargo} · {d.cidade}</p>
                                    </div>
                                </div>

                                {ptTrad?.texto && <p className="text-white/70 text-sm italic leading-relaxed line-clamp-3 min-h-[88px] bg-white/5 p-3 rounded-lg border border-white/5">"{ptTrad.texto}"</p>}

                                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                        <div className="flex gap-1 text-white/30 text-xs">
                                            {d.bandeira_nacao && (d.bandeira_nacao.startsWith('http') || d.bandeira_nacao.startsWith('/') ? <img src={d.bandeira_nacao} className="w-5 h-auto rounded-sm opacity-70" title="Bandeira Nação" /> : <span>{d.bandeira_nacao}</span>)}
                                            {d.bandeira_estado && (d.bandeira_estado.startsWith('http') || d.bandeira_estado.startsWith('/') ? <img src={d.bandeira_estado} className="w-5 h-auto rounded-sm opacity-70" title="Bandeira Estado" /> : <span>{d.bandeira_estado}</span>)}
                                        </div>
                                        <div className="flex gap-1 flex-wrap">
                                            {TAGS_DEPOIMENTO.map(tag => (
                                                <CategoryButton
                                                    key={`${d.id}-${tag}`}
                                                    tag={tag}
                                                    compact
                                                    active={!!d.tags?.includes(tag)}
                                                    onClick={() => toggleTagInCard(d, tag)}
                                                    disabled={updatingTagId === d.id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => toggleAprovado(d)} title={d.aprovado ? 'Desaprovar' : 'Aprovar'}
                                            className={`p-2 rounded-lg transition-colors ${d.aprovado ? 'text-green-400 hover:bg-green-500/20' : 'text-white/30 hover:bg-white/10'}`}>
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => toggleDestaque(d)} title={d.destaque ? 'Remover destaque' : 'Destacar'}
                                            className={`p-2 rounded-lg transition-colors ${d.destaque ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-white/30 hover:bg-white/10'}`}>
                                            <Star className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => startEdit(d)} className="p-2 rounded-lg hover:bg-white/10 text-white hover:text-brand-orange-light transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(d.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
