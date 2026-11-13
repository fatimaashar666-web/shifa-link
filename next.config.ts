import type { NextConfig } from "next";
import path from "node:path";

// Keep next-intl's request configuration available without loading its
// optional message-extraction plugin (which depends on a native @swc/core
// binding that is unavailable in some Windows environments).
const nextIntlRequestConfig = path.resolve(process.cwd(), "src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  serverExternalPackages: ["sanity", "@sanity/vision", "next-sanity"],
  turbopack: {
    resolveAlias: {
      "next-intl/config": "./src/i18n/request.ts",
    },
  },
  webpack(config) {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias["next-intl/config"] = nextIntlRequestConfig;
    return config;
  },
};

export default nextConfig;
