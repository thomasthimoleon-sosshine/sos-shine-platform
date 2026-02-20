import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.replit.dev", "*.repl.co", "*.replit.app"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "krdfvggmfswbohuevzlb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
