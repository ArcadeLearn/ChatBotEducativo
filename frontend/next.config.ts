/**
 * Configuración Next.js — ChatBot Educativo (puerto 3001).
 */
import type { NextConfig } from "next";

const embedFrameAncestors =
  "frame-ancestors 'self' http://localhost:3000 http://localhost:3005 http://127.0.0.1:3000 http://127.0.0.1:3005";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: embedFrameAncestors,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
