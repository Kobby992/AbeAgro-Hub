export const CHATBOT_SCRIPT_ID = "jotform-agent";

const CONTAINER = ".embedded-agent-container";
const TOGGLE = ".ai-agent-chat-avatar";
const WAIT_MS = 12_000;
const POLL_MS = 150;
const PRESS_AGAIN_MS = 900;

/**
 * Opens the Jotform chatbot by pressing its own button, as its embed code gives us no way to open it
 * from the page. It runs on another domain, so a question cannot be typed into it from here.
 * The button appears before it responds, so this presses until the chat has really opened.
 * Resolves false if it never does, so the caller can offer another way to get help.
 */
export async function openChatbot(): Promise<boolean> {
  const deadline = Date.now() + WAIT_MS;
  let pressedAt = 0;

  while (Date.now() < deadline) {
    // Missing if the widget is switched off or failed to download, so there is no point waiting.
    if (!document.getElementById(CHATBOT_SCRIPT_ID)) return false;
    const container = document.querySelector(CONTAINER);
    if (container?.classList.contains("opened")) return true;
    const toggle = container?.querySelector<HTMLElement>(TOGGLE);
    if (toggle && Date.now() - pressedAt >= PRESS_AGAIN_MS) {
      toggle.click();
      pressedAt = Date.now();
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  return false;
}
