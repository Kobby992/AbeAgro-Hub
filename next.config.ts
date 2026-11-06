import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // One address for search engines: the bare domain sends visitors to www (BUILD_SPEC §12.7).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "abeagrohub.com" }],
        destination: "https://www.abeagrohub.com/:path*",
        permanent: true,
      },
    ];
  },
  // Webpack would otherwise bundle every Radix component for the few the site imports.
  experimental: { optimizePackageImports: ["radix-ui"] },
};

export default createMDX()(nextConfig);
