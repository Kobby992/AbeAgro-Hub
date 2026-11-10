"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { whatsappLink } from "@/lib/whatsapp";
import { useKobbyStore } from "@/store/kobby";

/**
 * Stand-in until the real Kamal assistant arrives in Phase 6. It never answers questions itself,
 * so every entry point already works by handing the question to the sales team on WhatsApp.
 */
export default function KobbyPanel() {
  const isOpen = useKobbyStore((state) => state.isOpen);
  const prompt = useKobbyStore((state) => state.prompt);
  const closeKobby = useKobbyStore((state) => state.closeKobby);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeKobby()}>
      <Dialog.Portal>
        <Dialog.Content
          data-lenis-prevent
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-card p-5 text-charcoal shadow-lg duration-250 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 sm:inset-auto sm:bottom-4 sm:left-4 sm:w-100 sm:rounded-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="text-2xl">Talk to our team</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X aria-hidden />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1">
            Kamal, our machinery advisor, is coming soon. For now, send your question to our sales
            team on WhatsApp.
          </Dialog.Description>
          {/* Keyed so a new prompt from another button replaces what was typed before. */}
          <QuestionForm key={prompt} initial={prompt} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function QuestionForm({ initial }: { initial: string }) {
  const [question, setQuestion] = useState(initial);

  return (
    <div className="mt-4 flex flex-col gap-3">
      <Field label="Your question">
        {(control) => (
          <Textarea
            placeholder="Tell us what you grow or process"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            {...control}
          />
        )}
      </Field>
      <Button asChild>
        <a
          href={whatsappLink(
            question.trim() || "Hello ABE Agro Hub 👋\nI need help choosing a machine.",
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          Send on WhatsApp
        </a>
      </Button>
    </div>
  );
}
