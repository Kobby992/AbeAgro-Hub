import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import { createPool } from "mysql2";
import * as schema from "../../drizzle/schema";

let database: MySql2Database<typeof schema> | null = null;

/** The connection is created on first use. Returns null when DATABASE_URL is not set. */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  database ??= drizzle(createPool({ uri: url, connectionLimit: 5 }), {
    schema,
    mode: "default",
  });
  return database;
}
