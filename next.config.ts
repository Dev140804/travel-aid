import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/photo',
        search: '?ref=*',
      },
      {
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
