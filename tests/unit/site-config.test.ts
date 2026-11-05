import { describe, expect, it } from "vitest";
import products from "../../content/products.json";
import packageJson from "../../package.json";
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

describe("hosting", () => {
  // Next 16.3 and later need GLIBC_2.30 for their compiler, which Hostinger's build servers lack:
  // the build dies while loading next.config.ts. 16.2 needs only GLIBC_2.17. Before moving past it,
  // confirm the host's glibc is new enough.
  it("stays on a Next.js version that builds on Hostinger", () => {
    for (const version of [
      packageJson.dependencies.next,
      packageJson.dependencies["@next/mdx"],
      packageJson.devDependencies["eslint-config-next"],
    ]) {
      expect(version).toMatch(/^16\.2\.\d+$/);
    }
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
