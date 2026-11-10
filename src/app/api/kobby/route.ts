import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  validateUIMessages,
  type UIMessage,
} from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { kobbyModel, kobbySettings, messageText, pageDetails, trimHistory } from "@/kobby/agent";
import type { KobbyMessage } from "@/kobby/tools";
import { logConversation, withinDailyCap } from "@/kobby/usage";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

export const maxDuration = 60;

const MAX_BODY_BYTES = 256 * 1024;
const MAX_CUSTOMER_MESSAGE = 1000;
const RATE_WINDOW_MS = 10 * 60_000;

// §7.7: 20 messages per 10 minutes. Browser tests share one address, so they raise it.
const allow = createRateLimiter({
  capacity: Number(process.env.KOBBY_IP_LIMIT) || 20,
  perMs: RATE_WINDOW_MS,
});

const requestSchema = z.object({
  sessionId: z.string().regex(/^[\w-]{8,64}$/),
  path: z.string().max(200).optional(),
  quoteList: z
    .array(z.object({ slug: z.string().max(120), qty: z.number().int().min(1).max(999) }))
    .max(50)
    .optional(),
  messages: z
    .array(z.looseObject({ role: z.enum(["user", "assistant"]) }))
    .min(1)
    .max(60),
});

function refuse(code: string, status: number) {
  return NextResponse.json({ error: code }, { status });
}

export async function POST(request: Request) {
  if (!allow(clientIp(request.headers))) return refuse("rate_limited", 429);
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return refuse("too_large", 413);
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return refuse("invalid", 400);
  const { sessionId, path, quoteList } = parsed.data;

  let messages: UIMessage[];
  try {
    messages = await validateUIMessages({ messages: parsed.data.messages });
  } catch {
    return refuse("invalid", 400);
  }
  const latest = messages.at(-1);
  if (latest?.role !== "user" || messageText(latest).length > MAX_CUSTOMER_MESSAGE) {
    return refuse("invalid", 400);
  }

  const model = await kobbyModel();
  if (!model) return refuse("unavailable", 503);
  if (!(await withinDailyCap())) return refuse("daily_cap", 503);

  const customerText = messages
    .filter((message) => message.role === "user")
    .map(messageText)
    .join(" ");
  const { recent, earlier } = trimHistory(messages);
  let quoteReference: string | undefined;

  const settings = kobbySettings(pageDetails({ path, quoteList }, earlier), {
    customerText,
    pageUrl: path,
    userAgent: request.headers.get("user-agent")?.slice(0, 500),
    onQuote: (reference) => {
      quoteReference = reference;
    },
  });

  let usage = { tokensIn: 0, tokensOut: 0, tokensCached: 0 };
  const result = streamText({
    model,
    ...settings,
    messages: await convertToModelMessages(recent, { tools: settings.tools }),
    onEnd: ({ usage: total }) => {
      usage = {
        tokensIn: total.inputTokens ?? 0,
        tokensOut: total.outputTokens ?? 0,
        tokensCached: total.inputTokenDetails?.cacheReadTokens ?? 0,
      };
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      tools: settings.tools,
      originalMessages: messages as KobbyMessage[],
      onError: () => "Kamal could not reply.",
      onEnd: ({ responseMessage }) =>
        logConversation({
          sessionId,
          newMessages: [latest, responseMessage],
          ...usage,
          quoteReference,
          pageContext: path,
        }),
    }),
  });
}
