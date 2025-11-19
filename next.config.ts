import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "zod/dist/esm": "zod/v3",
      "zod/dist": "zod/v3",
    };
    return config;
  },
};

export default nextConfig;
