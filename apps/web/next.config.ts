import type { NextConfig } from "next";


import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true }
};

export default nextConfig;
