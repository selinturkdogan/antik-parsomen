"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import { gorselSil, gorselYukle } from "@/lib/cloudinary";
import { slugYap } from "@/lib/slug";

export type AlbumDurumu = { hata?: string };

const MAKS_DOSYA = 10 * 1024 * 1024; // 10 MB
const IZINLI_TURLER = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function hataMesaji(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return "Kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.";
}

async function benzersizSlug(taban: string, haricTutId?: string) {
  const kok = taban || "album";
  let slug = kok;
  let sayac = 2;

  while (true) {
    const mevcut = await prisma.galeriAlbum.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!mevcut || mevcut.id === haricTutId) return slug;
    slug = `${kok}-${sayac++}`;
  }
}

function sayfalariYenile(slug?: string) {
  revalidatePath("/galeri");
  revalidatePath("/hakkimizda");
  revalidatePath("/admin/galeri");
  revalidatePath("/");
  if (slug) revalidatePath(`/galeri/${slug}`);
}

/** Formdan gelen fotoğrafları doğrular, yükler, albüme ekler. */
async function fotograflariIsle(dosyalar: File[], albumId: string) {
  const mevcutSayi = await prisma.galeriFoto.count({ where: { albumId } });
  let sira = mevcutSayi;

  for (const dosya of dosyalar) {
    if (!dosya || dosya.size === 0) continue;

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
    const yuklenen = await gorselYukle(tampon, "antik-parsomen/galeri");

    await prisma.galeriFoto.create({
      data: {
        albumId,
        url: yuklenen.url,
        publicId: yuklenen.publicId,
        genislik: yuklenen.genislik,
        yukseklik: yuklenen.yukseklik,
        sira: sira++,
      },
    });
  }
}

// ============================================================
//  ALBÜM EKLE / GÜNCELLE
// ============================================================
export async function albumKaydet(
  _oncekiDurum: AlbumDurumu,
  formData: FormData
): Promise<AlbumDurumu> {
  await adminGerekli();

  const id = String(formData.get("id") ?? "").trim();
  const ad = String(formData.get("ad") ?? "").trim();
  const aciklamaHam = String(formData.get("aciklama") ?? "").trim();
  const turHam = String(formData.get("tur") ?? "DIGER");
  const tarihHam = String(formData.get("tarih") ?? "").trim();
  const yayinda = formData.get("yayinda") === "on";

  if (!ad) return { hata: "Albüm adı gerekli." };

  const gecerliTurler = [
    "ATOLYE",
    "URETIM",
    "ETKINLIK",
    "STAND",
    "MUSTERI",
    "DIGER",
  ] as const;
  const tur = (gecerliTurler as readonly string[]).includes(turHam)
    ? (turHam as (typeof gecerliTurler)[number])
    : "DIGER";

  let tarih: Date | null = null;
  if (tarihHam) {
    const d = new Date(tarihHam);
    if (Number.isNaN(d.getTime())) return { hata: "Tarih geçersiz." };
    tarih = d;
  }

  const dosyalar = formData
    .getAll("fotograflar")
    .filter((d): d is File => d instanceof File);

  let slug: string;

  try {
    if (id) {
      const mevcut = await prisma.galeriAlbum.findUnique({ where: { id } });
      if (!mevcut) return { hata: "Albüm bulunamadı." };

      const istenenSlug = slugYap(ad);
      slug = istenenSlug
        ? await benzersizSlug(istenenSlug, id)
        : mevcut.slug;

      await prisma.galeriAlbum.update({
        where: { id },
        data: {
          ad,
          slug,
          aciklama: aciklamaHam || null,
          tur,
          tarih,
          yayinda,
        },
      });

      await fotograflariIsle(dosyalar, id);
      if (slug !== mevcut.slug) revalidatePath(`/galeri/${mevcut.slug}`);
    } else {
      slug = await benzersizSlug(slugYap(ad));

      const yeni = await prisma.galeriAlbum.create({
        data: {
          ad,
          slug,
          aciklama: aciklamaHam || null,
          tur,
          tarih,
          yayinda,
        },
      });

      await fotograflariIsle(dosyalar, yeni.id);
    }
  } catch (e) {
    console.error("albumKaydet hatası:", e);
    return { hata: hataMesaji(e) };
  }

  sayfalariYenile(slug);
  redirect("/admin/galeri");
}

// ============================================================
//  FOTOĞRAF İŞLEMLERİ
// ============================================================
export async function fotografSil(fotoId: string) {
  await adminGerekli();

  const foto = await prisma.galeriFoto.findUnique({
    where: { id: fotoId },
    include: { album: { select: { slug: true } } },
  });
  if (!foto) return;

  try {
    await gorselSil(foto.publicId);
  } catch {
    // Cloudinary'de zaten yoksa kaydı silmeyi engellemesin
  }

  await prisma.galeriFoto.delete({ where: { id: fotoId } });
  sayfalariYenile(foto.album.slug);
}

export async function fotografAciklamaKaydet(fotoId: string, aciklama: string) {
  await adminGerekli();

  const foto = await prisma.galeriFoto.update({
    where: { id: fotoId },
    data: { aciklama: aciklama.trim() || null },
    include: { album: { select: { slug: true } } },
  });

  sayfalariYenile(foto.album.slug);
}

/** Fotoğrafı albüm içinde bir sıra öne/arkaya alır. */
export async function fotografTasi(fotoId: string, yon: "sol" | "sag") {
  await adminGerekli();

  const foto = await prisma.galeriFoto.findUnique({ where: { id: fotoId } });
  if (!foto) return;

  const hepsi = await prisma.galeriFoto.findMany({
    where: { albumId: foto.albumId },
    orderBy: { sira: "asc" },
  });

  const konum = hepsi.findIndex((f) => f.id === fotoId);
  const hedef = yon === "sol" ? konum - 1 : konum + 1;
  if (hedef < 0 || hedef >= hepsi.length) return;

  const yeniDizi = [...hepsi];
  [yeniDizi[konum], yeniDizi[hedef]] = [yeniDizi[hedef], yeniDizi[konum]];

  // Sıra numaralarını baştan yazıyoruz; eşit numaralar olsa da doğru çalışsın
  await prisma.$transaction(
    yeniDizi.map((f, i) =>
      prisma.galeriFoto.update({ where: { id: f.id }, data: { sira: i } })
    )
  );

  const album = await prisma.galeriAlbum.findUnique({
    where: { id: foto.albumId },
    select: { slug: true },
  });
  sayfalariYenile(album?.slug);
}

// ============================================================
//  ALBÜM SİL / YAYIN
// ============================================================
export async function albumSil(id: string) {
  await adminGerekli();

  const album = await prisma.galeriAlbum.findUnique({
    where: { id },
    include: { fotolar: true },
  });
  if (!album) return;

  // Önce Cloudinary'deki dosyalar; kayıt silinince publicId'leri kaybederiz
  for (const f of album.fotolar) {
    try {
      await gorselSil(f.publicId);
    } catch {
      // yoksay
    }
  }

  await prisma.galeriAlbum.delete({ where: { id } }); // fotoğraflar cascade
  sayfalariYenile(album.slug);
}

export async function albumYayindaDegistir(id: string, deger: boolean) {
  await adminGerekli();
  const album = await prisma.galeriAlbum.update({
    where: { id },
    data: { yayinda: deger },
  });
  sayfalariYenile(album.slug);
}
