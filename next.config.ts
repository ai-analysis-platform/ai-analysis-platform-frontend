import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    emotion: true,
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
