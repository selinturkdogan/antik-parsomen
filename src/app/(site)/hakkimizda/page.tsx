import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Hakkımızda",
};

export const dynamic = "force-dynamic";

export default async function HakkimizdaSayfasi() {
  // İki sorguyu aynı anda çalıştırıyoruz — sırayla beklemek yerine
  const [ayar, fotolar] = await Promise.all([
    prisma.siteAyar.findUnique({ where: { id: "tek" } }),
    // Atölye ve üretim albümlerinden birkaç fotoğraf
    prisma.galeriFoto.findMany({
      where: {
        album: { yayinda: true, tur: { in: ["ATOLYE", "URETIM"] } },
      },
      orderBy: [{ album: { tarih: "desc" } }, { sira: "asc" }],
      take: 6,
    }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-muhur-600">
        Bizi Tanıyın
      </p>
      <h1 className="mt-3 font-baslik text-5xl font-semibold">Hakkımızda</h1>

      {/* --- Dükkanın hikayesi --- */}
      {ayar?.hikaye && (
        <section className="mt-10">
          <h2 className="font-baslik text-3xl font-semibold">Hikâyemiz</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-murekkep-700">
            {ayar.hikaye}
          </p>
        </section>
      )}

      {/* --- Dükkan sahibi --- */}
      {ayar?.sahipAdi && (
        <section className="mt-12 rounded-lg border border-parsomen-300 bg-parsomen-50 p-8">
          <h2 className="font-baslik text-3xl font-semibold">
            {ayar.sahipAdi}
          </h2>
          {ayar.sahipBiyografi && (
            <p className="mt-3 whitespace-pre-line leading-relaxed text-murekkep-700">
              {ayar.sahipBiyografi}
            </p>
          )}
        </section>
      )}

      {/* --- Atölye fotoğrafları --- */}
      <section className="mt-12">
        <h2 className="font-baslik text-3xl font-semibold">Atölyemiz</h2>
        {fotolar.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-parsomen-400 bg-parsomen-50 p-10 text-center text-murekkep-500">
            Atölye fotoğrafları yakında eklenecek.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {fotolar.map((f) => (
                            <figure
                key={f.id}
                className="relative aspect-square overflow-hidden rounded-2xl border border-parsomen-300 bg-parsomen-200 shadow-kart"
              >
                <Image
                  src={f.url}
                  alt={f.aciklama ?? "Atölye fotoğrafı"}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* --- Malzemeler --- */}
      {ayar?.malzemeBilgi && (
        <section className="mt-12">
          <h2 className="font-baslik text-3xl font-semibold">
            Kullandığımız Malzemeler
          </h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-murekkep-700">
            {ayar.malzemeBilgi}
          </p>
        </section>
      )}
    </main>
  );
}