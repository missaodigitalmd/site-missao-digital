import { create } from "zustand";

// Cross-feed entre equipes (Fase 6, Ponto 9). Estado leve, separado do jogo: guarda
// o toggle global (show_cross_feed do evento, sincronizado por realtime) e a fila de
// avisos passageiros ("Equipe X concluiu a 2a etapa") que sobem e somem na tela do
// jogador. Nao toca no relogio nem no progresso: e so clima de gincana.

export interface FeedMsg {
  id: number;
  text: string;
}

// Quanto tempo cada aviso fica na tela antes de sumir sozinho.
const TTL_MS = 6000;

interface FeedState {
  showCrossFeed: boolean;
  messages: FeedMsg[];
  setShowCrossFeed: (v: boolean) => void;
  push: (text: string) => void;
  remove: (id: number) => void;
}

let seq = 0;

export const useFeedStore = create<FeedState>((set, get) => ({
  showCrossFeed: true,
  messages: [],
  setShowCrossFeed: (v) => set({ showCrossFeed: v }),
  push: (text) => {
    // Respeita o toggle no momento de receber: desligado = nao mostra nada.
    if (!get().showCrossFeed) return;
    const id = ++seq;
    set((s) => ({ messages: [...s.messages, { id, text }] }));
    setTimeout(() => get().remove(id), TTL_MS);
  },
  remove: (id) => set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
}));
