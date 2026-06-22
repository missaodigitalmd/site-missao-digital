import { create } from "zustand";

// Garante "um audio por vez" (Design System 6.4): so um card narra ao mesmo tempo.
interface AudioState {
  activeId: string | null;
  setActive: (id: string | null) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  activeId: null,
  setActive: (id) => set({ activeId: id }),
}));
