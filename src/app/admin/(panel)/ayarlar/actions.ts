"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import { gorselSil, gorselYukle } from "@/lib/cloudinary";

export type AyarDurumu = { hata?: string; basari?: boolean };

/**
 * Sosyal medya alanını tam adrese çevirir.
 * Kullanıcı "antikparsomen", "@antikparsomen" veya tam adresi yazabilir;
 * hepsi çalışsın diye burada normalleştiriyoruz.
 */
function sosyalAdres(deger: string, alan: string): string | null {
  const temiz = deger.trim();
  if (!temiz) return null;

  if (/^https?:\/\//i.test(temiz)) return temiz;

  const kullaniciAdi = temiz.replace(/^@/, "").replace(/^\/+/, "");
  if (!kullaniciAdi) return null;

  return `https://www.${alan}/${kullaniciAdi}`;
}

/** WhatsApp bağlantısı için rakamları uluslararası biçime getirir. */
function whatsappNumarasi(deger: string): string | null {
  const rakamlar = deger.replace(/\D/g, "");
  if (!rakamlar) return null;

  if (rakamlar.startsWith("90")) return rakamlar;
  if (rakamlar.startsWith("0")) return `9${rakamlar}`; // 0532... → 90532...
  return `90${rakamlar}`;
}

/**
 * Yakalanan hatadan okunabilir mesaj çıkarır.
 * Genel bir "kaydedilemedi" mesajı gerçek sebebi gizliyor ve teşhisi
 * imkânsızlaştırıyordu.
 */
function hataMesaji(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return "Kaydedilemedi. Lütfen tekrar deneyin.";
}

function bosaNull(deger: FormDataEntryValue | null): string | null {
  const s = String(deger ?? "").trim();
  return s || null;
}

const MAKS_DOSYA = 10 * 1024 * 1024; // 10 MB
const IZINLI_TURLER = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Formdaki tek bir görsel alanını işler.
 * Yeni dosya geldiyse yükler ve eskisini Cloudinary'den siler;
 * gelmediyse mevcut değerleri olduğu gibi döndürür.
 */
async function gorselAlani(
  formData: FormData,
  alanAdi: string,
  klasor: string,
  mevcutUrl: string | null,
  mevcutPublicId: string | null
) {
  const dosya = formData.get(alanAdi);

  if (!(dosya instanceof File) || dosya.size === 0) {
    return { url: mevcutUrl, publicId: mevcutPublicId, yeni: null };
  }

  if (!IZINLI_TURLER.includes(dosya.type)) {
    throw new Error("Fotoğraf için JPEG, PNG, WebP veya AVIF yükleyin.");
  }
  if (dosya.size > MAKS_DOSYA) {
    throw new Error("Fotoğraf en fazla 10 MB olmalı.");
  }

  const tampon = Buffer.from(await dosya.arrayBuffer());
  const yuklenen = await gorselYukle(tampon, klasor);

  if (mevcutPublicId) {
    try {
      await gorselSil(mevcutPublicId);
    } catch {
      // Cloudinary'de zaten yoksa kaydı engellemesin
    }
  }

  return { url: yuklenen.url, publicId: yuklenen.publicId, yeni: yuklenen };
}

export async function ayarlariKaydet(
  _oncekiDurum: AyarDurumu,
  formData: FormData
): Promise<AyarDurumu> {
  await adminGerekli();

  const email = String(formData.get("email") ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { hata: "E-posta adresi geçerli görünmüyor." };
  }

  const mapsUrl = String(formData.get("mapsUrl") ?? "").trim();
  if (mapsUrl && !/^https?:\/\//i.test(mapsUrl)) {
    return { hata: "Google Maps bağlantısı https:// ile başlamalı." };
  }

  /**
   * Formdan gelen tek bir fotoğrafı yükler.
   * Yeni dosya gelmediyse mevcut değerleri aynen döndürür; geldiyse
   * eskisini Cloudinary'den siler ki çöp birikmesin.
   */
  async function fotografiIsle(
    alanAdi: string,
    eskiUrl: string | null,
    eskiPublicId: string | null
  ) {
    const dosya = formData.get(alanAdi);
    if (!(dosya instanceof File) || dosya.size === 0) {
      return { url: eskiUrl, publicId: eskiPublicId, genislik: null as number | null, yukseklik: null as number | null, degisti: false };
    }

    if (!IZINLI_TURLER.includes(dosya.type)) {
      throw new Error("Fotoğraf için JPEG, PNG, WebP veya AVIF yükleyin.");
    }
    if (dosya.size > MAKS_DOSYA) {
      throw new Error("Fotoğraf en fazla 10 MB olmalı.");
    }

    const tampon = Buffer.from(await dosya.arrayBuffer());
    const yuklenen = await gorselYukle(tampon, "antik-parsomen/site");

    if (eskiPublicId) {
      try {
        await gorselSil(eskiPublicId);
      } catch {
        // zaten yoksa sorun değil
      }
    }

    return { url: yuklenen.url, publicId: yuklenen.publicId, genislik: yuklenen.genislik, yukseklik: yuklenen.yukseklik, degisti: true };
  }

  // ---- Ana sayfa kapağı ----
  const mevcut = await prisma.siteAyar.findUnique({ where: { id: "tek" } });

  let kapakUrl = mevcut?.kapakUrl ?? null;
  let kapakPublicId = mevcut?.kapakPublicId ?? null;
  let kapakGenislik = mevcut?.kapakGenislik ?? null;
  let kapakYukseklik = mevcut?.kapakYukseklik ?? null;

  const kapakDosyasi = formData.get("kapak");

  if (kapakDosyasi instanceof File && kapakDosyasi.size > 0) {
    if (!IZINLI_TURLER.includes(kapakDosyasi.type)) {
      return { hata: "Kapak için JPEG, PNG, WebP veya AVIF yükleyin." };
    }
    if (kapakDosyasi.size > MAKS_DOSYA) {
      return { hata: "Kapak fotoğrafı en fazla 10 MB olmalı." };
    }

    try {
      const tampon = Buffer.from(await kapakDosyasi.arrayBuffer());
      const yuklenen = await gorselYukle(tampon, "antik-parsomen/site");

      // Yeni kapak geldiyse eskisi Cloudinary'de çöp kalmasın
      if (kapakPublicId) {
        try {
          await gorselSil(kapakPublicId);
        } catch {
          // zaten yoksa sorun değil
        }
      }

      kapakUrl = yuklenen.url;
      kapakPublicId = yuklenen.publicId;
      kapakGenislik = yuklenen.genislik;
      kapakYukseklik = yuklenen.yukseklik;
    } catch (e) {
      console.error("kapak yükleme hatası:", e);
      return { hata: "Kapak fotoğrafı yüklenemedi. Lütfen tekrar deneyin." };
    }
  }

  let sahipFotoUrl = mevcut?.sahipFotoUrl ?? null;
  let sahipFotoPublicId = mevcut?.sahipFotoPublicId ?? null;

  try {
    const sonuc = await fotografiIsle("sahipFoto", sahipFotoUrl, sahipFotoPublicId);
    sahipFotoUrl = sonuc.url;
    sahipFotoPublicId = sonuc.publicId;
  } catch (e) {
    return { hata: hataMesaji(e) };
  }

  let sahipFotoUrl = mevcut?.sahipFotoUrl ?? null;
  let sahipFotoPublicId = mevcut?.sahipFotoPublicId ?? null;

  try {
    const sonuc = await gorselAlani(
      formData,
      "sahipFoto",
      "antik-parsomen/site",
      sahipFotoUrl,
      sahipFotoPublicId
    );
    sahipFotoUrl = sonuc.url;
    sahipFotoPublicId = sonuc.publicId;
  } catch (e) {
    return { hata: hataMesaji(e) };
  }

  const veri = {
    // Ana sayfa
    slogan: bosaNull(formData.get("slogan")),
    kapakAciklama: bosaNull(formData.get("kapakAciklama")),
    kapakUrl,
    kapakPublicId,
    kapakGenislik,
    kapakYukseklik,

    // İletişim
    telefon: bosaNull(formData.get("telefon")),
    whatsapp: whatsappNumarasi(String(formData.get("whatsapp") ?? "")),
    email: email || null,
    adres: bosaNull(formData.get("adres")),
    mapsUrl: mapsUrl || null,

    // Çalışma saatleri
    calismaSaatleri: bosaNull(formData.get("calismaSaatleri")),

    // Sosyal medya
    instagram: sosyalAdres(
      String(formData.get("instagram") ?? ""),
      "instagram.com"
    ),
    facebook: sosyalAdres(
      String(formData.get("facebook") ?? ""),
      "facebook.com"
    ),
    youtube: sosyalAdres(String(formData.get("youtube") ?? ""), "youtube.com"),

    // Hakkımızda
    sahipAdi: bosaNull(formData.get("sahipAdi")),
    sahipFotoUrl,
    sahipFotoPublicId,
    sahipFotoUrl,
    sahipFotoPublicId,
    sahipBiyografi: bosaNull(formData.get("sahipBiyografi")),
    hikaye: bosaNull(formData.get("hikaye")),
    malzemeBilgi: bosaNull(formData.get("malzemeBilgi")),
  };

  try {
    await prisma.siteAyar.upsert({
      where: { id: "tek" },
      update: veri,
      create: { id: "tek", ...veri },
    });
  } catch (e) {
    console.error("ayarlariKaydet hatası:", e);
    return { hata: hataMesaji(e) };
  }

  // Bu bilgiler sitenin her yerinde kullanılıyor
  revalidatePath("/");
  revalidatePath("/iletisim");
  revalidatePath("/hakkimizda");
  revalidatePath("/admin/ayarlar");

  return { basari: true };
}
