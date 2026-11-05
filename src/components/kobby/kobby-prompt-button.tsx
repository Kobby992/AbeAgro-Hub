"use client";

import type { ReactNode } from "react";
import { useKobbyStore } from "@/store/kobby";

/** Opens Kobby, optionally with a question already filled in. */
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
    <button type="button" className={className} onClick={() => openKobby(prompt)}>
      {children}
    </button>
  );
}
