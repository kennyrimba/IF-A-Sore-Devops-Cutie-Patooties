/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  // Add production optimizations
  productionBrowserSourceMaps: false,
  compress: true
}

module.exports = nextConfig