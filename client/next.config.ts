import type { NextConfig } from "next";

// Backend (Express) base URL. In dev the server runs on :4000.
// Override with API_PROXY_URL in production (e.g. behind Caddy).
const API_PROXY_URL = process.env.API_PROXY_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Proxy all /api/* calls to the backend server so the frontend code can keep
  // using relative paths (/api/ai, /api/asr, /api/workspace, ...) unchanged.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
