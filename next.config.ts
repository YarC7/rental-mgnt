import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/A/rooms",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
