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
      // Renamed products keep their old links working (November 2026 catalogue update).
      ...[
        ["belt-driven-centrifugal-water-pump", "centrifugal-pump"],
        ["pressure-pump", "electric-water-pump"],
        ["car-washing-machine", "electric-car-washing-machine"],
        ["disc-mill", "disk-mill"],
      ].map(([from, to]) => ({
        source: `/machinery/${from}`,
        destination: `/machinery/${to}`,
        permanent: true,
      })),
      // Removed products and the guide that depended on one send visitors to the closest page.
      { source: "/machinery/corn-mill", destination: "/machinery/disk-mill", permanent: true },
      ...["kirloskar-water-pump", "6x6-kirloskar-pump-set-with-10hp-diesel-engine"].map((slug) => ({
        source: `/machinery/${slug}`,
        destination: "/machinery/c/irrigation",
        permanent: true,
      })),
      {
        source: "/machinery/pepper-mill",
        destination: "/machinery/c/food-processing",
        permanent: true,
      },
      {
        source: "/machinery/4x4-water-pump-with-diesel-engine",
        destination: "/machinery/c/irrigation",
        permanent: true,
      },
      {
        source: "/machinery/groundnut-huller",
        destination: "/machinery/c/groundnut-processing",
        permanent: true,
      },
      {
        source: "/machinery/cassava-grater",
        destination: "/machinery/c/food-processing",
        permanent: true,
      },
      { source: "/solutions/gari-processing", destination: "/solutions", permanent: true },
    ];
  },
  // Webpack would otherwise bundle every Radix component for the few the site imports.
  experimental: { optimizePackageImports: ["radix-ui"] },
};

export default createMDX()(nextConfig);
