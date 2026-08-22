import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import DuyuruFormu from "../DuyuruFormu";

export const metadata: Metadata = { title: "Duyuruyu Düzenle" };
export const dynamic = "force-dynamic";

export default async function DuyuruDuzenleSayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await adminGerekli();

  const { id } = await params;
  const duyuru = await prisma.duyuru.findUnique({ where: { id } });

  if (!duyuru) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="text-sm text-murekkep-500">
        <Link href="/admin/duyurular" className="transition hover:text-muhur-600">
          Duyurular
        </Link>
        <span className="mx-2 text-parsomen-400">/</span>
        <span className="text-murekkep-700">{duyuru.baslik}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-baslik text-4xl font-semibold">Düzenle</h1>
        <Link
          href={`/duyurular/${duyuru.slug}`}
          target="_blank"
          className="text-sm text-muhur-600 underline-offset-4 transition hover:underline"
        >
          Sitede görüntüle ↗
        </Link>
      </div>

      <div className="mt-8">
        <DuyuruFormu
          duyuru={{
            id: duyuru.id,
            tur: duyuru.tur,
            baslik: duyuru.baslik,
            slug: duyuru.slug,
            aciklama: duyuru.aciklama,
            kapakUrl: duyuru.kapakUrl,
            tarih: duyuru.tarih,
            yer: duyuru.yer,
            yayinda: duyuru.yayinda,
          }}
        />
      </div>
    </div>
  );
}
