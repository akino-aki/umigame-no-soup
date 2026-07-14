import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  assetPrefix: process.env.NEXT_ASSET_PREFIX || undefined,
};

export default nextConfig;