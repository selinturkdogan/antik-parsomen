import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UrunFiltre from "@/components/UrunFiltre";
import UrunKart from "@/components/UrunKart";
import Sayfalama from "@/components/Sayfalama";

export const metadata: Metadata = { title: "Ürünler" };
export const dynamic = "force-dynamic";

/** Bir sayfada kaç ürün gösterilecek */
const SAYFA_BASINA = 9;

export default async function UrunlerSayfasi(props: PageProps<"/urunler">) {
  // Bu sürümde searchParams bir Promise — await ile okunuyor
  const { q, kategori, sayfa } = await props.searchParams;

  const arama = typeof q === "string" ? q.trim() : "";
  const kategoriSlug = typeof kategori === "string" ? kategori : "";

  // Adresten gelen değere güvenmiyoruz: sayı değilse veya 1'den küçükse
  // ilk sayfayı gösteriyoruz.
  const istenenSayfa = Math.max(1, Number(sayfa) || 1);

  // Filtre koşulunu bir kez kurup hem sayımda hem listede kullanıyoruz;
  // ikisi ayrı yazılsa biri güncellenip diğeri unutulabilirdi.
  const kosul = {
    yayinda: true,
    ...(kategoriSlug ? { kategori: { slug: kategoriSlug } } : {}),
    ...(arama
      ? {
          OR: [
            { ad: { contains: arama, mode: "insensitive" as const } },
            { aciklama: { contains: arama, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [kategoriler, toplamUrun] = await Promise.all([
    // Filtrede yalnızca içinde yayında ürün olan kategoriler görünsün.
    // Ziyaretçi boş bir kategoriye tıklayıp "ürün bulunamadı" görmesin.
    // Seçili kategori boşalmışsa yine de listede kalsın, yoksa
    // kullanıcının seçtiği düğme birden kaybolur.
    prisma.kategori.findMany({
      where: {
        OR: [
          { urunler: { some: { yayinda: true } } },
          ...(kategoriSlug ? [{ slug: kategoriSlug }] : []),
        ],
      },
      orderBy: { sira: "asc" },
    }),
    prisma.urun.count({ where: kosul }),
  ]);

  const toplamSayfa = Math.max(1, Math.ceil(toplamUrun / SAYFA_BASINA));

  // Elle "?sayfa=99" yazılırsa son sayfayı gösteriyoruz; boş ekran çıkmasın
  const simdikiSayfa = Math.min(istenenSayfa, toplamSayfa);

  const urunler = await prisma.urun.findMany({
    where: kosul,
    include: {
      kategori: true,
      gorseller: { orderBy: { sira: "asc" }, take: 1 },
    },
    orderBy: [{ oneCikan: "desc" }, { olusturma: "desc" }],
    skip: (simdikiSayfa - 1) * SAYFA_BASINA,
    take: SAYFA_BASINA,
  });

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
          <span className="font-semibold text-murekkep-900">{toplamUrun}</span>{" "}
          ürün bulundu
          {arama && (
            <>
              {" "}
              — <span className="text-murekkep-700">&ldquo;{arama}&rdquo;</span>{" "}
              için
            </>
          )}
          {toplamSayfa > 1 && (
            <>
              {" · "}
              Sayfa {simdikiSayfa} / {toplamSayfa}
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
        <>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9">
            {urunler.map((u) => (
              <UrunKart key={u.id} urun={u} />
            ))}
          </div>

          <Sayfalama
            simdiki={simdikiSayfa}
            toplamSayfa={toplamSayfa}
            temelYol="/urunler"
            parametreler={{
              ...(arama ? { q: arama } : {}),
              ...(kategoriSlug ? { kategori: kategoriSlug } : {}),
            }}
          />
        </>
      )}
    </main>
  );
}
