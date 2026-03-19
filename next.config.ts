import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript and ESLint checks are now enforced for better code quality
  // Add this to help Vercel handle images/metadata
  images: {
    unoptimized: true,
  },
};

export default nextConfig;