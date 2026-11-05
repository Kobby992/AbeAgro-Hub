import nodemailer from "nodemailer";
import type { Lead } from "@/lib/leads";
import { writeToTestSink } from "@/lib/test-sink";
import type { StoredQuoteItem } from "../../drizzle/schema";

/** Plain text keeps customer-typed content from being treated as markup. */
export function buildQuoteEmail(lead: Lead) {
  const items = (lead.items as StoredQuoteItem[]).map(
    (item, index) =>
      `${index + 1}. ${item.name} × ${item.qty}${item.note ? `\n   Note: ${item.note}` : ""}`,
  );
  const lines = [
    `Quote reference: ${lead.reference}`,
    `Source: ${lead.source}`,
    ...(lead.name ? [`Name: ${lead.name}`] : []),
    ...(lead.phoneE164 ? [`Phone: ${lead.phoneE164}`] : []),
    ...(lead.location ? [`Location: ${lead.location}`] : []),
    ...(lead.customerType ? [`Customer type: ${lead.customerType}`] : []),
    "",
    "Items:",
    ...items,
    ...(lead.message ? ["", `Message: ${lead.message}`] : []),
    ...(lead.pageUrl ? ["", `Sent from: ${lead.pageUrl}`] : []),
    "",
    lead.source === "product-quick"
      ? "This was a one-tap quote. WhatsApp opened for the customer, who still has to press Send."
      : "The customer also has this request ready to send on WhatsApp.",
  ];
  return { subject: `Quote request ${lead.reference}`, text: lines.join("\n") };
}

/** Sends a notification to the sales mailbox. Failures are logged, never thrown (§8.3). */
export async function sendNotificationEmail(subject: string, text: string): Promise<boolean> {
  try {
    if (await writeToTestSink("email", { subject, text })) return true;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, QUOTE_NOTIFY_EMAIL } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !QUOTE_NOTIFY_EMAIL) {
      console.error(`Email "${subject}" not sent: SMTP settings are missing`);
      return false;
    }
    const port = Number(SMTP_PORT ?? 465);
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transport.sendMail({ from: SMTP_USER, to: QUOTE_NOTIFY_EMAIL, subject, text });
    return true;
  } catch (error) {
    console.error(`Email "${subject}" not sent:`, (error as Error).message);
    return false;
  }
}

/** Backup notification for every quote request (BUILD_SPEC §8.3). */
export async function sendQuoteEmail(lead: Lead): Promise<boolean> {
  const { subject, text } = buildQuoteEmail(lead);
  return sendNotificationEmail(subject, text);
}
