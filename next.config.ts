import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  logging: {
    serverFunctions: false,
    incomingRequests: {
      ignore: [/^\/signup(?:\?|$)/],
    },
  },
  /**
   * Dev 전용 — localhost 외 IP/호스트에서 /_next, 폰트 등 접근 허용.
   * `*` / `**` 단독은 Next가 거부하므로 IPv4 전체는 `*.*.*.*` 사용.
   */
  allowedDevOrigins: [
    "*.*.*.*", // 모든 IPv4 (예: 192.168.10.68)
    "*.local",
  ],
};

export default nextConfig;
