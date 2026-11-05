import { beforeEach, describe, expect, it } from "vitest";
import { productQuoteLink, productQuoteMessage, whatsappLink } from "@/lib/whatsapp";
import { selectQuoteCount, useQuoteStore } from "@/store/quote";

const QUOTE = {
  name: "SB10 Rice Huller / Mill",
  category: "Rice Processing",
  slug: "sb10-rice-huller-mill",
};

describe("whatsappLink", () => {
  it("goes to the ABE number and encodes the text", () => {
    expect(whatsappLink("a b&c")).toBe("https://wa.me/233557042005?text=a%20b%26c");
  });
});

describe("productQuoteMessage", () => {
  it("follows the one-tap format from the spec", () => {
    expect(productQuoteMessage(QUOTE)).toBe(
      [
        "Hello ABE Agro Hub 👋",
        "I'd like a quote for:",
        "",
        "*SB10 Rice Huller / Mill* × 1",
        "Category: Rice Processing",
        "Product link: https://www.abeagrohub.com/machinery/sb10-rice-huller-mill",
        "",
        "Please send me the price, availability and delivery details.",
      ].join("\n"),
    );
  });

  it("includes the reference when there is one", () => {
    expect(productQuoteMessage({ ...QUOTE, reference: "ABE-Q-251105-7K3M" })).toContain(
      "*Quote ref:* ABE-Q-251105-7K3M",
    );
  });

  it("survives a round trip through the link", () => {
    const link = new URL(productQuoteLink(QUOTE));
    expect(link.searchParams.get("text")).toBe(productQuoteMessage(QUOTE));
  });
});

describe("quote store", () => {
  beforeEach(() => useQuoteStore.setState({ items: [], updatedAt: null }));

  const add = (slug: string, qty?: number) => useQuoteStore.getState().add(slug, qty);

  it("adds a new line", () => {
    expect(add("corn-mill")).toBe(1);
    expect(selectQuoteCount(useQuoteStore.getState())).toBe(1);
  });

  it("raises the quantity instead of adding a duplicate line", () => {
    add("corn-mill");
    expect(add("corn-mill", 2)).toBe(3);
    expect(selectQuoteCount(useQuoteStore.getState())).toBe(1);
  });

  it("caps quantity at 999", () => {
    expect(add("corn-mill", 5000)).toBe(999);
  });

  it("refuses a 51st line but still updates an existing one", () => {
    for (let line = 0; line < 50; line += 1) add(`product-${line}`);
    expect(add("one-too-many")).toBe(0);
    expect(selectQuoteCount(useQuoteStore.getState())).toBe(50);
    expect(add("product-0")).toBe(2);
  });
});
