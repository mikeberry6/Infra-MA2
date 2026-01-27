/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Infra-MA2",
  assetPrefix: "/Infra-MA2/",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
