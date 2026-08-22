import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GALERI_TURLERI, turAdi } from "@/lib/galeri";
import { kisaTarih } from "@/lib/tarih";

export const metadata: Metadata = {
  title: "Galeri",
  description:
    "Antik Parşömen atölyesinden, üretim aşamalarından ve etkinliklerden fotoğraflar.",
};

export const dynamic = "force-dynamic";

export default async function GaleriSayfasi(props: PageProps<"/galeri">) {
  const { tur } = await props.searchParams;
  const seciliTur = typeof tur === "string" ? tur : "";

  const albumler = await prisma.galeriAlbum.findMany({
    where: {
      yayinda: true,
      fotolar: { some: {} }, // boş albümler ziyaretçiye gösterilmesin
      ...(seciliTur ? { tur: seciliTur as never } : {}),
    },
    orderBy: [{ tarih: "desc" }, { olusturma: "desc" }],
    include: {
      fotolar: { orderBy: { sira: "asc" }, take: 1 },
      _count: { select: { fotolar: true } },
    },
  });

  // Filtre düğmelerinde sadece gerçekten albümü olan türler görünsün
  const doluTurler = await prisma.galeriAlbum.groupBy({
    by: ["tur"],
    where: { yayinda: true, fotolar: { some: {} } },
    _count: true,
  });
  const doluTurAdlari = new Set(doluTurler.map((t) => t.tur));

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <nav className="text-sm text-murekkep-500">
        <Link href="/" className="transition hover:text-muhur-600">
          Ana Sayfa
        </Link>
        <span className="mx-2.5 text-parsomen-400">/</span>
        <span className="text-murekkep-700">Galeri</span>
      </nav>

      <header className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muhur-600">
          Kareler
        </p>
        <h1 className="mt-4 font-baslik text-5xl font-semibold leading-tight sm:text-6xl">
          Galeri
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-murekkep-700">
          Atölyemizden, üretim aşamalarından ve katıldığımız etkinliklerden
          kareler.
        </p>
        <div className="mt-8 h-px w-24 bg-altin-500/50" />
      </header>

      {/* ---------- Tür filtresi ---------- */}
      {doluTurAdlari.size > 1 && (
        <div className="mt-12 flex flex-wrap gap-2.5">
          <FiltreDugmesi aktif={seciliTur === ""} href="/galeri">
            Tümü
          </FiltreDugmesi>
          {GALERI_TURLERI.filter((t) => doluTurAdlari.has(t.deger)).map((t) => (
            <FiltreDugmesi
              key={t.deger}
              aktif={seciliTur === t.deger}
              href={`/galeri?tur=${t.deger}`}
            >
              {t.ad}
            </FiltreDugmesi>
          ))}
        </div>
      )}

      {/* ---------- Albümler ---------- */}
      {albumler.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-20 text-center">
          <p className="font-baslik text-2xl font-semibold">
            {seciliTur ? "Bu türde albüm yok" : "Henüz fotoğraf yok"}
          </p>
          <p className="mt-3 text-murekkep-500">
            {seciliTur
              ? "Başka bir tür seçmeyi deneyin."
              : "Atölye ve etkinlik fotoğraflarımız yakında burada olacak."}
          </p>
          {seciliTur && (
            <Link
              href="/galeri"
              className="mt-6 inline-block rounded-xl bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700"
            >
              Tümünü Göster
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9">
          {albumler.map((a) => {
            const kapak = a.fotolar[0];

            return (
              <Link
                key={a.id}
                href={`/galeri/${a.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-parsomen-300 bg-parsomen-50 shadow-kart transition duration-300 hover:-translate-y-1.5 hover:border-parsomen-400 hover:shadow-kart-havada"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-parsomen-200">
                  {kapak && (
                    <Image
                      src={kapak.url}
                      alt={a.ad}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  )}

                  <span className="absolute left-4 top-4 z-10 rounded-full bg-parsomen-50/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-murekkep-700 shadow-kart">
                    {turAdi(a.tur)}
                  </span>

                  <span className="absolute bottom-4 right-4 z-10 rounded-full bg-murekkep-900/70 px-3 py-1.5 text-[11px] font-medium text-parsomen-50">
                    {a._count.fotolar} fotoğraf
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  {a.tarih && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muhur-600">
                      {kisaTarih(a.tarih)}
                    </p>
                  )}

                  <h2 className="mt-2.5 font-baslik text-2xl font-semibold leading-snug transition-colors duration-200 group-hover:text-muhur-600">
                    {a.ad}
                  </h2>

                  {a.aciklama && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-murekkep-700">
                      {a.aciklama}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

function FiltreDugmesi({
  aktif,
  href,
  children,
}: {
  aktif: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-5 py-2.5 text-sm transition duration-150 ${
        aktif
          ? "border-muhur-600 bg-muhur-600 text-parsomen-50 shadow-kart"
          : "border-parsomen-300 bg-parsomen-50 text-murekkep-700 hover:border-murekkep-500 hover:text-murekkep-900"
      }`}
    >
      {children}
    </Link>
  );
}
