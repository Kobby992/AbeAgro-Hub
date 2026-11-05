import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default createMDX()(nextConfig);
