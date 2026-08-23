"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";

export type SoruDurumu = { hata?: string; basari?: boolean };

function yenile() {
  revalidatePath("/sss");
  revalidatePath("/admin/sss");
}

// ============================================================
//  EKLE
// ============================================================
export async function soruEkle(
  _oncekiDurum: SoruDurumu,
  formData: FormData
): Promise<SoruDurumu> {
  await adminGerekli();

  const soru = String(formData.get("soru") ?? "").trim();
  const cevap = String(formData.get("cevap") ?? "").trim();

  if (!soru) return { hata: "Soru yazın." };
  if (!cevap) return { hata: "Cevap yazın." };

  const enSon = await prisma.soruCevap.findFirst({
    orderBy: { sira: "desc" },
    select: { sira: true },
  });

  await prisma.soruCevap.create({
    data: { soru, cevap, sira: (enSon?.sira ?? 0) + 1 },
  });

  yenile();
  return { basari: true };
}

// ============================================================
//  GÜNCELLE
// ============================================================
export async function soruGuncelle(
  id: string,
  soru: string,
  cevap: string
): Promise<SoruDurumu> {
  await adminGerekli();

  const s = soru.trim();
  const c = cevap.trim();

  if (!s || !c) return { hata: "Soru ve cevap boş olamaz." };

  await prisma.soruCevap.update({
    where: { id },
    data: { soru: s, cevap: c },
  });

  yenile();
  return { basari: true };
}

// ============================================================
//  SIRALA
// ============================================================
export async function soruTasi(id: string, yon: "yukari" | "asagi") {
  await adminGerekli();

  const hepsi = await prisma.soruCevap.findMany({ orderBy: { sira: "asc" } });
  const konum = hepsi.findIndex((s) => s.id === id);
  if (konum === -1) return;

  const hedef = yon === "yukari" ? konum - 1 : konum + 1;
  if (hedef < 0 || hedef >= hepsi.length) return;

  const yeniDizi = [...hepsi];
  [yeniDizi[konum], yeniDizi[hedef]] = [yeniDizi[hedef], yeniDizi[konum]];

  // Sıra numaralarını baştan yazıyoruz; eşit numaralar olsa da doğru çalışır
  await prisma.$transaction(
    yeniDizi.map((s, i) =>
      prisma.soruCevap.update({ where: { id: s.id }, data: { sira: i + 1 } })
    )
  );

  yenile();
}

// ============================================================
//  YAYIN / SİL
// ============================================================
export async function soruYayindaDegistir(id: string, deger: boolean) {
  await adminGerekli();
  await prisma.soruCevap.update({ where: { id }, data: { yayinda: deger } });
  yenile();
}

export async function soruSil(id: string) {
  await adminGerekli();
  await prisma.soruCevap.delete({ where: { id } });
  yenile();
}
