const path = require("path");

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/Infra-MA2";
const isDevelopment = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const dataFormatDownloadHeaders = [
  {
    key: "Content-Disposition",
    value: 'attachment; filename="data-format.pptx"',
  },
  {
    key: "Content-Type",
    value: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
];

const dataSlidesDownloadHeaders = [
  {
    key: "Content-Disposition",
    value: 'attachment; filename="data-slides.pptx"',
  },
  {
    key: "Content-Type",
    value: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
];

const ibIconLibraryDownloadHeaders = [
  {
    key: "Content-Disposition",
    value: 'attachment; filename="ib-pe-reusable-icon-library.pptx"',
  },
  {
    key: "Content-Type",
    value: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
];

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
  outputFileTracingIncludes: {
    "/weekly-briefing": [
      "./audits/weekly-briefing-activity/**/*",
      "./audits/deal-portco-flowthrough-2026-05-05.md",
    ],
  },
  async headers() {
    return [
      {
        source: "/one-off-requests/data-format.pptx",
        headers: dataFormatDownloadHeaders,
      },
      {
        source: "/one-off-requests/data-format-standard-icons.pptx",
        headers: dataFormatDownloadHeaders,
      },
      {
        source: "/one-off-requests/data-slides.pptx",
        headers: dataSlidesDownloadHeaders,
      },
      {
        source: "/one-off-requests/ib-pe-reusable-icon-library.pptx",
        headers: ibIconLibraryDownloadHeaders,
      },
      { source: "/:path*", headers: securityHeaders },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: `${basePath}/tracker`,
        permanent: true,
        basePath: false,
      },
      { source: "/", destination: "/tracker", permanent: true },
    ];
  },
};

module.exports = nextConfig;
