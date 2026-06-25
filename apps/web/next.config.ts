import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @mcp-builder/core is an ESM library with Node-only deps (prettier, jiti,
  // yaml). Keep it external so Next requires it at runtime instead of bundling.
  serverExternalPackages: ["@mcp-builder/core", "prettier", "jiti", "yaml"],
};

export default nextConfig;
