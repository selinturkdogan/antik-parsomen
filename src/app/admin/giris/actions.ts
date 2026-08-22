"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { oturumOlustur } from "@/lib/oturum";

export type GirisDurumu = { hata?: string };

export async function girisYap(
  _oncekiDurum: GirisDurumu,
  formData: FormData
): Promise<GirisDurumu> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const sifre = String(formData.get("sifre") ?? "");

  if (!email || !sifre) {
    return { hata: "E-posta ve şifre gerekli." };
  }

  const kullanici = await prisma.kullanici.findUnique({ where: { email } });

  if (!kullanici) {
    // Sabit gecikme: "bu e-posta kayıtlı mı?" bilgisi cevap süresinden sızmasın
    await new Promise((bekle) => setTimeout(bekle, 400));
    return { hata: "E-posta veya şifre hatalı." };
  }

  const dogruMu = await bcrypt.compare(sifre, kullanici.sifreHash);

  if (!dogruMu) {
    return { hata: "E-posta veya şifre hatalı." };
  }

  await oturumOlustur({
    kullaniciId: kullanici.id,
    email: kullanici.email,
    ad: kullanici.ad,
  });

  redirect("/admin");
}
