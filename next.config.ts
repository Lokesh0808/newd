import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // `@react-pdf/renderer` and `pdfjs-dist` ship CJS/ESM bundles that must not
  // be bundled by Turbopack — keep them as external server packages.
  serverExternalPackages: ["@react-pdf/renderer", "pdfjs-dist", "mammoth"],

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
