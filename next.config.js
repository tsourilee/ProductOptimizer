/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com', 'images.amazon.com', 'lh3.googleusercontent.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'fascinating-biscochitos-5a6873.netlify.app'],
    },
  },
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;
