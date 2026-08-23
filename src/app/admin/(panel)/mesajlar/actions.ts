"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";

function yenile() {
  revalidatePath("/admin/mesajlar");
  revalidatePath("/admin"); // kontrol panelindeki sayaç ve rozet
}

export async function okunduDegistir(id: string, deger: boolean) {
  await adminGerekli();
  await prisma.mesaj.update({ where: { id }, data: { okundu: deger } });
  yenile();
}

export async function mesajSil(id: string) {
  await adminGerekli();
  await prisma.mesaj.delete({ where: { id } });
  yenile();
}

export async function tumunuOkunduYap() {
  await adminGerekli();
  await prisma.mesaj.updateMany({
    where: { okundu: false },
    data: { okundu: true },
  });
  yenile();
}
