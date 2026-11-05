import { after, NextResponse } from "next/server";
import { categoryName, type CategorySlug } from "@/config/categories";
import { sendQuoteEmail } from "@/lib/email";
import { saveLead, type Lead } from "@/lib/leads";
import { normalizePhone } from "@/lib/phone";
import { getProduct } from "@/lib/products";
import {
  customerLocation,
  quoteRequestSchema,
  type QuoteRequest,
  type QuoteResponse,
} from "@/lib/quote-schema";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { createReference } from "@/lib/reference";
import { productQuoteLink, quoteRequestMessage, whatsappLink } from "@/lib/whatsapp";

const allow = createRateLimiter({ capacity: 30, perMs: 60_000 });

// A real person cannot read and complete the form this fast.
const MIN_FORM_MS = 2_000;

function isSpam(request: QuoteRequest): boolean {
  if (request.source !== "site") return false;
  return Boolean(request.website) || (request.elapsedMs ?? MIN_FORM_MS) < MIN_FORM_MS;
}

export async function POST(request: Request) {
  if (!allow(clientIp(request.headers))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = quoteRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const body = parsed.data;

  // Names always come from the catalogue, never from what the browser sent.
  const items = body.items.flatMap((item) => {
    const product = getProduct(item.slug);
    return product ? [{ ...item, product, name: product.name }] : [];
  });
  const [first] = items;
  if (!first) {
    return NextResponse.json({ error: "No known products" }, { status: 400 });
  }

  const reference = createReference();
  const stored = items.map(({ slug, name, qty, note }) => ({
    slug,
    name,
    qty,
    ...(note ? { note } : {}),
  }));

  let lead: Lead;
  let whatsappUrl: string;

  if (body.source === "product-quick") {
    lead = { reference, source: body.source, items: stored };
    whatsappUrl = productQuoteLink({
      name: first.name,
      category: categoryName(first.product.category as CategorySlug),
      slug: first.slug,
      qty: first.qty,
      reference,
    });
  } else {
    const { customer } = body;
    const phone = normalizePhone(customer.phone);
    const location = customerLocation(customer);
    lead = {
      reference,
      source: body.source,
      items: stored,
      name: customer.name,
      phoneE164: phone?.e164,
      location,
      customerType: customer.customerType || null,
      message: customer.message || null,
    };
    whatsappUrl = whatsappLink(
      quoteRequestMessage({
        reference,
        name: customer.name,
        phone: phone?.display ?? customer.phone,
        location,
        customerType: customer.customerType,
        items: stored,
        message: customer.message,
      }),
    );
  }

  const response: QuoteResponse = { reference, whatsappUrl };

  // Answer spam as normal so it learns nothing, but store and send nothing.
  if (isSpam(body)) return NextResponse.json(response);

  const fullLead: Lead = {
    ...lead,
    pageUrl: body.pageUrl ?? null,
    utm: body.utm ?? null,
    userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
  };

  await saveLead(fullLead);
  // Runs after the response, so a slow mail server never delays the customer (§8.3).
  after(() => sendQuoteEmail(fullLead));

  return NextResponse.json(response);
}
