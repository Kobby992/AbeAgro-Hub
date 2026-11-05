import { create } from "zustand";

type KobbyState = {
  isOpen: boolean;
  hasOpened: boolean;
  prompt: string;
  openKobby: (prompt?: string) => void;
  closeKobby: () => void;
};

export const useKobbyStore = create<KobbyState>((set) => ({
  isOpen: false,
  hasOpened: false,
  prompt: "",
  openKobby: (prompt = "") => set({ isOpen: true, hasOpened: true, prompt }),
  closeKobby: () => set({ isOpen: false }),
}));
