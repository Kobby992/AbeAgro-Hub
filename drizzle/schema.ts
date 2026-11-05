import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// Lead log (BUILD_SPEC §8.4). Change this file, then run `npm run db:generate`.

export type StoredQuoteItem = { slug: string; name: string; qty: number; note?: string };

export const quoteRequests = mysqlTable(
  "quote_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    reference: varchar("reference", { length: 20 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    source: mysqlEnum("source", ["site", "kobby", "product-quick", "partner", "contact"]).notNull(),
    // Empty for one-tap quick quotes, where these details arrive with the WhatsApp message.
    name: varchar("name", { length: 80 }),
    phoneE164: varchar("phone_e164", { length: 20 }),
    location: varchar("location", { length: 180 }),
    customerType: varchar("customer_type", { length: 40 }),
    message: text("message"),
    items: json("items").$type<StoredQuoteItem[]>().notNull(),
    pageUrl: varchar("page_url", { length: 500 }),
    utm: json("utm").$type<Record<string, string>>(),
    userAgent: varchar("user_agent", { length: 500 }),
    waLinkOpened: boolean("wa_link_opened").notNull().default(false),
    status: mysqlEnum("status", ["new", "contacted", "quoted", "won", "lost"])
      .notNull()
      .default("new"),
    staffNote: text("staff_note"),
  },
  (table) => [
    index("quote_requests_created_at").on(table.createdAt),
    index("quote_requests_status").on(table.status),
  ],
);

export const kobbyConversations = mysqlTable(
  "kobby_conversations",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    messages: json("messages").$type<unknown[]>().notNull(),
    tokensIn: int("tokens_in").notNull().default(0),
    tokensOut: int("tokens_out").notNull().default(0),
    quoteReference: varchar("quote_reference", { length: 20 }),
    pageContext: varchar("page_context", { length: 500 }),
  },
  (table) => [index("kobby_conversations_started_at").on(table.startedAt)],
);

export const partnerEnquiries = mysqlTable("partner_enquiries", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  name: varchar("name", { length: 80 }).notNull(),
  company: varchar("company", { length: 120 }),
  phoneE164: varchar("phone_e164", { length: 20 }),
  email: varchar("email", { length: 160 }),
  message: text("message"),
});

export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  name: varchar("name", { length: 80 }).notNull(),
  phoneE164: varchar("phone_e164", { length: 20 }),
  email: varchar("email", { length: 160 }),
  message: text("message").notNull(),
});
