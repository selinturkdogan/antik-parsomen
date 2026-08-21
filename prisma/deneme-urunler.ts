import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL bulunamadı. .env dosyasını kontrol edin.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const denemeUrunler = [
  {
    ad: "İsme Özel Parşömen",
    slug: "isme-ozel-parsomen",
    aciklama:
      "El yapımı parşömen üzerine, istediğiniz ismi hat sanatıyla yazıyoruz. A4 boyutunda, doğal is mürekkebiyle hazırlanır.",
    kategoriSlug: "kisiye-ozel-parsomenler",
    oneCikan: true,
  },
  {
    ad: "Besmele Hat Levhası",
    slug: "besmele-hat-levhasi",
    aciklama:
      "Klasik sülüs hattıyla hazırlanmış besmele levhası. Çerçeveli ve çerçevesiz seçenekleriyle sunulur.",
    kategoriSlug: "hat-sanati",
    oneCikan: true,
  },
  {
    ad: "El Yazması Düğün Davetiyesi",
    slug: "el-yazmasi-dugun-davetiyesi",
    aciklama:
      "Her biri elle yazılan, parşömen dokulu düğün davetiyeleri. Toplu siparişlerde özel fiyat uygulanır.",
    kategoriSlug: "davetiyeler",
    oneCikan: false,
  },
];

async function main() {
  for (const u of denemeUrunler) {
    // Önce kategoriyi slug'ından bulup gerçek id'sini alıyoruz
    const kategori = await prisma.kategori.findUnique({
      where: { slug: u.kategoriSlug },
    });

    if (!kategori) {
      console.log(`⚠ Kategori bulunamadı: ${u.kategoriSlug} — atlanıyor`);
      continue;
    }

    await prisma.urun.upsert({
      where: { slug: u.slug },
      update: {}, // zaten varsa dokunma
      create: {
        ad: u.ad,
        slug: u.slug,
        aciklama: u.aciklama,
        oneCikan: u.oneCikan,
        kategoriId: kategori.id, // eksik olan buydu
      },
    });

    console.log(`✓ ${u.ad}`);
  }

  const toplam = await prisma.urun.count();
  console.log(`\nToplam ürün: ${toplam}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Hata:", e);
    await prisma.$disconnect();
    process.exit(1);
  });