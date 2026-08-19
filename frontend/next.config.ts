/**
 * Configuración Next.js — ChatBot Educativo (puerto 3001).
 * En producción embebido vía campusdemo usa basePath=/edu-chat para que
 * rutas y assets (_next) se sirvan bajo /edu-chat/* en el mismo dominio.
 */
import type { NextConfig } from "next";

const embedFrameAncestors =
  "frame-ancestors 'self' http://localhost:3000 http://localhost:3005 http://127.0.0.1:3000 http://127.0.0.1:3005 https://iecacampus.arcadevs.cloud";

/** Vacío en local (:3001/embed). En prod embebido: /edu-chat */
const eduBasePath = process.env.NEXT_PUBLIC_EDU_BASE_PATH?.trim() ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(eduBasePath ? { basePath: eduBasePath, assetPrefix: eduBasePath } : {}),
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
