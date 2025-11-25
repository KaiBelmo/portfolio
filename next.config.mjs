/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for the App Router
  output: 'export',

  // Optional: Add a trailing slash to all paths
  trailingSlash: true,

  // Configure images
  images: {
    unoptimized: true,
  },

  // Disable React strict mode for now to avoid double rendering in development
  reactStrictMode: false,
};

export default nextConfig;
