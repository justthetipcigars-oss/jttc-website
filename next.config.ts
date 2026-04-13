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
    ],
  },
};

export default nextConfig;
