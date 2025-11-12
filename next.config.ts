import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'instagram.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent-*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.instagram.com',
      },
    ],
  },
  async redirects() {
    return [
      // Redirect old analytics routes to new unified route
      {
        source: '/dashboard/analytics/instagram',
        destination: '/dashboard/analytics',
        permanent: true,
      },
      {
        source: '/dashboard/analytics/ideias',
        destination: '/dashboard/analytics',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
