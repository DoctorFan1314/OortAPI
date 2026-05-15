import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ["echarts", "zrender"],
  allowedDevOrigins: [
    "192.168.31.125",
    "192.168.*",
    "10.*",
    "172.16.*",
    "172.17.*",
    "172.18.*",
    "172.19.*",
    "172.2*",
    "172.30.*",
    "172.31.*",
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Redirect old resource paths to /resources/* prefix
      { source: '/skills', destination: '/skills' },
      { source: '/skills/:path*', destination: '/skills/:path*' },
      { source: '/prompts', destination: '/prompts' },
      { source: '/prompts/:path*', destination: '/prompts/:path*' },
      { source: '/categories', destination: '/categories' },
      { source: '/categories/:path*', destination: '/categories/:path*' },
      { source: '/trending', destination: '/trending' },
      { source: '/tags', destination: '/tags' },
      { source: '/tags/:path*', destination: '/tags/:path*' },
      { source: '/guide', destination: '/guide' },
      { source: '/submit', destination: '/submit' },
      { source: '/submit/:path*', destination: '/submit/:path*' },
      { source: '/search', destination: '/search' },
      // New /resources/* paths also work
      { source: '/resources/skills', destination: '/skills' },
      { source: '/resources/skills/:path*', destination: '/skills/:path*' },
      { source: '/resources/prompts', destination: '/prompts' },
      { source: '/resources/prompts/:path*', destination: '/prompts/:path*' },
      { source: '/resources/categories', destination: '/categories' },
      { source: '/resources/categories/:path*', destination: '/categories/:path*' },
      { source: '/resources/trending', destination: '/trending' },
      { source: '/resources/tags', destination: '/tags' },
      { source: '/resources/tags/:path*', destination: '/tags/:path*' },
      { source: '/resources/guide', destination: '/guide' },
      { source: '/resources/submit', destination: '/submit' },
      { source: '/resources/submit/:path*', destination: '/submit/:path*' },
      { source: '/resources/search', destination: '/search' },
    ];
  },
};

export default nextConfig;
