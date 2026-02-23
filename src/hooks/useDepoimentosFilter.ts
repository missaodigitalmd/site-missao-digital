
import { useState, useMemo } from 'react';
import type { Depoimento } from '../pages/admin/tabs/DepoimentosTab';

export type SortField = 'criado_em' | 'autor';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

export interface FilterConfig {
    destaque: 'all' | 'featured' | 'not_featured';
    tags: string[];
    includeUncategorized: boolean;
}

export function useDepoimentosFilter(initialDepoimentos: Depoimento[]) {
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'criado_em', direction: 'desc' });
    const [filters, setFilters] = useState<FilterConfig>({
        destaque: 'all',
        tags: [],
        includeUncategorized: false,
    });

    const filteredDepoimentos = useMemo(() => {
        let result = [...initialDepoimentos];

        // 1. Text Search
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(d =>
                d.autor.toLowerCase().includes(lowerSearch) ||
                d.cidade?.toLowerCase().includes(lowerSearch)
            );
        }

        // 2. Filters
        if (filters.destaque === 'featured') {
            result = result.filter(d => d.destaque);
        } else if (filters.destaque === 'not_featured') {
            result = result.filter(d => !d.destaque);
        }

        if (filters.includeUncategorized) {
            result = result.filter(d => !d.tags || d.tags.length === 0);
        } else if (filters.tags.length > 0) {
            // OR logic for tags (show if matches ANY selected tag)
            result = result.filter(d =>
                d.tags && d.tags.some(tag => filters.tags.includes(tag))
            );
        }

        // 3. Sorting
        result.sort((a, b) => {
            let valA: any = a[sortConfig.field];
            let valB: any = b[sortConfig.field];

            if (sortConfig.field === 'criado_em') {
                // Handle undefined/null dates by treating them as old
                valA = a.criado_em ? new Date(a.criado_em).getTime() : 0;
                valB = b.criado_em ? new Date(b.criado_em).getTime() : 0;
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB?.toLowerCase() || '';
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [initialDepoimentos, search, sortConfig, filters]);

    const toggleSort = (field: SortField) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const toggleFilterTag = (tag: string) => {
        setFilters(current => ({
            ...current,
            includeUncategorized: false,
            tags: current.tags.includes(tag)
                ? current.tags.filter(t => t !== tag)
                : [...current.tags, tag]
        }));
    };

    const toggleIncludeUncategorized = () => {
        setFilters(current => {
            const nextInclude = !current.includeUncategorized;
            return {
                ...current,
                includeUncategorized: nextInclude,
                tags: nextInclude ? [] : current.tags,
            };
        });
    };

    const toggleDestaque = () => {
        setFilters(current => {
            const nextState = {
                'all': 'featured',
                'featured': 'not_featured',
                'not_featured': 'all'
            }[current.destaque] as FilterConfig['destaque'];

            return { ...current, destaque: nextState };
        });
    };

    return {
        search, setSearch,
        sortConfig, toggleSort,
        filters, toggleFilterTag, toggleDestaque, toggleIncludeUncategorized,
        filteredDepoimentos
    };
}
