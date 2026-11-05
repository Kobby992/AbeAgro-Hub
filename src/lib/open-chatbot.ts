export const CHATBOT_SCRIPT_ID = "jotform-agent";

const CONTAINER = ".embedded-agent-container";
const TOGGLE = ".ai-agent-chat-avatar";
const WAIT_MS = 3_000;
const POLL_MS = 150;

/**
 * Opens the Jotform chatbot by pressing its own button, as its embed code gives us no way to open it from
 * the page. It runs on another domain, so a question cannot be typed into it from here.
 * Resolves false if it never appears, so the caller can offer another way to get help.
 */
export async function openChatbot(): Promise<boolean> {
  if (!document.getElementById(CHATBOT_SCRIPT_ID)) return false;

  const deadline = Date.now() + WAIT_MS;
  while (Date.now() < deadline) {
    const container = document.querySelector(CONTAINER);
    if (container?.classList.contains("opened")) return true;
    const toggle = container?.querySelector<HTMLElement>(TOGGLE);
    if (toggle) {
      toggle.click();
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  return false;
}
