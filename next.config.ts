import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    appDir: true, // ✅ Asegura que Next.js use la estructura de `/app`
  },
};

export default nextConfig;
