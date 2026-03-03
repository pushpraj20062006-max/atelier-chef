import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add this to help Vercel handle images/metadata
  images: {
    unoptimized: true,
  },
};

export default nextConfig;