import type { NextConfig } from "next";

const gelistirmeModu = process.env.NODE_ENV === "development";

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

  // Geliştirme sırasında Safari sayfaları ve betikleri agresif biçimde
  // önbelleğe alıyor; kod değişse de eskisini gösteriyor. Daha kötüsü,
  // eski JavaScript yeni HTML ile eşleşmeyince form ve butonlar
  // tamamen tepkisiz kalıyor. Bu başlık onu engelliyor.
  // Sadece geliştirmede geçerli — yayındaki site normal önbelleği kullanır.
  async headers() {
    if (!gelistirmeModu) return [];

    return [
      {
        source: "/:yol*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
