import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // CLAUDE.md is this repo's agent guide; stop `next dev` from generating an AGENTS.md.
  agentRules: false,
};

export default nextConfig;
