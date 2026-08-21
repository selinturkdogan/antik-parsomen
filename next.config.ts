import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/xla8xab4/**", // sadece kendi hesabımızdaki görseller
      },
    ],
  },
};

export default nextConfig;