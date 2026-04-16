import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vendimageuploadcdn.global.ssl.fastly.net',
      },
      {
        protocol: 'https',
        hostname: 'secure.vendhq.com',
      },
      {
        protocol: 'https',
        hostname: 'rtgpctewzureirrsucde.supabase.co',
      },
    ],
  },
};

export default nextConfig;
