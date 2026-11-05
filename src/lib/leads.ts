import { eq } from "drizzle-orm";
import { quoteRequests } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import { writeToTestSink } from "@/lib/test-sink";

export type Lead = typeof quoteRequests.$inferInsert;

/**
 * Saves a quote request. Returns whether it was stored, and never throws: a database problem must
 * not stop the customer reaching ABE on WhatsApp (BUILD_SPEC §8.3). Logs carry only the reference.
 */
export async function saveLead(lead: Lead): Promise<boolean> {
  try {
    if (await writeToTestSink("lead", lead)) return true;
    const db = getDb();
    if (!db) {
      console.error(`Lead ${lead.reference} not saved: DATABASE_URL is not set`);
      return false;
    }
    await db.insert(quoteRequests).values(lead);
    return true;
  } catch (error) {
    console.error(`Lead ${lead.reference} not saved:`, (error as Error).message);
    return false;
  }
}

/** Records that the customer's WhatsApp opened. They still have to press Send themselves. */
export async function markWhatsAppOpened(reference: string): Promise<void> {
  try {
    if (await writeToTestSink("opened", { reference })) return;
    await getDb()
      ?.update(quoteRequests)
      .set({ waLinkOpened: true })
      .where(eq(quoteRequests.reference, reference));
  } catch (error) {
    console.error(`Could not mark ${reference} as opened:`, (error as Error).message);
  }
}
