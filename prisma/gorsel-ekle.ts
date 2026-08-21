import "dotenv/config";
import { readFile } from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL bulunamadı.");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Komut satırından gelen iki bilgi: ürünün slug'ı ve dosyanın yolu
  const [slug, dosyaYolu] = process.argv.slice(2);

  if (!slug || !dosyaYolu) {
    console.log(
      "Kullanım: npx tsx prisma/gorsel-ekle.ts <urun-slug> <dosya-yolu>"
    );
    process.exit(1);
  }

  const urun = await prisma.urun.findUnique({
    where: { slug },
    include: { gorseller: true },
  });

  if (!urun) {
    console.error(`❌ "${slug}" slug'lı ürün bulunamadı.`);
    process.exit(1);
  }

  console.log(`📤 Yükleniyor: ${dosyaYolu}`);

  const dosya = await readFile(dosyaYolu);

  type YuklemeSonucu = {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
  };

  const sonuc = await new Promise<YuklemeSonucu>((cozumle, reddet) => {
    const akis = cloudinary.uploader.upload_stream(
      { folder: "antik-parsomen/urunler" },
      (hata, sonuc) => {
        if (hata || !sonuc) return reddet(hata ?? new Error("Yükleme hatası"));
        cozumle(sonuc as YuklemeSonucu);
      }
    );
    akis.end(dosya);
  });

  await prisma.urunGorsel.create({
    data: {
      urunId: urun.id,
      url: sonuc.secure_url,
      publicId: sonuc.public_id,
      alt: urun.ad,
      genislik: sonuc.width,
      yukseklik: sonuc.height,
      sira: urun.gorseller.length, // ilk yüklenen 0 = kapak olur
    },
  });

  console.log(`✅ Eklendi → ${urun.ad}`);
  console.log(`   ${sonuc.secure_url}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Hata:", e);
    await prisma.$disconnect();
    process.exit(1);
  });