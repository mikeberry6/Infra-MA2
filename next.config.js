/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export removed — now using server-side rendering for database queries
  basePath: "/Infra-MA2",
  assetPrefix: "/Infra-MA2/",
  images: {
    unoptimized: true,
  },
  experimental: {
    // Ensure Prisma adapter is bundled correctly for server components (Next.js 14 syntax)
    serverComponentsExternalPackages: ["@prisma/adapter-pg"],
  },
};

module.exports = nextConfig;
