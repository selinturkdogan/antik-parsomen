"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";

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

function bosaNull(deger: FormDataEntryValue | null): string | null {
  const s = String(deger ?? "").trim();
  return s || null;
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

  const veri = {
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
    return { hata: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }

  // Bu bilgiler sitenin her yerinde kullanılıyor
  revalidatePath("/");
  revalidatePath("/iletisim");
  revalidatePath("/hakkimizda");
  revalidatePath("/admin/ayarlar");

  return { basari: true };
}
