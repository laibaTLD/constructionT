import type { NextConfig } from "next";

/** Absolute backend origin for rewrites (never a relative /api — that would loop). */
const apiOrigin = (() => {
  const backend = process.env.BACKEND_API_URL?.trim();
  if (backend?.startsWith("http")) {
    return backend.replace(/\/$/, "").replace(/\/api\/?$/, "");
  }

  const publicApi = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicApi?.startsWith("http")) {
    return publicApi.replace(/\/$/, "").replace(/\/api\/?$/, "");
  }

  return process.env.NODE_ENV === "production"
    ? "https://sitifystudio.com"
    : "http://localhost:5000";
})();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      // Browser hits /api/* → Next proxies to backend
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiOrigin}/api/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
