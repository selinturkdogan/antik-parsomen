import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import AlbumFormu from "../AlbumFormu";

export const metadata: Metadata = { title: "Albümü Düzenle" };
export const dynamic = "force-dynamic";

export default async function AlbumDuzenleSayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await adminGerekli();

  const { id } = await params;
  const album = await prisma.galeriAlbum.findUnique({
    where: { id },
    include: { fotolar: { orderBy: { sira: "asc" } } },
  });

  if (!album) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="text-sm text-murekkep-500">
        <Link href="/admin/galeri" className="transition hover:text-muhur-600">
          Galeri
        </Link>
        <span className="mx-2 text-parsomen-400">/</span>
        <span className="text-murekkep-700">{album.ad}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-baslik text-4xl font-semibold">Albümü Düzenle</h1>
        <Link
          href={`/galeri/${album.slug}`}
          target="_blank"
          className="text-sm text-muhur-600 underline-offset-4 transition hover:underline"
        >
          Sitede görüntüle ↗
        </Link>
      </div>

      <div className="mt-8">
        <AlbumFormu
          album={{
            id: album.id,
            ad: album.ad,
            slug: album.slug,
            aciklama: album.aciklama,
            tur: album.tur,
            tarih: album.tarih,
            yayinda: album.yayinda,
            fotolar: album.fotolar.map((f) => ({
              id: f.id,
              url: f.url,
              aciklama: f.aciklama,
            })),
          }}
        />
      </div>
    </div>
  );
}
