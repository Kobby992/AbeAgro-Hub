import { eq, lt, sql } from "drizzle-orm";
import { kobbyConversations, kobbyDailyUsage } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import { writeToTestSink } from "@/lib/test-sink";

const DEFAULT_DAILY_CAP = 3000;
const RETENTION_DAYS = 180;

function dailyCap(): number {
  const cap = Number(process.env.KOBBY_DAILY_MESSAGE_CAP);
  return Number.isFinite(cap) && cap > 0 ? cap : DEFAULT_DAILY_CAP;
}

// Used when MySQL is missing or failing, so the cap still protects the bill.
const memory = { day: "", messages: 0 };

function countInMemory(day: string): number {
  if (memory.day !== day) Object.assign(memory, { day, messages: 0 });
  memory.messages += 1;
  return memory.messages;
}

async function countMessage(day: string): Promise<number> {
  const db = getDb();
  if (!db) return countInMemory(day);
  try {
    await db
      .insert(kobbyDailyUsage)
      .values({ day, messages: 1 })
      .onDuplicateKeyUpdate({ set: { messages: sql`${kobbyDailyUsage.messages} + 1` } });
    const [row] = await db
      .select({ messages: kobbyDailyUsage.messages })
      .from(kobbyDailyUsage)
      .where(eq(kobbyDailyUsage.day, day));
    return row?.messages ?? countInMemory(day);
  } catch (error) {
    console.error("Kamal usage not counted in MySQL:", (error as Error).message);
    return countInMemory(day);
  }
}

/** Counts this message toward today's cap, and says whether it may go ahead (§7.7). */
export async function withinDailyCap(now = new Date()): Promise<boolean> {
  // Ghana is on UTC all year, so the UTC date is also the local date.
  const count = await countMessage(now.toISOString().slice(0, 10));
  return count <= dailyCap();
}

export type ConversationLog = {
  sessionId: string;
  /** Only the messages added by this request. */
  newMessages: unknown[];
  tokensIn: number;
  tokensOut: number;
  tokensCached: number;
  quoteReference?: string;
  pageContext?: string;
};

let lastPurgeDay = "";

/** Conversations are kept for 180 days (§8.4). Runs at most once a day, from normal traffic. */
async function purgeOldConversations(now: Date) {
  const day = now.toISOString().slice(0, 10);
  if (day === lastPurgeDay) return;
  lastPurgeDay = day;
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 86_400_000);
  await getDb()?.delete(kobbyConversations).where(lt(kobbyConversations.startedAt, cutoff));
}

/** Records the chat and its token use for the monthly cost review. Never throws. */
export async function logConversation(log: ConversationLog): Promise<void> {
  try {
    if (await writeToTestSink("kobby", log)) return;
    const db = getDb();
    if (!db) return;

    const [existing] = await db
      .select({ id: kobbyConversations.id, messages: kobbyConversations.messages })
      .from(kobbyConversations)
      .where(eq(kobbyConversations.sessionId, log.sessionId));

    if (existing) {
      await db
        .update(kobbyConversations)
        .set({
          messages: [...existing.messages, ...log.newMessages],
          tokensIn: sql`${kobbyConversations.tokensIn} + ${log.tokensIn}`,
          tokensOut: sql`${kobbyConversations.tokensOut} + ${log.tokensOut}`,
          tokensCached: sql`${kobbyConversations.tokensCached} + ${log.tokensCached}`,
          ...(log.quoteReference ? { quoteReference: log.quoteReference } : {}),
        })
        .where(eq(kobbyConversations.id, existing.id));
    } else {
      await db.insert(kobbyConversations).values({
        sessionId: log.sessionId,
        messages: log.newMessages,
        tokensIn: log.tokensIn,
        tokensOut: log.tokensOut,
        tokensCached: log.tokensCached,
        quoteReference: log.quoteReference ?? null,
        pageContext: log.pageContext ?? null,
      });
    }
    await purgeOldConversations(new Date());
  } catch (error) {
    console.error("Kamal conversation not logged:", (error as Error).message);
  }
}
