import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import AlbumIzleyici from "@/components/AlbumIzleyici";
import { turAdi } from "@/lib/galeri";
import { tarihYaz } from "@/lib/tarih";

export const dynamic = "force-dynamic";

const albumGetir = cache(async (slug: string) => {
  return prisma.galeriAlbum.findFirst({
    where: { slug, yayinda: true },
    include: { fotolar: { orderBy: { sira: "asc" } } },
  });
});

export async function generateMetadata({
  params,
}: PageProps<"/galeri/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const album = await albumGetir(slug);

  if (!album) return { title: "Albüm bulunamadı" };

  const ozet = album.aciklama?.slice(0, 155) ?? `${album.fotolar.length} fotoğraf`;
  return {
    title: album.ad,
    description: ozet,
    openGraph: {
      title: album.ad,
      description: ozet,
      images: album.fotolar[0] ? [album.fotolar[0].url] : [],
    },
  };
}

export default async function AlbumSayfasi({
  params,
}: PageProps<"/galeri/[slug]">) {
  const { slug } = await params;
  const album = await albumGetir(slug);

  if (!album) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <nav className="text-sm text-murekkep-500">
        <Link href="/" className="transition hover:text-muhur-600">
          Ana Sayfa
        </Link>
        <span className="mx-2.5 text-parsomen-400">/</span>
        <Link href="/galeri" className="transition hover:text-muhur-600">
          Galeri
        </Link>
        <span className="mx-2.5 text-parsomen-400">/</span>
        <span className="text-murekkep-700">{album.ad}</span>
      </nav>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full bg-parsomen-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-murekkep-700">
            {turAdi(album.tur)}
          </span>
          <span className="text-sm text-murekkep-500">
            {album.fotolar.length} fotoğraf
          </span>
        </div>

        <h1 className="mt-5 font-baslik text-4xl font-semibold leading-tight sm:text-5xl">
          {album.ad}
        </h1>

        {album.tarih && (
          <p className="mt-3 text-murekkep-500">{tarihYaz(album.tarih)}</p>
        )}

        {album.aciklama && (
          <p className="mt-5 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-murekkep-700">
            {album.aciklama}
          </p>
        )}
      </header>

      <div className="mt-12">
        {album.fotolar.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-16 text-center text-murekkep-500">
            Bu albümde henüz fotoğraf yok.
          </p>
        ) : (
          <AlbumIzleyici
            fotograflar={album.fotolar.map((f) => ({
              id: f.id,
              url: f.url,
              aciklama: f.aciklama,
            }))}
            albumAdi={album.ad}
          />
        )}
      </div>

      <div className="mt-14 border-t border-parsomen-200 pt-8">
        <Link
          href="/galeri"
          className="text-sm text-muhur-600 underline-offset-4 transition hover:underline"
        >
          ← Tüm albümler
        </Link>
      </div>
    </main>
  );
}
