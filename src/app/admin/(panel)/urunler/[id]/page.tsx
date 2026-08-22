import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import UrunFormu from "../UrunFormu";

export const metadata: Metadata = { title: "Ürünü Düzenle" };
export const dynamic = "force-dynamic";

export default async function UrunDuzenleSayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await adminGerekli();

  const { id } = await params;

  const [urun, kategoriler] = await Promise.all([
    prisma.urun.findUnique({
      where: { id },
      include: { gorseller: { orderBy: { sira: "asc" } } },
    }),
    prisma.kategori.findMany({
      orderBy: { sira: "asc" },
      select: { id: true, ad: true },
    }),
  ]);

  if (!urun) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="text-sm text-murekkep-500">
        <Link href="/admin/urunler" className="transition hover:text-muhur-600">
          Ürünler
        </Link>
        <span className="mx-2 text-parsomen-400">/</span>
        <span className="text-murekkep-700">{urun.ad}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-baslik text-4xl font-semibold">Ürünü Düzenle</h1>
        <Link
          href={`/urunler/${urun.slug}`}
          target="_blank"
          className="text-sm text-muhur-600 underline-offset-4 transition hover:underline"
        >
          Sitede görüntüle ↗
        </Link>
      </div>

      <div className="mt-8">
        <UrunFormu
          kategoriler={kategoriler}
          urun={{
            id: urun.id,
            ad: urun.ad,
            slug: urun.slug,
            aciklama: urun.aciklama,
            kategoriId: urun.kategoriId,
            oneCikan: urun.oneCikan,
            yayinda: urun.yayinda,
            gorseller: urun.gorseller.map((g) => ({
              id: g.id,
              url: g.url,
              alt: g.alt,
            })),
          }}
        />
      </div>
    </div>
  );
}
