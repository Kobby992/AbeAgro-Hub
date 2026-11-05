import { after, NextResponse } from "next/server";
import { contactMessages, partnerEnquiries } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email";
import { enquiryRequestSchema, type EnquiryFields } from "@/lib/enquiry-schema";
import { normalizePhone } from "@/lib/phone";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { writeToTestSink } from "@/lib/test-sink";

export type EnquiryKind = "partner" | "contact";

const LABEL: Record<EnquiryKind, string> = {
  partner: "Partner enquiry",
  contact: "Contact message",
};

const allow = createRateLimiter({ capacity: 10, perMs: 60_000 });
const MIN_FORM_MS = 2_000;

async function saveEnquiry(kind: EnquiryKind, enquiry: EnquiryFields): Promise<void> {
  const record = {
    name: enquiry.name,
    phoneE164: enquiry.phone ? normalizePhone(enquiry.phone)?.e164 : undefined,
    email: enquiry.email || undefined,
    message: enquiry.message,
  };
  try {
    if (await writeToTestSink(kind, { ...record, company: enquiry.company })) return;
    const db = getDb();
    if (!db) {
      console.error(`${LABEL[kind]} not saved: DATABASE_URL is not set`);
    } else if (kind === "partner") {
      await db
        .insert(partnerEnquiries)
        .values({ ...record, company: enquiry.company || undefined });
    } else {
      await db.insert(contactMessages).values(record);
    }
  } catch (error) {
    console.error(`${LABEL[kind]} not saved:`, (error as Error).message);
  }
}

function emailText(kind: EnquiryKind, enquiry: EnquiryFields): string {
  return [
    `${LABEL[kind]} from the website`,
    `Name: ${enquiry.name}`,
    ...(enquiry.company ? [`Company: ${enquiry.company}`] : []),
    ...(enquiry.phone ? [`Phone: ${enquiry.phone}`] : []),
    ...(enquiry.email ? [`Email: ${enquiry.email}`] : []),
    "",
    enquiry.message,
  ].join("\n");
}

/** Shared handler for /api/partner and /api/contact. Saves the enquiry and emails the team. */
export async function handleEnquiry(kind: EnquiryKind, request: Request) {
  if (!allow(clientIp(request.headers))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const parsed = enquiryRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { enquiry, website, elapsedMs } = parsed.data;

  // Answer spam as normal so it learns nothing, but store and send nothing.
  if (website || (elapsedMs ?? MIN_FORM_MS) < MIN_FORM_MS) {
    return NextResponse.json({ ok: true });
  }

  await saveEnquiry(kind, enquiry);
  after(() =>
    sendNotificationEmail(`${LABEL[kind]} from ${enquiry.name}`, emailText(kind, enquiry)),
  );
  return NextResponse.json({ ok: true });
}
