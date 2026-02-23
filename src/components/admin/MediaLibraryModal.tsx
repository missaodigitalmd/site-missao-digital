import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Upload, Image as ImageIcon, FileText, Trash2, Loader2, Grid, List as ListIcon, Search } from 'lucide-react';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    bucket: string;
    pathPrefix: string;
    accept?: string;
    title?: string;
}

interface FileItem {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: Record<string, any>;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    bucket,
    pathPrefix,
    accept = 'image/*',
    title = 'Biblioteca de Mídia'
}) => {
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const loadFiles = useCallback(async () => {
        if (!isOpen) return;
        setLoading(true);
        // Remove trailing slashes to avoid issues
        const cleanPrefix = pathPrefix.replace(/\/$/, '');

        const { data, error } = await supabase.storage
            .from(bucket)
            .list(cleanPrefix, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            });

        if (error) {
            console.error('Error loading files:', error);
            // alert('Erro ao carregar arquivos: ' + error.message);
        } else {
            // Filter out empty folder placeholders if any
            const validFiles = (data || []).filter(f => f.name !== '.emptyFolderPlaceholder');
            setFiles(validFiles as FileItem[]);
        }
        setLoading(false);
    }, [isOpen, bucket, pathPrefix]);

    useEffect(() => {
        if (isOpen) {
            loadFiles();
            setActiveTab('library');
        }
    }, [isOpen, loadFiles]);

    const handleUpload = async (file: File) => {
        if (!file) return;

        try {
            setUploading(true);
            // Clean filename to avoid issues
            const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}-${cleanName}`;
            // Ensure pathPrefix does not end with slash and fileName does not start with one
            const cleanPrefix = pathPrefix.replace(/\/$/, '');
            const filePath = `${cleanPrefix}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Refresh library
            await loadFiles();
            setActiveTab('library');

            // Auto select? Optional. For now let user select.
        } catch (error: any) {
            alert('Erro no upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleSelectFile = (file: FileItem) => {
        // Construct public URL or path based on logic
        const cleanPrefix = pathPrefix.replace(/\/$/, '');
        const filePath = `${cleanPrefix}/${file.name}`;

        if (bucket === 'recursos-arquivos') {
            // For private buckets, we might want the path
            onSelect(filePath);
        } else {
            // For public buckets, get the public URL
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            onSelect(data.publicUrl);
        }
        onClose();
    };

    const handleDelete = async (e: React.MouseEvent, file: FileItem) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

        const cleanPrefix = pathPrefix.replace(/\/$/, '');
        const filePath = `${cleanPrefix}/${file.name}`;

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            loadFiles();
        }
    };

    const getFileUrl = (file: FileItem) => {
        const cleanPrefix = pathPrefix.replace(/\/$/, '');
        const filePath = `${cleanPrefix}/${file.name}`;
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    };

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-primary border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-heading font-bold text-white mb-1">{title}</h2>
                        <p className="text-white/40 text-sm">Gerencie seus arquivos do bucket: <span className="text-brand-orange-light">{bucket}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs & Toolbar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-secondary/20">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'library'
                                ? 'bg-white/10 text-white'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Biblioteca
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'upload'
                                ? 'bg-brand-orange-light text-black'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Upload className="w-4 h-4" /> Upload
                        </button>
                    </div>

                    {activeTab === 'library' && (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar arquivos..."
                                    className="pl-9 pr-4 py-1.5 bg-surface-primary border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-orange-light"
                                />
                            </div>
                            <div className="flex bg-surface-primary rounded-lg border border-white/10 p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                                >
                                    <ListIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-surface-card/30">
                    {activeTab === 'upload' ? (
                        <div
                            className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors min-h-[300px] ${dragActive ? 'border-brand-orange-light bg-brand-orange-light/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {uploading ? (
                                <div className="text-center">
                                    <Loader2 className="w-10 h-10 text-brand-orange-light animate-spin mx-auto mb-4" />
                                    <p className="text-white font-medium">Enviando arquivo...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Arraste e solte arquivos aqui</h3>
                                    <p className="text-white/40 mb-6 text-center max-w-xs">
                                        Ou clique no botão abaixo para selecionar arquivos do seu computador
                                    </p>
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept={accept}
                                        onChange={handleFileSelect}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="px-6 py-3 rounded-xl font-bold bg-white text-black hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        Selecionar Arquivo
                                    </label>
                                </>
                            )}
                        </div>
                    ) : (
                        loading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="w-8 h-8 text-brand-orange-light animate-spin" />
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-white/30">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 opacity-50" />
                                </div>
                                <p>Nenhum arquivo encontrado</p>
                                {search && <button onClick={() => setSearch('')} className="text-brand-orange-light text-sm mt-2 hover:underline">Limpar busca</button>}
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : "flex flex-col gap-2"}>
                                {filteredFiles.map((file) => {
                                    const isImage = file.metadata?.mimetype?.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                    // Use public URL for preview if bucket is public, otherwise try to sign or use placeholder
                                    // For resources-arquivos (private), we can't easily preview without signing. 
                                    // But Admin usually has access. The getFileUrl returns signed URL if bucket is private? 
                                    // getPublicUrl returns a URL that might not work for private buckets without a token, 
                                    // but we will use it for preview if possible.
                                    // Actually, Supabase public URL works if the bucket is public.
                                    // If private, we'd need createSignedUrl. For simplicty in Admin, we assume we can see it or use placeholder.
                                    const previewUrl = bucket === 'recursos-arquivos' ? null : getFileUrl(file);

                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => handleSelectFile(file)}
                                            className={`group relative border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-brand-orange-light/50 transition-all ${viewMode === 'list' ? 'flex items-center gap-4 p-3 hover:bg-white/5' : 'aspect-square bg-surface-secondary'
                                                }`}
                                        >
                                            {viewMode === 'grid' ? (
                                                <>
                                                    {isImage && previewUrl ? (
                                                        <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-white/20 p-4">
                                                            {isImage ? <ImageIcon className="w-8 h-8 mb-2" /> : <FileText className="w-8 h-8 mb-2" />}
                                                            <span className="text-xs text-center break-all line-clamp-2">{file.name}</span>
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                        <p className="text-white text-xs truncate font-medium mb-1">{file.name}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] text-white/60">
                                                                {(file.metadata?.size / 1024).toFixed(1)} KB
                                                            </span>
                                                            <button
                                                                onClick={(e) => handleDelete(e, file)}
                                                                className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                                                title="Excluir"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 rounded bg-white/5 flex-shrink-0 flex items-center justify-center text-white/30">
                                                        {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">{file.name}</p>
                                                        <p className="text-white/40 text-xs">{(file.metadata?.size / 1024).toFixed(1)} KB • {new Date(file.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDelete(e, file)}
                                                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
