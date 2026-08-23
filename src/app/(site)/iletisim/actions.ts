"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type MesajDurumu = {
  hata?: string;
  basari?: boolean;
};

const EPOSTA_KALIBI = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Bir botun formu doldurup göndermesi neredeyse anlıktır.
// Gerçek bir insan en az birkaç saniye harcar.
const EN_AZ_SANIYE = 3;

export async function mesajGonder(
  _oncekiDurum: MesajDurumu,
  formData: FormData
): Promise<MesajDurumu> {
  // ---- Bot tuzağı ----
  // Bu alan ekranda görünmüyor; insan dolduramaz, bot doldurur.
  const tuzak = String(formData.get("website") ?? "").trim();
  if (tuzak) {
    // Bota "gönderildi" diyoruz: hata verirsek deneme yapıp öğrenir
    return { basari: true };
  }

  const acilisHam = Number(formData.get("acilis") ?? 0);
  const gecenSaniye = (Date.now() - acilisHam) / 1000;
  if (acilisHam > 0 && gecenSaniye < EN_AZ_SANIYE) {
    return { hata: "Form çok hızlı gönderildi. Lütfen tekrar deneyin." };
  }

  // ---- Alanlar ----
  const adSoyad = String(formData.get("adSoyad") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const konu = String(formData.get("konu") ?? "").trim();
  const icerik = String(formData.get("icerik") ?? "").trim();

  if (!adSoyad) return { hata: "Adınızı yazın." };
  if (adSoyad.length > 100) return { hata: "Ad soyad çok uzun." };

  if (!email) return { hata: "E-posta adresinizi yazın." };
  if (!EPOSTA_KALIBI.test(email)) {
    return { hata: "E-posta adresi geçerli görünmüyor." };
  }

  if (!konu) return { hata: "Konu yazın." };
  if (konu.length > 150) return { hata: "Konu çok uzun." };

  if (!icerik) return { hata: "Mesajınızı yazın." };
  if (icerik.length < 10) {
    return { hata: "Mesajınız çok kısa, biraz daha detay verir misiniz?" };
  }
  if (icerik.length > 5000) {
    return { hata: "Mesajınız çok uzun (en fazla 5000 karakter)." };
  }

  // ---- Art arda gönderim engeli ----
  // Aynı e-postadan son 2 dakikada mesaj geldiyse kabul etmiyoruz;
  // yanlışlıkla iki kez basmak da, kasıtlı sel de böyle engelleniyor.
  const ikiDakikaOnce = new Date(Date.now() - 2 * 60 * 1000);
  const yakinZamanda = await prisma.mesaj.findFirst({
    where: { email, olusturma: { gte: ikiDakikaOnce } },
  });

  if (yakinZamanda) {
    return {
      hata: "Mesajınızı az önce aldık. Birkaç dakika sonra tekrar yazabilirsiniz.",
    };
  }

  try {
    await prisma.mesaj.create({
      data: { adSoyad, email, konu, icerik },
    });
  } catch (e) {
    console.error("mesajGonder hatası:", e);
    return { hata: "Mesaj gönderilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/admin/mesajlar");
  revalidatePath("/admin");

  return { basari: true };
}
