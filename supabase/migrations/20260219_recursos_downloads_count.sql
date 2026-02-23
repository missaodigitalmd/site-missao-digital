-- Adiciona contador de downloads por recurso (se ainda não existir)
ALTER TABLE public.recursos
ADD COLUMN IF NOT EXISTS downloads_count integer NOT NULL DEFAULT 0;

-- Função de incremento atômico
CREATE OR REPLACE FUNCTION public.incrementar_download_recurso(p_recurso_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.recursos
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = p_recurso_id;
END;
$$;

-- Permissões para uso no client com anon key
GRANT EXECUTE ON FUNCTION public.incrementar_download_recurso(uuid) TO anon, authenticated;
