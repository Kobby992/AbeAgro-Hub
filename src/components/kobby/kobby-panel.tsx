"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { KobbyMessageView } from "@/components/kobby/kobby-message";
import { flyToQuote } from "@/components/motion/fly-to-quote";
import { Button } from "@/components/ui/button";
import { clearChat, getSessionId, loadChat, quickReplies, saveChat } from "@/kobby/chat-session";
import type { KobbyMessage } from "@/kobby/tools";
import { whatsappLink } from "@/lib/whatsapp";
import { returnFocusToOpener, useKobbyStore } from "@/store/kobby";
import { useQuoteStore } from "@/store/quote";

const MAX_MESSAGE_LENGTH = 1000;
const MESSAGES_SENT = 30;

const PERSON_LINK = whatsappLink(
  "Hello ABE Agro Hub 👋\nI'd like to talk to someone about a machine.",
);

const transport = new DefaultChatTransport<KobbyMessage>({
  api: "/api/kobby",
  prepareSendMessagesRequest: ({ messages }) => ({
    body: {
      messages: messages.slice(-MESSAGES_SENT),
      sessionId: getSessionId(),
      path: window.location.pathname,
      quoteList: useQuoteStore.getState().items.map(({ slug, qty }) => ({ slug, qty })),
    },
  }),
});

function failureMessage(error: Error): string {
  if (error.message.includes("rate_limited")) {
    return "You've sent a lot of messages. Wait a few minutes, or talk to our team on WhatsApp now.";
  }
  return "Kamal can't reply right now. Our sales team can help you on WhatsApp.";
}

function quoteListCalls(messages: KobbyMessage[]) {
  return messages.flatMap((message) =>
    message.parts.flatMap((part) =>
      part.type === "tool-addToQuoteList" && part.state === "output-available"
        ? [{ id: part.toolCallId, items: part.output.added }]
        : [],
    ),
  );
}

export default function KobbyPanel() {
  const isOpen = useKobbyStore((state) => state.isOpen);
  const prompt = useKobbyStore((state) => state.prompt);
  const product = useKobbyStore((state) => state.product);
  const closeKobby = useKobbyStore((state) => state.closeKobby);

  const [restored] = useState(loadChat);
  const { messages, sendMessage, setMessages, status, error, regenerate, clearError } =
    useChat<KobbyMessage>({ messages: restored, transport, throttle: 40 });

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const appliedCalls = useRef(new Set(quoteListCalls(restored).map((call) => call.id)));
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready") saveChat(messages);
  }, [messages, status]);

  // Kamal's list additions join the same list as the site's buttons, once each.
  useEffect(() => {
    for (const { id, items } of quoteListCalls(messages)) {
      if (appliedCalls.current.has(id)) continue;
      appliedCalls.current.add(id);
      for (const { slug, qty, note } of items) {
        const card = document.querySelector<HTMLElement>(`[data-kobby-card="${slug}"]`);
        const { add, setNote } = useQuoteStore.getState();
        const addItem = () => {
          add(slug, qty);
          if (note) setNote(slug, note);
        };
        if (card) flyToQuote(card, addItem);
        else addItem();
      }
    }
  }, [messages]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, status, isOpen]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    clearError();
    void sendMessage({ text: trimmed });
  }

  function reset() {
    clearChat();
    appliedCalls.current.clear();
    clearError();
    setMessages([]);
  }

  const last = messages.at(-1);
  const showTyping =
    isBusy && !(last?.role === "assistant" && last.parts.some((part) => part.type === "text"));
  const chips = isBusy || error ? [] : quickReplies(messages, product?.name);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeKobby()}>
      <Dialog.Portal>
        <Dialog.Content
          data-lenis-prevent
          onOpenAutoFocus={(event) => {
            // Opening the phone keyboard straight away would hide the answer chips.
            if (prompt || matchMedia("(min-width: 640px)").matches) {
              event.preventDefault();
              inputRef.current?.focus();
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusToOpener();
          }}
          className="fixed inset-0 z-50 flex h-dvh flex-col bg-card pt-[env(safe-area-inset-top)] text-charcoal shadow-lg duration-250 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:inset-auto sm:bottom-4 sm:left-4 sm:h-160 sm:max-h-[calc(100dvh-2rem)] sm:w-100 sm:origin-bottom-left sm:rounded-lg"
        >
          <header className="border-b border-border px-3 py-2">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold font-display text-xl font-bold text-charcoal"
              >
                K
              </span>
              <div className="min-w-0 flex-1">
                <Dialog.Title className="font-sans text-lg leading-tight font-bold">
                  Kamal
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  ABE Agro Hub machinery advisor
                </Dialog.Description>
              </div>
              <Button variant="ghost" size="icon" aria-label="Start a new chat" onClick={reset}>
                <RotateCcw aria-hidden />
              </Button>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close">
                  <X aria-hidden />
                </Button>
              </Dialog.Close>
            </div>
            <a
              href={PERSON_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-1.5 text-sm font-semibold text-forest underline"
            >
              <MessageCircle aria-hidden className="size-4" />
              Talk to a person on WhatsApp
            </a>
          </header>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-busy={isBusy}
            aria-label="Chat with Kamal"
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-3"
          >
            <p className="max-w-[90%] rounded-lg bg-background px-3 py-2">
              {product ? (
                <>
                  Akwaaba! Ask me anything about the <strong>{product.name}</strong>.
                </>
              ) : (
                "Akwaaba! I'm Kamal from ABE Agro Hub. Tell me what you grow or process, and I'll help you find the right machine and send a quote request to our team on WhatsApp."
              )}
            </p>
            {messages.map((message) => (
              <KobbyMessageView key={message.id} message={message} onNavigate={closeKobby} />
            ))}
            {showTyping && (
              <p className="flex w-fit gap-1 rounded-lg bg-background px-3 py-3">
                <span className="sr-only">Kamal is typing</span>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    aria-hidden
                    style={{ animationDelay: `${delay}ms` }}
                    className="size-2 rounded-full bg-muted-foreground motion-safe:animate-pulse"
                  />
                ))}
              </p>
            )}
            {error && (
              <div role="alert" className="rounded-lg border border-border bg-background p-3">
                <p>{failureMessage(error)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <a href={PERSON_LINK} target="_blank" rel="noopener noreferrer">
                      Message us on WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void regenerate()}>
                    Try again
                  </Button>
                </div>
              </div>
            )}
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {chips.map((chip) => (
                <Button
                  key={chip.label}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => send(chip.message)}
                >
                  {chip.label}
                </Button>
              ))}
            </div>
          )}

          {/* Keyed so a question from another button replaces what was typed before. */}
          <Composer key={prompt} initial={prompt} inputRef={inputRef} busy={isBusy} onSend={send} />
          <p className="px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-xs text-muted-foreground">
            Chats are saved to improve service. Don&apos;t share payment details.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Composer({
  initial,
  inputRef,
  busy,
  onSend,
}: {
  initial: string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  busy: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState(initial);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!text.trim() || busy) return;
    onSend(text);
    setText("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2 border-t border-border p-3 pb-2">
      <textarea
        ref={inputRef}
        rows={1}
        value={text}
        maxLength={MAX_MESSAGE_LENGTH}
        aria-label="Your message to Kamal"
        placeholder="Type your message"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        className="max-h-28 min-h-11 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2.5"
      />
      <Button type="submit" size="icon" aria-label="Send message" disabled={busy || !text.trim()}>
        <Send aria-hidden />
      </Button>
    </form>
  );
}
