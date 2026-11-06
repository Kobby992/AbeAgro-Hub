"use client";

import { useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { openChatbot } from "@/lib/open-chatbot";
import { cn } from "@/lib/utils";
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
  const [opening, setOpening] = useState(false);

  return (
    <button
      type="button"
      aria-busy={opening}
      className={cn(className, opening && "cursor-progress opacity-70")}
      onClick={() => {
        if (opening) return;
        setOpening(true);
        track("kobby_opened", { page: location.pathname, trigger: "cta" });
        void openChatbot().then((opened) => {
          setOpening(false);
          if (!opened) openKobby(prompt);
        });
      }}
    >
      {children}
    </button>
  );
}
