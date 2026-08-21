import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL bulunamadı. .env dosyasını kontrol edin.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ---------------- Kategoriler ----------------
const kategoriler = [
  { ad: "Kişiye Özel Parşömenler", slug: "kisiye-ozel-parsomenler", sira: 1 },
  { ad: "Hat Sanatı", slug: "hat-sanati", sira: 2 },
  { ad: "Kaligrafi", slug: "kaligrafi", sira: 3 },
  { ad: "Davetiyeler", slug: "davetiyeler", sira: 4 },
  { ad: "Dekoratif Parşömenler", slug: "dekoratif-parsomenler", sira: 5 },
  { ad: "Hediyelik Ürünler", slug: "hediyelik-urunler", sira: 6 },
];

// ---------------- Sıkça sorulan sorular ----------------
const sorular = [
  {
    soru: "Kişiye özel sipariş yapıyor musunuz?",
    cevap:
      "Evet. İstediğiniz ismi, metni veya tasarımı el yapımı parşömen üzerine hazırlıyoruz. Detaylar için iletişim formundan bize yazabilirsiniz.",
    sira: 1,
  },
  {
    soru: "Hazırlama süresi nedir?",
    cevap:
      "Ürünün boyutuna ve işçiliğine göre değişmekle birlikte, kişiye özel siparişler ortalama 5-10 iş günü içinde hazırlanır. Yoğun dönemlerde bu süre uzayabilir.",
    sira: 2,
  },
  {
    soru: "Hangi ölçülerde çalışıyorsunuz?",
    cevap:
      "A5, A4 ve A3 standart ölçülerinin yanında, talebe göre özel ölçülerde de çalışabiliyoruz.",
    sira: 3,
  },
  {
    soru: "İstediğim yazıyı yazabilir misiniz?",
    cevap:
      "Evet. Ayet, şiir, isim, tarih, özel bir söz veya kendi yazdığınız bir metin olabilir. Yazı stilini birlikte belirleriz.",
    sira: 4,
  },
  {
    soru: "Toplu sipariş alıyor musunuz?",
    cevap:
      "Alıyoruz. Düğün davetiyesi, kurumsal hediye ve etkinlik hediyeliği gibi toplu siparişler için bizimle iletişime geçin.",
    sira: 5,
  },
];

async function main() {
  console.log("🌱 Tohumlama başlıyor...\n");

  // Kategoriler
  for (const k of kategoriler) {
    await prisma.kategori.upsert({
      where: { slug: k.slug },
      update: { ad: k.ad, sira: k.sira },
      create: k,
    });
  }
  console.log(`✓ ${kategoriler.length} kategori hazır`);

  // Sorular
  for (const s of sorular) {
    const mevcut = await prisma.soruCevap.findFirst({ where: { soru: s.soru } });
    if (!mevcut) {
      await prisma.soruCevap.create({ data: s });
    }
  }
  console.log(`✓ ${sorular.length} soru hazır`);

  // Site ayarları — tek satırlık tablo, panelden düzenlenecek
  await prisma.siteAyar.upsert({
    where: { id: "tek" },
    update: {}, // zaten varsa dokunma, üzerine yazma
    create: {
      id: "tek",
      telefon: "0500 000 00 00",
      whatsapp: "905000000000",
      email: "iletisim@antikparsomen.com",
      adres: "Örnek Mahallesi, Örnek Sokak No: 1, İlçe / İl",
      mapsUrl: "",
      calismaSaatleri:
        "Pazartesi - Cuma: 10:00 - 19:00\nCumartesi: 10:00 - 17:00\nPazar: Kapalı",
      instagram: "",
      facebook: "",
      youtube: "",
      hikaye:
        "Antik Parşömen, kağıdın ve yazının binlerce yıllık hikâyesini bugüne taşımak için kuruldu. Her parşömen, geleneksel yöntemlerle, sabırla ve elle hazırlanıyor.",
      sahipAdi: "Dükkan Sahibi",
      sahipBiyografi:
        "Yıllardır hat sanatı ve kaligrafi ile ilgileniyor, geleneksel teknikleri günümüz tasarımlarıyla buluşturuyor.",
      malzemeBilgi:
        "Ürünlerimizde doğal parşömen kağıdı, is mürekkebi, kamış kalem ve doğal boyalar kullanılıyor. Hiçbir üründe hazır baskı yer almıyor.",
    },
  });
  console.log("✓ Site ayarları hazır");

  console.log("\n🎉 Tohumlama tamamlandı!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Hata:", e);
    await prisma.$disconnect();
    process.exit(1);
  });