import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root,
  },

  images: {
    qualities: [75, 85],
  },

  // Optional: Add a trailing slash to all paths
  trailingSlash: true,

  // Keep strict mode enabled so React 19 surfaces unsafe render side effects early.
  reactStrictMode: true,
};

export default nextConfig;
