import type { KobbyMessage } from "@/kobby/tools";

// The chat follows the customer across pages until the tab closes (BUILD_SPEC §7.6).
const CHAT_KEY = "abe-kobby-chat";
const MAX_SAVED_MESSAGES = 30;

let sessionId = "";

function newSessionId(): string {
  return crypto.randomUUID();
}

export function getSessionId(): string {
  sessionId ||= newSessionId();
  return sessionId;
}

/** Storage can throw in private windows, and the chat must still work without it. */
export function loadChat(): KobbyMessage[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(CHAT_KEY) ?? "null") as {
      sessionId: string;
      messages: KobbyMessage[];
    } | null;
    if (!saved) return [];
    sessionId = saved.sessionId;
    return saved.messages;
  } catch {
    return [];
  }
}

export function saveChat(messages: KobbyMessage[]) {
  try {
    sessionStorage.setItem(
      CHAT_KEY,
      JSON.stringify({ sessionId: getSessionId(), messages: messages.slice(-MAX_SAVED_MESSAGES) }),
    );
  } catch {
    // The chat still works for this page.
  }
}

export function clearChat() {
  sessionId = newSessionId();
  try {
    sessionStorage.removeItem(CHAT_KEY);
  } catch {
    // Nothing was saved, so there is nothing to clear.
  }
}

type Chip = { label: string; message: string };

const OPENING_CHIPS: Chip[] = [
  { label: "Find a water pump", message: "Help me find a water pump." },
  { label: "Start a rice mill", message: "I want to start a rice mill." },
  { label: "Grinding & milling", message: "I need a machine for grinding and milling." },
  { label: "Get a quote", message: "I'd like to get a quote." },
];

function productChips(name: string): Chip[] {
  return [
    { label: "Is this right for me?", message: `Is the ${name} right for me?` },
    { label: "What power does it need?", message: `What power does the ${name} need?` },
    { label: "Add to quote", message: `Add the ${name} to my quote list.` },
  ];
}

/** Next steps to tap. None while Kamal waits on an answer, such as the customer's name (§7.4). */
export function quickReplies(messages: KobbyMessage[], productName?: string): Chip[] {
  const last = messages.at(-1);
  if (!last) return productName ? productChips(productName) : OPENING_CHIPS;
  if (last.role !== "assistant") return [];

  const finished = last.parts.some(
    (part) => part.type === "tool-prepareQuoteRequest" && part.state === "output-available",
  );
  if (finished) return [];

  const text = last.parts.flatMap((part) => (part.type === "text" ? part.text : [])).join(" ");
  const showedCards = last.parts.some((part) => part.type === "tool-showProducts");
  if (text.trim().endsWith("?") && !showedCards) return [];

  return [
    { label: "Get a quote", message: "I'd like to get a quote for these." },
    { label: "Find another machine", message: "I need help finding another machine." },
  ];
}
