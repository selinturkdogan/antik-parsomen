import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import DuyuruKart from "@/components/DuyuruKart";
import { gelecekteMi, tarihYaz } from "@/lib/tarih";

export const dynamic = "force-dynamic";

const duyuruGetir = cache(async (slug: string) => {
  return prisma.duyuru.findFirst({ where: { slug, yayinda: true } });
});

/** Başlık değişince adres de değişiyor; eski adresi yenisine yolluyoruz. */
const eskiAdresiCoz = cache(async (slug: string) => {
  const kayit = await prisma.duyuruEskiSlug.findUnique({
    where: { slug },
    include: { duyuru: { select: { slug: true, yayinda: true } } },
  });
  if (!kayit || !kayit.duyuru.yayinda) return null;
  return kayit.duyuru.slug;
});

export async function generateMetadata({
  params,
}: PageProps<"/duyurular/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const duyuru = await duyuruGetir(slug);

  if (!duyuru) return { title: "Duyuru bulunamadı" };

  const ozet = duyuru.aciklama.slice(0, 155);
  return {
    title: duyuru.baslik,
    description: ozet,
    openGraph: {
      title: duyuru.baslik,
      description: ozet,
      images: duyuru.kapakUrl ? [duyuru.kapakUrl] : [],
    },
  };
}

export default async function DuyuruDetaySayfasi({
  params,
}: PageProps<"/duyurular/[slug]">) {
  const { slug } = await params;
  const duyuru = await duyuruGetir(slug);

  if (!duyuru) {
    const yeniSlug = await eskiAdresiCoz(slug);
    if (yeniSlug) permanentRedirect(`/duyurular/${yeniSlug}`);
    notFound();
  }

  // Kapağı kendi oranında göster — dikey fotoğraflar ince şerite dönmesin.
  // Aşırı uçlarda sayfayı bozmaması için oranı sınırlıyoruz.
  const kapakOrani =
    duyuru.kapakGenislik && duyuru.kapakYukseklik
      ? Math.min(
          Math.max(duyuru.kapakGenislik / duyuru.kapakYukseklik, 0.62),
          1.9
        )
      : 16 / 9; // boyut bilinmiyorsa varsayılan

  const etkinlik = duyuru.tur === "ETKINLIK";
  const yaklasan = etkinlik && duyuru.tarih && gelecekteMi(duyuru.tarih);
  const gecmis = etkinlik && duyuru.tarih && !gelecekteMi(duyuru.tarih);

  const digerleri = await prisma.duyuru.findMany({
    where: { yayinda: true, id: { not: duyuru.id } },
    orderBy: [{ tarih: "desc" }, { olusturma: "desc" }],
    take: 3,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:py-16">
      <nav className="text-sm text-murekkep-500">
        <Link href="/" className="transition hover:text-muhur-600">
          Ana Sayfa
        </Link>
        <span className="mx-2.5 text-parsomen-400">/</span>
        <Link href="/duyurular" className="transition hover:text-muhur-600">
          Duyurular
        </Link>
        <span className="mx-2.5 text-parsomen-400">/</span>
        <span className="text-murekkep-700">{duyuru.baslik}</span>
      </nav>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
              etkinlik
                ? "bg-altin-500 text-parsomen-50"
                : "bg-parsomen-200 text-murekkep-700"
            }`}
          >
            {etkinlik ? "Etkinlik" : "Duyuru"}
          </span>

          {yaklasan && (
            <span className="rounded-full bg-muhur-600/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muhur-700">
              Yaklaşan
            </span>
          )}
          {gecmis && (
            <span className="rounded-full bg-parsomen-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-murekkep-500">
              Tamamlandı
            </span>
          )}
        </div>

        <h1 className="mt-5 font-baslik text-4xl font-semibold leading-tight sm:text-5xl">
          {duyuru.baslik}
        </h1>

        {(duyuru.tarih || duyuru.yer) && (
          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
            {duyuru.tarih && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500">
                  Tarih
                </dt>
                <dd className="mt-1 text-murekkep-900">
                  {tarihYaz(duyuru.tarih)}
                </dd>
              </div>
            )}
            {duyuru.yer && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500">
                  Yer
                </dt>
                <dd className="mt-1 text-murekkep-900">{duyuru.yer}</dd>
              </div>
            )}
          </dl>
        )}
      </header>

      {duyuru.kapakUrl && (
        <div
          style={{ aspectRatio: String(kapakOrani) }}
          className="relative mt-10 overflow-hidden rounded-2xl border border-parsomen-300 bg-parsomen-200 p-4 shadow-kart"
        >
          <Image
            src={duyuru.kapakUrl}
            alt={duyuru.baslik}
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="object-contain"
            priority
          />
        </div>
      )}

      <div className="mt-10 whitespace-pre-line text-lg leading-relaxed text-murekkep-700">
        {duyuru.aciklama}
      </div>

      <div className="mt-12 border-t border-parsomen-200 pt-8">
        <Link
          href="/duyurular"
          className="text-sm text-muhur-600 underline-offset-4 transition hover:underline"
        >
          ← Tüm duyurular
        </Link>
      </div>

      {digerleri.length > 0 && (
        <section className="mt-16">
          <h2 className="font-baslik text-3xl font-semibold">Diğer Duyurular</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {digerleri.map((d) => (
              <DuyuruKart key={d.id} duyuru={d} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
