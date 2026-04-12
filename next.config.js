/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/Infra-MA2",
  assetPrefix: "/Infra-MA2/",
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless", "@prisma/adapter-neon"],
  },
};

module.exports = nextConfig;
