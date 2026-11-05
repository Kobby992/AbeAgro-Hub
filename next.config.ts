import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Webpack would otherwise bundle every Radix component for the few the site imports.
  experimental: { optimizePackageImports: ["radix-ui"] },
};

export default createMDX()(nextConfig);
