import { create } from "zustand";

type KobbyState = {
  isOpen: boolean;
  hasOpened: boolean;
  prompt: string;
  /** The machine on the page the customer is viewing, for the context-aware opening (§7.6). */
  product: { name: string } | null;
  openKobby: (prompt?: string) => void;
  closeKobby: () => void;
  setProduct: (product: { name: string } | null) => void;
};

/** Whatever opened the panel, so focus can go back to it on close. */
let opener: HTMLElement | null = null;

export function returnFocusToOpener() {
  if (opener?.isConnected) opener.focus();
  opener = null;
}

export const useKobbyStore = create<KobbyState>((set) => ({
  isOpen: false,
  hasOpened: false,
  prompt: "",
  product: null,
  openKobby: (prompt = "") => {
    if (document.activeElement instanceof HTMLElement) opener = document.activeElement;
    set({ isOpen: true, hasOpened: true, prompt });
  },
  closeKobby: () => set({ isOpen: false }),
  setProduct: (product) => set({ product }),
}));
