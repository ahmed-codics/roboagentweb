import type { NextConfig } from "next";

// Served behind nginx at http://<host>/roboagent
const config: NextConfig = {
  basePath: "/roboagent",
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
};

export default config;
