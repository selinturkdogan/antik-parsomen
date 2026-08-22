import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DuyuruKart from "@/components/DuyuruKart";

export const metadata: Metadata = {
  title: "Duyurular ve Etkinlikler",
  description:
    "Antik Parşömen atölye çalışmaları, sergiler, kermesler ve yeni ürün duyuruları.",
};

export const dynamic = "force-dynamic";

export default async function DuyurularSayfasi() {
  const simdi = new Date();

  const [yaklasanlar, duyurular, gecmisler] = await Promise.all([
    // Yaklaşan etkinlikler: en yakın tarih en üstte
    prisma.duyuru.findMany({
      where: { yayinda: true, tur: "ETKINLIK", tarih: { gte: simdi } },
      orderBy: { tarih: "asc" },
    }),
    // Duyurular: en yeni en üstte
    prisma.duyuru.findMany({
      where: { yayinda: true, tur: "DUYURU" },
      orderBy: [{ tarih: "desc" }, { olusturma: "desc" }],
    }),
    // Geçmiş etkinlikler: en son yapılan en üstte
    prisma.duyuru.findMany({
      where: { yayinda: true, tur: "ETKINLIK", tarih: { lt: simdi } },
      orderBy: { tarih: "desc" },
      take: 6,
    }),
  ]);

  const hicYok =
    yaklasanlar.length === 0 &&
    duyurular.length === 0 &&
    gecmisler.length === 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <nav className="text-sm text-murekkep-500">
        <Link href="/" className="transition hover:text-muhur-600">
          Ana Sayfa
        </Link>
        <span className="mx-2.5 text-parsomen-400">/</span>
        <span className="text-murekkep-700">Duyurular</span>
      </nav>

      <header className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muhur-600">
          Neler Oluyor
        </p>
        <h1 className="mt-4 font-baslik text-5xl font-semibold leading-tight sm:text-6xl">
          Duyurular ve Etkinlikler
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-murekkep-700">
          Atölye çalışmaları, sergiler, kermesler ve yeni ürün haberleri.
        </p>
        <div className="mt-8 h-px w-24 bg-altin-500/50" />
      </header>

      {hicYok ? (
        <div className="mt-14 rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-20 text-center">
          <p className="font-baslik text-2xl font-semibold">
            Henüz duyuru yok
          </p>
          <p className="mt-3 text-murekkep-500">
            Yaklaşan etkinlikler ve haberler burada yayınlanacak.
          </p>
        </div>
      ) : (
        <>
          {yaklasanlar.length > 0 && (
            <Bolum baslik="Yaklaşan Etkinlikler" vurgulu>
              {yaklasanlar.map((d) => (
                <DuyuruKart key={d.id} duyuru={d} />
              ))}
            </Bolum>
          )}

          {duyurular.length > 0 && (
            <Bolum baslik="Duyurular">
              {duyurular.map((d) => (
                <DuyuruKart key={d.id} duyuru={d} />
              ))}
            </Bolum>
          )}

          {gecmisler.length > 0 && (
            <Bolum
              baslik="Geçmiş Etkinlikler"
              altyazi="Daha önce gerçekleştirdiğimiz çalışmalar"
            >
              {gecmisler.map((d) => (
                <DuyuruKart key={d.id} duyuru={d} soluk />
              ))}
            </Bolum>
          )}
        </>
      )}
    </main>
  );
}

function Bolum({
  baslik,
  altyazi,
  vurgulu = false,
  children,
}: {
  baslik: string;
  altyazi?: string;
  vurgulu?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-baseline gap-3 border-b border-parsomen-200 pb-4">
        <h2 className="font-baslik text-3xl font-semibold">{baslik}</h2>
        {vurgulu && (
          <span className="rounded-full bg-muhur-600/10 px-3 py-1 text-[11px] font-medium text-muhur-700">
            Kaçırmayın
          </span>
        )}
        {altyazi && (
          <span className="text-sm text-murekkep-500">{altyazi}</span>
        )}
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9">
        {children}
      </div>
    </section>
  );
}
