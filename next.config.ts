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
  experimental: {
    serverActions: {
      // Varsayılan 1 MB; telefon fotoğrafları bunu rahat aşıyor.
      // Aynı anda birkaç fotoğraf yüklenebilsin diye geniş tuttuk.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
