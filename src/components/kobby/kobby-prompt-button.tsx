"use client";

import type { ReactNode } from "react";
import { openChatbot } from "@/lib/open-chatbot";
import { useKobbyStore } from "@/store/kobby";

/**
 * Opens the Jotform chatbot. If it cannot be reached, opens the built-in panel with the question
 * filled in, so the button always gets the customer to help.
 */
export function KobbyPromptButton({
  prompt,
  className,
  children,
}: {
  prompt?: string;
  className?: string;
  children: ReactNode;
}) {
  const openKobby = useKobbyStore((state) => state.openKobby);
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        void openChatbot().then((opened) => {
          if (!opened) openKobby(prompt);
        });
      }}
    >
      {children}
    </button>
  );
}
