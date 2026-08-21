import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UrunFiltre from "@/components/UrunFiltre";
import UrunKart from "@/components/UrunKart";

export const metadata: Metadata = { title: "Ürünler" };
export const dynamic = "force-dynamic";

export default async function UrunlerSayfasi(props: PageProps<"/urunler">) {
  // Bu sürümde searchParams bir Promise — await ile okunuyor
  const { q, kategori } = await props.searchParams;

  const arama = typeof q === "string" ? q.trim() : "";
  const kategoriSlug = typeof kategori === "string" ? kategori : "";

  const [kategoriler, urunler] = await Promise.all([
    prisma.kategori.findMany({ orderBy: { sira: "asc" } }),
    prisma.urun.findMany({
      where: {
        yayinda: true,
        ...(kategoriSlug ? { kategori: { slug: kategoriSlug } } : {}),
        ...(arama
          ? {
              OR: [
                { ad: { contains: arama, mode: "insensitive" } },
                { aciklama: { contains: arama, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        kategori: true,
        gorseller: { orderBy: { sira: "asc" }, take: 1 },
      },
      orderBy: [{ oneCikan: "desc" }, { olusturma: "desc" }],
    }),
  ]);

  const secili = kategoriler.find((k) => k.slug === kategoriSlug);
  const filtreVar = Boolean(arama || kategoriSlug);

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      {/* ---------------- Breadcrumb ---------------- */}
      <nav className="text-sm text-murekkep-500">
        <Link href="/" className="transition hover:text-muhur-600">
          Ana Sayfa
        </Link>
        <span className="mx-2.5 text-parsomen-400">/</span>
        {secili ? (
          <>
            <Link href="/urunler" className="transition hover:text-muhur-600">
              Ürünler
            </Link>
            <span className="mx-2.5 text-parsomen-400">/</span>
            <span className="text-murekkep-700">{secili.ad}</span>
          </>
        ) : (
          <span className="text-murekkep-700">Ürünler</span>
        )}
      </nav>

      {/* ---------------- Başlık ---------------- */}
      <header className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muhur-600">
          Koleksiyon
        </p>
        <h1 className="mt-4 font-baslik text-5xl font-semibold leading-tight sm:text-6xl">
          Ürünler
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-murekkep-700">
          El yapımı parşömenler, hat ve kaligrafi çalışmaları, davetiyeler ve
          hediyelik ürünler.
        </p>
        {/* İnce altın vurgu çizgisi */}
        <div className="mt-8 h-px w-24 bg-altin-500/50" />
      </header>

      {/* ---------------- Filtre paneli ----------------
          Zemine gömülü görünsün diye kartlardan koyu: kartlar "yükselir",
          kontrol alanı "çukurda" kalır. Göz ikisini karıştırmıyor. */}
      <section className="mt-12 rounded-2xl border border-parsomen-300 bg-parsomen-200/60 p-7 shadow-panel sm:p-9">
        <UrunFiltre kategoriler={kategoriler} />
      </section>

      {/* ---------------- Sonuç satırı ---------------- */}
      <div className="mt-16 flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-sm text-murekkep-500">
          <span className="font-semibold text-murekkep-900">
            {urunler.length}
          </span>{" "}
          ürün listeleniyor
          {arama && (
            <>
              {" "}
              — <span className="text-murekkep-700">&ldquo;{arama}&rdquo;</span>{" "}
              için
            </>
          )}
        </p>

        {filtreVar && (
          <Link
            href="/urunler"
            className="flex items-center gap-1.5 text-sm text-muhur-600 underline-offset-4 transition hover:underline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            Filtreleri temizle
          </Link>
        )}
      </div>

      {/* ---------------- Ürünler ---------------- */}
      {urunler.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-20 text-center">
          <p className="font-baslik text-2xl font-semibold">Ürün bulunamadı</p>
          <p className="mt-3 text-murekkep-500">
            {filtreVar
              ? "Aramanızı veya filtrenizi değiştirmeyi deneyin."
              : "Henüz ürün eklenmemiş."}
          </p>
          {filtreVar && (
            <Link
              href="/urunler"
              className="mt-7 inline-block rounded-lg bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 shadow-kart transition hover:bg-muhur-700"
            >
              Filtreleri Temizle
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9">
          {urunler.map((u) => (
            <UrunKart key={u.id} urun={u} />
          ))}
        </div>
      )}
    </main>
  );
}
