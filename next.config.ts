import type { NextConfig } from "next";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api");

const apiOrigin = apiBase.startsWith("http")
  ? apiBase.replace(/\/api\/?$/, "")
  : "http://localhost:5000";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sitifystudio.com",
        pathname: "/api/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**.sitifystudio.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/uploads/:path*",
        destination: `${apiOrigin}/api/uploads/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiOrigin}/api/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
