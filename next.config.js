const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/Infra-MA2",
  assetPrefix: "/Infra-MA2/",
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
