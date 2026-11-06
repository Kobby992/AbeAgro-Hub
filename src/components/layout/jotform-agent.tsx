"use client";

import { useEffect } from "react";
import { CHATBOT_SCRIPT_ID } from "@/lib/open-chatbot";

const SCRIPT_SRC =
  "https://cdn.jotfor.ms/agent/embedjs/01a1ad995a9870008e58eaf7e2e8f461e4ce/embed.js";
const WAIT_MS = 8_000;
const FIRST_ACTIONS = ["pointerdown", "keydown", "scroll"] as const;

/**
 * The Jotform chatbot. Its position and wording are set in Jotform, not here. It downloads several
 * megabytes and keeps the phone busy while it starts, so it waits for the customer's first action,
 * or a few seconds. Someone who reads the page and leaves on mobile data never pays for it.
 * Browser tests skip it (navigator.webdriver) so they don't depend on Jotform.
 */
export function JotformAgent() {
  useEffect(() => {
    if (navigator.webdriver) return;

    function stopWaiting() {
      clearTimeout(timer);
      for (const action of FIRST_ACTIONS) window.removeEventListener(action, load, true);
    }

    function load() {
      stopWaiting();
      // The script declares page-wide constants, so it must only ever run once.
      if (document.getElementById(CHATBOT_SCRIPT_ID)) return;
      const script = document.createElement("script");
      script.id = CHATBOT_SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onerror = () => script.remove();
      document.body.append(script);
    }

    const timer = setTimeout(load, WAIT_MS);
    for (const action of FIRST_ACTIONS) {
      window.addEventListener(action, load, { passive: true, capture: true });
    }
    return stopWaiting;
  }, []);

  return null;
}
