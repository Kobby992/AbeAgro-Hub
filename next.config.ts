import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Read at runtime by Kobby's system prompt, so it must ship with the API route.
  outputFileTracingIncludes: { "/api/kobby": ["./src/kobby/knowledge.md"] },
};

export default createMDX()(nextConfig);
