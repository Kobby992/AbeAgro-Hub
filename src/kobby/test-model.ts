import type { LanguageModelV4, LanguageModelV4StreamPart } from "@ai-sdk/provider";
import { simulateReadableStream, type LanguageModel } from "ai";

type Prompt = Parameters<LanguageModelV4["doStream"]>[0]["prompt"];

const USAGE = {
  inputTokens: { total: 100, noCache: 20, cacheRead: 80, cacheWrite: 0 },
  outputTokens: { total: 20, text: 20, reasoning: undefined },
};

function lastUserText(prompt: Prompt): string {
  const message = [...prompt].reverse().find((entry) => entry.role === "user");
  if (!message) return "";
  return message.content.flatMap((part) => (part.type === "text" ? part.text : [])).join(" ");
}

function textParts(text: string): LanguageModelV4StreamPart[] {
  return [
    { type: "text-start", id: "text" },
    ...text
      .split(/(?<= )/)
      .map((delta): LanguageModelV4StreamPart => ({ type: "text-delta", id: "text", delta })),
    { type: "text-end", id: "text" },
  ];
}

let calls = 0;

function call(toolName: string, input: unknown): LanguageModelV4StreamPart[] {
  calls += 1;
  return [
    { type: "tool-call", toolCallId: `call-${calls}`, toolName, input: JSON.stringify(input) },
  ];
}

const PUMP = "petrol-water-pump-3-inch-wp30";
const HOSE = "pvc-lay-flat-irrigation-hose";

/** Picks a scripted move from the customer's words. A reply follows once a tool has run. */
function script(prompt: Prompt): LanguageModelV4StreamPart[] {
  const text = lastUserText(prompt);

  if (prompt.at(-1)?.role === "tool") {
    if (/my details/i.test(text)) return textParts("Your request is ready. Press send below.");
    return textParts("Here you go. Would you like a quote for these?");
  }
  if (/server error/i.test(text)) throw new Error("Scripted failure");
  if (/add .*list/i.test(text)) return call("addToQuoteList", { items: [{ slug: PUMP, qty: 2 }] });
  if (/pump/i.test(text)) return call("showProducts", { slugs: [PUMP, HOSE] });
  if (/my details/i.test(text)) {
    return call("prepareQuoteRequest", {
      name: "Ama Mensah",
      phone: "024 123 4567",
      location: "Kasoa, Central Region",
      items: [{ slug: PUMP, qty: 2 }],
    });
  }
  if (/person|tractor/i.test(text)) {
    return call("handoffToHuman", {
      reason: "Not in the catalogue",
      summary: "I am looking for a tractor.",
    });
  }
  return textParts("Tell me what you grow or process, and I will help you find a machine.");
}

/** A scripted stand-in for Claude. It tests the route, tools and chat, never Kamal's judgement. */
export function createTestModel(): LanguageModel {
  const model: LanguageModelV4 = {
    specificationVersion: "v4",
    provider: "kobby-test",
    modelId: "scripted",
    supportedUrls: {},
    doGenerate() {
      throw new Error("Kamal only streams");
    },
    async doStream({ prompt }) {
      const parts = script(prompt);
      const calledTool = parts.some((part) => part.type === "tool-call");
      return {
        stream: simulateReadableStream<LanguageModelV4StreamPart>({
          chunkDelayInMs: 5,
          chunks: [
            { type: "stream-start", warnings: [] },
            ...parts,
            {
              type: "finish",
              finishReason: {
                unified: calledTool ? "tool-calls" : "stop",
                raw: undefined,
              },
              usage: USAGE,
            },
          ],
        }),
      };
    },
  };
  return model;
}
