import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  experimental: {
    // O cadastro aceita 300 MB de mídias, além dos campos do formulário.
    proxyClientMaxBodySize: "310mb",
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
