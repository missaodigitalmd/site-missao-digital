
import React, { useState } from 'react';
import { X, Check, Image as ImageIcon, FileText, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaLibraryModal } from './MediaLibraryModal';

interface InputFileProps {
    bucket: string;
    pathPrefix: string;
    value?: string | null;
    onChange: (url: string | null) => void;
    accept?: string;
    label?: string;
    className?: string;
    previewUrl?: string | null;
    compact?: boolean;
}

export const InputFile: React.FC<InputFileProps> = ({
    bucket,
    pathPrefix,
    value,
    onChange,
    accept = 'image/*',
    label = 'Arquivo',
    className,
    previewUrl,
    compact = false
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    };

    const handleSelect = (url: string) => {
        onChange(url);
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && <label className="text-xs text-white/50 font-medium">{label}</label>}

            <div
                className={cn(
                    "relative group border border-white/10 bg-surface-secondary rounded-lg overflow-hidden transition-all hover:border-white/20 cursor-pointer",
                    value ? "pr-10" : "p-2",
                    compact ? "text-xs" : ""
                )}
                onClick={() => setIsModalOpen(true)}
            >
                {value ? (
                    <div className="flex items-center gap-3 w-full p-2">
                        {previewUrl || (accept.includes('image') && value.startsWith('http')) ? (
                            <img
                                src={previewUrl || value}
                                alt="Preview"
                                className="w-10 h-10 object-cover rounded bg-black/20"
                            />
                        ) : (
                            <div className="w-10 h-10 flex items-center justify-center rounded bg-white/5">
                                {accept.includes('pdf') ? <FileText className="w-5 h-5 text-white/40" /> : <ImageIcon className="w-5 h-5 text-white/40" />}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{value.split('/').pop()}</p>
                            <p className="text-green-400 text-xs flex items-center gap-1">
                                <Check className="w-3 h-3" /> Selecionado da biblioteca
                            </p>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors z-10"
                            title="Remover arquivo"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "flex items-center justify-center gap-2 transition-colors hover:bg-white/5 text-white/40 group-hover:text-white",
                            compact ? "py-2" : "py-8"
                        )}
                    >
                        <FolderOpen className="w-5 h-5 group-hover:text-brand-orange-light transition-colors" />
                        <span className="transition-colors select-none">
                            {compact ? 'Selecionar' : 'Abrir Biblioteca de Mídia'}
                        </span>
                    </div>
                )}
            </div>

            <MediaLibraryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleSelect}
                bucket={bucket}
                pathPrefix={pathPrefix}
                accept={accept}
                title={label}
            />
        </div>
    );
};

