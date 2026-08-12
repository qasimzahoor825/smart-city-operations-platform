import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: [process.env.NEXT_PUBLIC_IMAGE_DOMAIN ?? "res.cloudinary.com"],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    typedRoutes: false,
  },
  // The Express monolith outside the frontend root is transpiled by webpack but
  // not type-checked against the app's strict tsconfig; `npm run typecheck`
  // still enforces types in CI/development.
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    // The monolith lives outside the Next root (`../backend/src`), where Next's
    // own SWC rule does not reach. Teach webpack to transpile those .ts files so
    // the `/api/v1/*` route handler can delegate to the Express app.
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: [path.join(__dirname, "..", "backend", "src")],
      loader: "next/dist/build/webpack/loaders/next-swc-loader",
      options: {
        isServer: true,
        rootDir: __dirname,
        pagesDir: "",
        appDir: "",
        nextConfig: {},
        jsConfig: {},
        jsc: {
          parser: { syntax: "typescript" },
          target: "es2020",
        },
        isModule: true,
        minify: false,
      },
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;