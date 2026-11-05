import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Browser tests set QUOTE_TEST_SINK to record leads and emails in a file, because they run without
 * MySQL or SMTP. Never set this in production: it writes customer details to disk.
 * Returns true if the sink handled the record.
 */
export async function writeToTestSink(type: string, data: unknown): Promise<boolean> {
  const file = process.env.QUOTE_TEST_SINK;
  if (!file) return false;
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(file, `${JSON.stringify({ type, data })}\n`);
  return true;
}
