"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import { gorselSil, gorselYukle } from "@/lib/cloudinary";
import { slugYap } from "@/lib/slug";

export type UrunDurumu = { hata?: string };

const MAKS_DOSYA = 10 * 1024 * 1024; // 10 MB
const IZINLI_TURLER = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Yakalanan hatadan okunabilir bir mesaj çıkarır.
 * Cloudinary hataları Error nesnesi değil düz nesne olarak geldiği için
 * sadece `instanceof Error` kontrolü yapmak mesajı yutuyordu.
 */
function hataMesaji(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  if (typeof e === "string") return e;
  return "Kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.";
}

/**
 * Aynı slug varsa sonuna -2, -3 ekleyerek benzersiz hâle getirir.
 * Eski adresler tablosunu da kontrol eder: yeni bir ürün, başka bir
 * ürünün eski adresini kapıp yönlendirmeyi bozmasın.
 */
async function benzersizSlug(taban: string, haricTutId?: string) {
  const kok = taban || "urun";
  let slug = kok;
  let sayac = 2;

  while (true) {
    const [mevcut, eski] = await Promise.all([
      prisma.urun.findUnique({ where: { slug }, select: { id: true } }),
      prisma.urunEskiSlug.findUnique({
        where: { slug },
        select: { urunId: true },
      }),
    ]);

    const cakismaYok =
      (!mevcut || mevcut.id === haricTutId) &&
      (!eski || eski.urunId === haricTutId);

    if (cakismaYok) return slug;
    slug = `${kok}-${sayac++}`;
  }
}

/** Formdan gelen dosyaları doğrular, Cloudinary'ye yükler, veritabanına yazar. */
async function gorselleriIsle(dosyalar: File[], urunId: string) {
  const mevcutSayi = await prisma.urunGorsel.count({ where: { urunId } });
  let sira = mevcutSayi;

  for (const dosya of dosyalar) {
    if (!dosya || dosya.size === 0) continue;

    // Formdan gelen her şey güvenilmezdir — tür ve boyut kontrolü şart
    if (!IZINLI_TURLER.includes(dosya.type)) {
      throw new Error(
        `"${dosya.name}" desteklenmeyen bir dosya türü. JPEG, PNG, WebP veya AVIF yükleyin.`
      );
    }
    if (dosya.size > MAKS_DOSYA) {
      throw new Error(
        `"${dosya.name}" çok büyük (${(dosya.size / 1024 / 1024).toFixed(1)} MB). En fazla 10 MB olmalı.`
      );
    }

    const tampon = Buffer.from(await dosya.arrayBuffer());
    const yuklenen = await gorselYukle(tampon, "antik-parsomen/urunler");

    await prisma.urunGorsel.create({
      data: {
        urunId,
        url: yuklenen.url,
        publicId: yuklenen.publicId,
        genislik: yuklenen.genislik,
        yukseklik: yuklenen.yukseklik,
        sira: sira++,
      },
    });
  }
}

function sayfalariYenile(slug?: string) {
  revalidatePath("/urunler");
  revalidatePath("/admin/urunler");
  revalidatePath("/");
  if (slug) revalidatePath(`/urunler/${slug}`);
}

// ============================================================
//  EKLE / GÜNCELLE
// ============================================================
export async function urunKaydet(
  _oncekiDurum: UrunDurumu,
  formData: FormData
): Promise<UrunDurumu> {
  await adminGerekli(); // arayüzden geçmeyen isteklere karşı

  const id = String(formData.get("id") ?? "").trim();
  const ad = String(formData.get("ad") ?? "").trim();
  const aciklama = String(formData.get("aciklama") ?? "").trim();
  const kategoriId = String(formData.get("kategoriId") ?? "").trim();
  const oneCikan = formData.get("oneCikan") === "on";
  const yayinda = formData.get("yayinda") === "on";

  if (!ad) return { hata: "Ürün adı gerekli." };
  if (!aciklama) return { hata: "Açıklama gerekli." };
  if (!kategoriId) return { hata: "Kategori seçin." };

  const kategori = await prisma.kategori.findUnique({ where: { id: kategoriId } });
  if (!kategori) return { hata: "Seçilen kategori bulunamadı." };

  const dosyalar = formData.getAll("gorseller").filter((d): d is File => d instanceof File);

  let slug: string;

  try {
    if (id) {
      // ---- Güncelleme ----
      const mevcut = await prisma.urun.findUnique({ where: { id } });
      if (!mevcut) return { hata: "Ürün bulunamadı." };

      // Adresi ada göre yeniden üret. Karşılaştırmayı eski adla değil
      // KAYITLI ADRESLE yapıyoruz: ad ile adres bir şekilde uyumsuz
      // kaldıysa (eski sürümde yapılmış bir yeniden adlandırma gibi)
      // ilk kayıtta kendiliğinden düzelsin.
      const istenenSlug = slugYap(ad);
      const aday = istenenSlug
        ? await benzersizSlug(istenenSlug, id)
        : mevcut.slug;

      const adresDegisti = aday !== mevcut.slug;
      slug = aday;

      await prisma.urun.update({
        where: { id },
        data: { ad, aciklama, kategoriId, oneCikan, yayinda, slug },
      });

      if (adresDegisti && slug !== mevcut.slug) {
        // Eski adresi sakla ki paylaşılmış bağlantılar kırılmasın.
        // Aynı adres daha önce kaydedilmişse tekrar eklemeye çalışma.
        await prisma.urunEskiSlug.upsert({
          where: { slug: mevcut.slug },
          update: { urunId: id },
          create: { slug: mevcut.slug, urunId: id },
        });

        // Ürün eski bir adresine geri döndüyse o kaydı kaldır,
        // yoksa kendi kendine yönlendirmeye çalışır.
        await prisma.urunEskiSlug.deleteMany({ where: { slug } });

        revalidatePath(`/urunler/${mevcut.slug}`);
      }

      await gorselleriIsle(dosyalar, id);
    } else {
      // ---- Yeni ürün ----
      slug = await benzersizSlug(slugYap(ad));

      const yeni = await prisma.urun.create({
        data: { ad, slug, aciklama, kategoriId, oneCikan, yayinda },
      });

      await gorselleriIsle(dosyalar, yeni.id);
    }
  } catch (e) {
    console.error("urunKaydet hatası:", e);
    return { hata: hataMesaji(e) };
  }

  sayfalariYenile(slug);
  redirect("/admin/urunler"); // try/catch dışında olmalı
}

// ============================================================
//  SİL
// ============================================================
export async function urunSil(id: string) {
  await adminGerekli();

  const urun = await prisma.urun.findUnique({
    where: { id },
    include: { gorseller: true },
  });

  if (!urun) return;

  // Önce Cloudinary'deki dosyalar: veritabanı kaydı silinince
  // publicId'leri kaybederiz ve görseller orada çöp olarak kalır.
  for (const g of urun.gorseller) {
    try {
      await gorselSil(g.publicId);
    } catch {
      // Cloudinary'de zaten yoksa ürünü silmeyi engellemesin
    }
  }

  await prisma.urun.delete({ where: { id } }); // görseller cascade ile gider

  sayfalariYenile(urun.slug);
}

// ============================================================
//  TEK GÖRSEL SİL
// ============================================================
export async function urunGorselSil(gorselId: string) {
  await adminGerekli();

  const gorsel = await prisma.urunGorsel.findUnique({
    where: { id: gorselId },
    include: { urun: { select: { slug: true } } },
  });

  if (!gorsel) return;

  try {
    await gorselSil(gorsel.publicId);
  } catch {
    // yoksay
  }

  await prisma.urunGorsel.delete({ where: { id: gorselId } });

  sayfalariYenile(gorsel.urun.slug);
}

// ============================================================
//  HIZLI AÇMA/KAPAMA (öne çıkan, yayında)
// ============================================================
export async function oneCikanDegistir(id: string, deger: boolean) {
  await adminGerekli();
  const urun = await prisma.urun.update({
    where: { id },
    data: { oneCikan: deger },
  });
  sayfalariYenile(urun.slug);
}

export async function yayindaDegistir(id: string, deger: boolean) {
  await adminGerekli();
  const urun = await prisma.urun.update({
    where: { id },
    data: { yayinda: deger },
  });
  sayfalariYenile(urun.slug);
}
