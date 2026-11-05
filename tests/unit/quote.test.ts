import { drizzle } from "drizzle-orm/mysql2";
import { beforeEach, describe, expect, it } from "vitest";
import { quoteRequests } from "../../drizzle/schema";
import { buildQuoteEmail } from "@/lib/email";
import { normalizePhone } from "@/lib/phone";
import { customerSchema, quoteRequestSchema } from "@/lib/quote-schema";
import { createRateLimiter } from "@/lib/rate-limit";
import { createReference, REFERENCE_PATTERN } from "@/lib/reference";
import { addReferenceToLink, productQuoteLink, quoteRequestMessage } from "@/lib/whatsapp";
import { useQuoteStore } from "@/store/quote";

const CUSTOMER = {
  name: "Kwame Mensah",
  phone: "024 123 4567",
  town: "Tamale",
  region: "Northern",
  consent: true,
};

const QUOTE = {
  reference: "ABE-Q-251105-7K3M",
  name: "Kwame Mensah",
  phone: "+233 24 123 4567",
  location: "Tamale, Northern Region",
  customerType: "Rice mill operator",
  items: [
    { name: "SB10 Rice Huller / Mill", qty: 1 },
    { name: "JLX Rice Destoner", qty: 1, note: "need diesel option" },
  ],
  message: "Please include delivery to Tamale.",
};

describe("createReference", () => {
  it("follows ABE-Q-YYMMDD-XXXX with no easily confused letters", () => {
    expect(createReference(new Date("2025-11-05T12:00:00Z"))).toMatch(/^ABE-Q-251105-/);
    for (let run = 0; run < 200; run += 1) {
      const reference = createReference();
      expect(reference).toMatch(REFERENCE_PATTERN);
      expect(reference.slice(-4)).not.toMatch(/[ILOU]/);
    }
  });
});

describe("normalizePhone", () => {
  it.each([
    ["024 123 4567", "+233241234567"],
    ["0241234567", "+233241234567"],
    ["+233 24 123 4567", "+233241234567"],
    ["+44 7911 123456", "+447911123456"],
  ])("reads %s", (input, e164) => {
    expect(normalizePhone(input)?.e164).toBe(e164);
  });

  it("formats for display and rejects non-numbers", () => {
    expect(normalizePhone("0241234567")?.display).toBe("+233 24 123 4567");
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("not a phone")).toBeNull();
  });
});

describe("customer form rules", () => {
  const errorsFor = (value: object) => {
    const result = customerSchema.safeParse({ ...CUSTOMER, ...value });
    return result.success ? {} : result.error.flatten().fieldErrors;
  };

  it("accepts a complete form", () => {
    expect(errorsFor({})).toEqual({});
  });

  it("requires name, a valid phone, town, region and consent", () => {
    expect(errorsFor({ name: "K" }).name).toBeDefined();
    expect(errorsFor({ phone: "123" }).phone).toBeDefined();
    expect(errorsFor({ town: "" }).town).toBeDefined();
    expect(errorsFor({ region: "" }).region).toBeDefined();
    expect(errorsFor({ consent: false }).consent).toBeDefined();
  });

  it("needs a country only for buyers outside Ghana", () => {
    expect(errorsFor({ region: "Outside Ghana" }).country).toBeDefined();
    expect(errorsFor({ region: "Outside Ghana", country: "Togo" })).toEqual({});
  });

  it("limits the message, and refuses line breaks in single-line fields", () => {
    expect(errorsFor({ message: "x".repeat(501) }).message).toBeDefined();
    expect(errorsFor({ name: "Kwame\nBcc: someone" }).name).toBeDefined();
  });
});

describe("API request rules", () => {
  it("lets a quick quote through with no customer details", () => {
    const quick = { source: "product-quick", items: [{ slug: "corn-mill", qty: 1 }] };
    expect(quoteRequestSchema.safeParse(quick).success).toBe(true);
  });

  it("holds a full request to the customer rules and item limits", () => {
    const items = [{ slug: "corn-mill", qty: 1 }];
    const full = { source: "site", items, customer: CUSTOMER };
    expect(quoteRequestSchema.safeParse(full).success).toBe(true);
    expect(quoteRequestSchema.safeParse({ source: "site", items }).success).toBe(false);
    expect(quoteRequestSchema.safeParse({ ...full, items: [] }).success).toBe(false);
    expect(
      quoteRequestSchema.safeParse({ ...full, items: [{ slug: "corn-mill", qty: 1000 }] }).success,
    ).toBe(false);
  });
});

describe("quoteRequestMessage", () => {
  it("matches the format in the spec", () => {
    expect(quoteRequestMessage(QUOTE)).toBe(
      [
        "Hello ABE Agro Hub 👋",
        "I'd like a quote please.",
        "",
        "*Quote ref:* ABE-Q-251105-7K3M",
        "*Name:* Kwame Mensah",
        "*Phone:* +233 24 123 4567",
        "*Location:* Tamale, Northern Region",
        "*I am a:* Rice mill operator",
        "",
        "*Items:*",
        "1. SB10 Rice Huller / Mill × 1",
        "2. JLX Rice Destoner × 1",
        "   Note: need diesel option",
        "",
        "*Message:* Please include delivery to Tamale.",
        "",
        "Sent from www.abeagrohub.com",
      ].join("\n"),
    );
  });

  it("summarises items beyond 15", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ name: `Machine ${i + 1}`, qty: 1 }));
    const text = quoteRequestMessage({ ...QUOTE, items });
    expect(text).toContain("15. Machine 15 × 1");
    expect(text).not.toContain("16. Machine 16");
    expect(text).toContain("+5 more items — see email/reference");
  });

  it("stays under the length limit with long notes and names", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({
      name: `A very long machine name number ${i + 1} for testing the limit`,
      qty: 999,
      note: "n".repeat(200),
    }));
    const text = quoteRequestMessage({ ...QUOTE, items });
    expect(text.length).toBeLessThanOrEqual(1800);
    expect(text).toContain("Quote ref");
    expect(text).toMatch(/\+\d+ more items/);
  });
});

describe("addReferenceToLink", () => {
  it("puts the reference where the server would", () => {
    const quote = { name: "Corn Mill", category: "Grain Milling", slug: "corn-mill" };
    expect(addReferenceToLink(productQuoteLink(quote), "ABE-Q-251105-7K3M")).toBe(
      productQuoteLink({ ...quote, reference: "ABE-Q-251105-7K3M" }),
    );
  });
});

describe("rate limiter", () => {
  it("allows a burst, blocks, then refills", () => {
    const allow = createRateLimiter({ capacity: 2, perMs: 1000 });
    expect(allow("ip", 0)).toBe(true);
    expect(allow("ip", 0)).toBe(true);
    expect(allow("ip", 0)).toBe(false);
    expect(allow("other-ip", 0)).toBe(true);
    expect(allow("ip", 500)).toBe(true);
  });
});

describe("email", () => {
  it("includes everything sales needs, with the full item list", () => {
    const { subject, text } = buildQuoteEmail({
      reference: "ABE-Q-251105-7K3M",
      source: "site",
      name: "Kwame Mensah",
      phoneE164: "+233241234567",
      location: "Tamale, Northern Region",
      message: "Please include delivery.",
      items: [{ slug: "corn-mill", name: "Corn Mill", qty: 2, note: "diesel" }],
    });
    expect(subject).toBe("Quote request ABE-Q-251105-7K3M");
    for (const part of ["Kwame Mensah", "+233241234567", "Corn Mill × 2", "Note: diesel"]) {
      expect(text).toContain(part);
    }
  });
});

describe("database insert", () => {
  it("writes to the columns the migration creates", () => {
    const db = drizzle.mock();
    const { sql, params } = db
      .insert(quoteRequests)
      .values({
        reference: "ABE-Q-251105-7K3M",
        source: "site",
        items: [{ slug: "corn-mill", name: "Corn Mill", qty: 1 }],
      })
      .toSQL();
    expect(sql).toContain("insert into `quote_requests`");
    expect(sql).toContain("`phone_e164`");
    expect(params).toContain("ABE-Q-251105-7K3M");
  });
});

describe("quote store", () => {
  beforeEach(() => useQuoteStore.setState({ items: [], updatedAt: null }));
  const store = () => useQuoteStore.getState();

  it("changes quantity within limits, and keeps notes", () => {
    store().add("corn-mill");
    store().setQty("corn-mill", 5000);
    expect(store().items[0]?.qty).toBe(999);
    store().setQty("corn-mill", 0);
    expect(store().items[0]?.qty).toBe(1);
    store().setNote("corn-mill", "diesel");
    expect(store().items[0]?.note).toBe("diesel");
  });

  it("removes one line, or replaces them all", () => {
    store().add("corn-mill");
    store().add("hammer-mill");
    store().remove("corn-mill");
    expect(store().items.map((item) => item.slug)).toEqual(["hammer-mill"]);
    store().replaceAll([]);
    expect(store().items).toEqual([]);
  });
});
