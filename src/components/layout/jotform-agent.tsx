"use client";

import { useEffect } from "react";
import { CHATBOT_SCRIPT_ID } from "@/lib/open-chatbot";

const SCRIPT_SRC =
  "https://cdn.jotfor.ms/agent/embedjs/01a1ad995a9870008e58eaf7e2e8f461e4ce/embed.js";

/**
 * The Jotform chatbot. Its position and wording are set in Jotform, not here. It pulls in about
 * 1.8 MB of script, so it loads only once the page has finished, and never competes with the page
 * on mobile data. Browser tests skip it (navigator.webdriver) so they don't depend on Jotform.
 */
export function JotformAgent() {
  useEffect(() => {
    if (navigator.webdriver) return;

    function load() {
      // The script declares page-wide constants, so it must only ever run once.
      if (document.getElementById(CHATBOT_SCRIPT_ID)) return;
      const script = document.createElement("script");
      script.id = CHATBOT_SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.append(script);
    }

    if (document.readyState === "complete") {
      load();
      return;
    }
    window.addEventListener("load", load, { once: true });
    return () => window.removeEventListener("load", load);
  }, []);

  return null;
}
