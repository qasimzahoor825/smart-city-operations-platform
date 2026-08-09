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