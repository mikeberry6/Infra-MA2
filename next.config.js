const path = require("path");

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/Infra-MA2";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  assetPrefix: `${basePath}/`,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
  // Next 15 promoted serverComponentsExternalPackages out of experimental.
  serverExternalPackages: ["@neondatabase/serverless", "@prisma/adapter-neon"],
  // Anchor file-tracing at this directory; without this, Next walks up the
  // tree and warns when there are multiple lockfiles (e.g. in worktrees).
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
