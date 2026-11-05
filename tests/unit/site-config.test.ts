import { describe, expect, it } from "vitest";
import products from "../../content/products.json";
import { site, WHATSAPP_NUMBER, whatsappUrl } from "@/config/site";
import { cn } from "@/lib/utils";

describe("site config", () => {
  it("uses the confirmed WhatsApp number", () => {
    expect(WHATSAPP_NUMBER).toBe("233557042005");
    expect(whatsappUrl).toBe("https://wa.me/233557042005");
  });

  it("uses the confirmed contact details", () => {
    expect(site.url).toBe("https://www.abeagrohub.com");
    expect(site.email).toBe("sales@abeagrohub.com");
  });
});

describe("starter content", () => {
  it("still holds all 39 catalogue products", () => {
    const list = Array.isArray(products)
      ? products
      : (products as { products: unknown[] }).products;
    expect(list).toHaveLength(39);
  });
});

describe("cn", () => {
  it("lets later Tailwind classes win", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
