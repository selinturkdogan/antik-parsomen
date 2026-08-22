"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import { gorselSil, gorselYukle } from "@/lib/cloudinary";
import { slugYap } from "@/lib/slug";

export type DuyuruDurumu = { hata?: string };

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
  const kok = taban || "duyuru";
  let slug = kok;
  let sayac = 2;

  while (true) {
    const [mevcut, eski] = await Promise.all([
      prisma.duyuru.findUnique({ where: { slug }, select: { id: true } }),
      prisma.duyuruEskiSlug.findUnique({
        where: { slug },
        select: { duyuruId: true },
      }),
    ]);

    const cakismaYok =
      (!mevcut || mevcut.id === haricTutId) &&
      (!eski || eski.duyuruId === haricTutId);

    if (cakismaYok) return slug;
    slug = `${kok}-${sayac++}`;
  }
}

function sayfalariYenile(slug?: string) {
  revalidatePath("/duyurular");
  revalidatePath("/admin/duyurular");
  revalidatePath("/");
  if (slug) revalidatePath(`/duyurular/${slug}`);
}

/** Kapak fotoğrafını doğrular ve Cloudinary'ye yükler. */
async function kapakYukle(dosya: File) {
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
  return gorselYukle(tampon, "antik-parsomen/duyurular");
}

// ============================================================
//  EKLE / GÜNCELLE
// ============================================================
export async function duyuruKaydet(
  _oncekiDurum: DuyuruDurumu,
  formData: FormData
): Promise<DuyuruDurumu> {
  await adminGerekli();

  const id = String(formData.get("id") ?? "").trim();
  const baslik = String(formData.get("baslik") ?? "").trim();
  const aciklama = String(formData.get("aciklama") ?? "").trim();
  const tur = formData.get("tur") === "ETKINLIK" ? "ETKINLIK" : "DUYURU";
  const yerHam = String(formData.get("yer") ?? "").trim();
  const tarihHam = String(formData.get("tarih") ?? "").trim();
  const yayinda = formData.get("yayinda") === "on";

  if (!baslik) return { hata: "Başlık gerekli." };
  if (!aciklama) return { hata: "Açıklama gerekli." };

  // Etkinlikte tarih olmadan "yaklaşan mı geçmiş mi" ayrımı yapamayız
  if (tur === "ETKINLIK" && !tarihHam) {
    return { hata: "Etkinlik için tarih gerekli." };
  }

  let tarih: Date | null = null;
  if (tarihHam) {
    const d = new Date(tarihHam);
    if (Number.isNaN(d.getTime())) return { hata: "Tarih geçersiz." };
    tarih = d;
  }

  const yer = yerHam || null;
  const dosya = formData.get("kapak");
  const kapakDosyasi =
    dosya instanceof File && dosya.size > 0 ? dosya : null;

  let slug: string;

  try {
    if (id) {
      // ---- Güncelleme ----
      const mevcut = await prisma.duyuru.findUnique({ where: { id } });
      if (!mevcut) return { hata: "Duyuru bulunamadı." };

      const istenenSlug = slugYap(baslik);
      const aday = istenenSlug
        ? await benzersizSlug(istenenSlug, id)
        : mevcut.slug;

      slug = aday;

      let kapakUrl = mevcut.kapakUrl;
      let kapakPublicId = mevcut.kapakPublicId;
      let kapakGenislik = mevcut.kapakGenislik;
      let kapakYukseklik = mevcut.kapakYukseklik;

      if (kapakDosyasi) {
        const yeni = await kapakYukle(kapakDosyasi);
        // Yeni kapak geldiyse eskisini Cloudinary'den kaldır, çöp kalmasın
        if (kapakPublicId) {
          try {
            await gorselSil(kapakPublicId);
          } catch {
            // zaten yoksa sorun değil
          }
        }
        kapakUrl = yeni.url;
        kapakPublicId = yeni.publicId;
        kapakGenislik = yeni.genislik;
        kapakYukseklik = yeni.yukseklik;
      }

      await prisma.duyuru.update({
        where: { id },
        data: {
          tur,
          baslik,
          slug,
          aciklama,
          tarih,
          yer,
          yayinda,
          kapakUrl,
          kapakPublicId,
          kapakGenislik,
          kapakYukseklik,
        },
      });

      if (slug !== mevcut.slug) {
        await prisma.duyuruEskiSlug.upsert({
          where: { slug: mevcut.slug },
          update: { duyuruId: id },
          create: { slug: mevcut.slug, duyuruId: id },
        });
        await prisma.duyuruEskiSlug.deleteMany({ where: { slug } });
        revalidatePath(`/duyurular/${mevcut.slug}`);
      }
    } else {
      // ---- Yeni ----
      slug = await benzersizSlug(slugYap(baslik));

      const kapak = kapakDosyasi ? await kapakYukle(kapakDosyasi) : null;

      await prisma.duyuru.create({
        data: {
          tur,
          baslik,
          slug,
          aciklama,
          tarih,
          yer,
          yayinda,
          kapakUrl: kapak?.url ?? null,
          kapakPublicId: kapak?.publicId ?? null,
          kapakGenislik: kapak?.genislik ?? null,
          kapakYukseklik: kapak?.yukseklik ?? null,
        },
      });
    }
  } catch (e) {
    console.error("duyuruKaydet hatası:", e);
    return { hata: hataMesaji(e) };
  }

  sayfalariYenile(slug);
  redirect("/admin/duyurular");
}

// ============================================================
//  KAPAK FOTOĞRAFINI KALDIR
// ============================================================
export async function duyuruKapakSil(id: string) {
  await adminGerekli();

  const duyuru = await prisma.duyuru.findUnique({ where: { id } });
  if (!duyuru?.kapakPublicId) return;

  try {
    await gorselSil(duyuru.kapakPublicId);
  } catch {
    // yoksay
  }

  await prisma.duyuru.update({
    where: { id },
    data: {
      kapakUrl: null,
      kapakPublicId: null,
      kapakGenislik: null,
      kapakYukseklik: null,
    },
  });

  sayfalariYenile(duyuru.slug);
}

// ============================================================
//  SİL
// ============================================================
export async function duyuruSil(id: string) {
  await adminGerekli();

  const duyuru = await prisma.duyuru.findUnique({ where: { id } });
  if (!duyuru) return;

  if (duyuru.kapakPublicId) {
    try {
      await gorselSil(duyuru.kapakPublicId);
    } catch {
      // yoksay
    }
  }

  await prisma.duyuru.delete({ where: { id } });
  sayfalariYenile(duyuru.slug);
}

// ============================================================
//  YAYINDA AÇ/KAPA
// ============================================================
export async function duyuruYayindaDegistir(id: string, deger: boolean) {
  await adminGerekli();
  const duyuru = await prisma.duyuru.update({
    where: { id },
    data: { yayinda: deger },
  });
  sayfalariYenile(duyuru.slug);
}
