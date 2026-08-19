/**
 * Configuración Next.js — ChatBot Educativo (puerto 3001).
 * En producción embebido vía campusdemo, assetPrefix=/edu-chat para que
 * /edu-chat/_next/* se reescriba correctamente hacia edu-app:3001.
 */
import type { NextConfig } from "next";

const embedFrameAncestors =
  "frame-ancestors 'self' http://localhost:3000 http://localhost:3005 http://127.0.0.1:3000 http://127.0.0.1:3005 https://iecacampus.arcadevs.cloud";

/** Prefijo de assets cuando el embed se sirve bajo /edu-chat (prod). Vacío en local. */
const assetPrefix = process.env.NEXT_PUBLIC_EDU_ASSET_PREFIX?.trim() || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  assetPrefix,
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
