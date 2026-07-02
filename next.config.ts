import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    assetPrefix: process.env.NEXT_ASSET_PREFIX || undefined,
};

export default nextConfig;