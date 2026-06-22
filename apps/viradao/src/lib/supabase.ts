// Cliente Supabase do app (Fase 3). Todas as tabelas do jogo vivem no schema
// isolado `viradao` (o schema `public` e do site da Missao Digital e nao e
// tocado aqui). A anon key e publica por natureza; o RLS e quem protege.
import { createClient } from "@supabase/supabase-js";

// Defaults embutidos para o build nunca quebrar se o .env faltar no deploy.
const URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://wpgjlptwoydiejbphmhj.supabase.co";
const ANON =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZ2pscHR3b3lkaWVqYnBobWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzA1MDYsImV4cCI6MjA4NjQwNjUwNn0.JfjvVYWbbVnickEwRU8j7aTgqncZm2e9tolhI0yq7iI";

export const supabase = createClient(URL, ANON, {
  db: { schema: "viradao" }, // .from('teams') -> viradao.teams
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 3 } },
});
