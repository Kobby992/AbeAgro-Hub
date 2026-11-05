import { after, NextResponse } from "next/server";
import { markWhatsAppOpened } from "@/lib/leads";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { REFERENCE_PATTERN } from "@/lib/reference";

const allow = createRateLimiter({ capacity: 30, perMs: 60_000 });

/** Sent by the browser once WhatsApp opens, to fill the lead's wa_link_opened column (§8.4). */
export async function POST(request: Request) {
  if (!allow(clientIp(request.headers))) return new NextResponse(null, { status: 429 });
  const reference = await request.text();
  if (!REFERENCE_PATTERN.test(reference)) return new NextResponse(null, { status: 400 });
  after(() => markWhatsAppOpened(reference));
  return new NextResponse(null, { status: 204 });
}
