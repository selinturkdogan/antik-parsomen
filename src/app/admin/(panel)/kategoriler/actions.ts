"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import { slugYap } from "@/lib/slug";

export type KategoriDurumu = { hata?: string; basari?: string };

function sayfalariYenile() {
  revalidatePath("/urunler");
  revalidatePath("/admin/kategoriler");
  revalidatePath("/admin/urunler");
  revalidatePath("/");
}

/** Aynı slug varsa sonuna -2, -3 ekler. */
async function benzersizKategoriSlug(taban: string, haricTutId?: string) {
  const kok = taban || "kategori";
  let slug = kok;
  let sayac = 2;

  while (true) {
    const mevcut = await prisma.kategori.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!mevcut || mevcut.id === haricTutId) return slug;
    slug = `${kok}-${sayac++}`;
  }
}

/**
 * Adından kategori bulur, yoksa oluşturur.
 * Hem kategori sayfası hem de ürün formundaki "yeni kategori"
 * alanı bunu kullanıyor — mantık tek yerde kalsın.
 */
export async function kategoriBulVeyaOlustur(ad: string) {
  const temizAd = ad.trim();
  if (!temizAd) throw new Error("Kategori adı boş olamaz.");

  // Büyük/küçük harf farkı yüzünden "Takı" ve "takı" ikilenmesin
  const mevcut = await prisma.kategori.findFirst({
    where: { ad: { equals: temizAd, mode: "insensitive" } },
  });
  if (mevcut) return mevcut;

  const enSonSira = await prisma.kategori.findFirst({
    orderBy: { sira: "desc" },
    select: { sira: true },
  });

  return prisma.kategori.create({
    data: {
      ad: temizAd,
      slug: await benzersizKategoriSlug(slugYap(temizAd)),
      sira: (enSonSira?.sira ?? 0) + 1,
    },
  });
}

// ============================================================
//  EKLE
// ============================================================
export async function kategoriEkle(
  _oncekiDurum: KategoriDurumu,
  formData: FormData
): Promise<KategoriDurumu> {
  await adminGerekli();

  const ad = String(formData.get("ad") ?? "").trim();
  if (!ad) return { hata: "Kategori adı gerekli." };

  const zatenVar = await prisma.kategori.findFirst({
    where: { ad: { equals: ad, mode: "insensitive" } },
  });
  if (zatenVar) return { hata: `"${zatenVar.ad}" kategorisi zaten var.` };

  try {
    await kategoriBulVeyaOlustur(ad);
  } catch (e) {
    return { hata: e instanceof Error ? e.message : "Kategori eklenemedi." };
  }

  sayfalariYenile();
  return { basari: `"${ad}" eklendi.` };
}

// ============================================================
//  YENİDEN ADLANDIR
// ============================================================
export async function kategoriAdiDegistir(id: string, yeniAd: string) {
  await adminGerekli();

  const ad = yeniAd.trim();
  if (!ad) return;

  const cakisan = await prisma.kategori.findFirst({
    where: { ad: { equals: ad, mode: "insensitive" }, id: { not: id } },
  });
  if (cakisan) return;

  await prisma.kategori.update({
    where: { id },
    data: { ad, slug: await benzersizKategoriSlug(slugYap(ad), id) },
  });

  sayfalariYenile();
}

// ============================================================
//  SIRALA
// ============================================================
export async function kategoriTasi(id: string, yon: "yukari" | "asagi") {
  await adminGerekli();

  const hepsi = await prisma.kategori.findMany({ orderBy: { sira: "asc" } });
  const konum = hepsi.findIndex((k) => k.id === id);
  if (konum === -1) return;

  const hedefKonum = yon === "yukari" ? konum - 1 : konum + 1;
  if (hedefKonum < 0 || hedefKonum >= hepsi.length) return;

  // Listeyi yeniden dizip sıra numaralarını baştan yazıyoruz.
  // Sadece iki kaydı takas etmek, sıra numaraları eşitse işe yaramazdı.
  const yeniDizi = [...hepsi];
  [yeniDizi[konum], yeniDizi[hedefKonum]] = [
    yeniDizi[hedefKonum],
    yeniDizi[konum],
  ];

  await prisma.$transaction(
    yeniDizi.map((k, i) =>
      prisma.kategori.update({ where: { id: k.id }, data: { sira: i + 1 } })
    )
  );

  sayfalariYenile();
}

// ============================================================
//  SİL
// ============================================================
export async function kategoriSil(id: string): Promise<KategoriDurumu> {
  await adminGerekli();

  const kategori = await prisma.kategori.findUnique({
    where: { id },
    include: { _count: { select: { urunler: true } } },
  });

  if (!kategori) return { hata: "Kategori bulunamadı." };

  // Ürünü olan kategoriyi silmek ürünleri de sahipsiz bırakırdı.
  // Silmeyi engelleyip ne yapması gerektiğini söylüyoruz.
  if (kategori._count.urunler > 0) {
    return {
      hata: `"${kategori.ad}" kategorisinde ${kategori._count.urunler} ürün var. Önce bu ürünleri başka bir kategoriye taşıyın.`,
    };
  }

  await prisma.kategori.delete({ where: { id } });
  sayfalariYenile();

  return { basari: `"${kategori.ad}" silindi.` };
}
