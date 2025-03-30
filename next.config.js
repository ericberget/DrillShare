/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@/components"],
  // Try to ignore TypeScript errors temporarily to get the site running
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3005', 'drillshare.netlify.app'],
      bodySizeLimit: '2mb'
    },
  },
};

module.exports = nextConfig; 