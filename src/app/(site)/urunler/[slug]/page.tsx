import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import UrunGaleri from "@/components/UrunGaleri";
import UrunKart from "@/components/UrunKart";

export const dynamic = "force-dynamic";

// cache() sayesinde bu sorgu aynı istekte iki kez çağrılsa da
// veritabanına sadece bir kez gidiyor.
const urunGetir = cache(async (slug: string) => {
  return prisma.urun.findFirst({
    where: { slug, yayinda: true },
    include: { kategori: true, gorseller: { orderBy: { sira: "asc" } } },
  });
});

/**
 * Ürünün adı değişince adresi de değişiyor. Bu adres eskiden bir ürüne
 * aitse, ziyaretçiyi 404'e düşürmek yerine yeni adrese yolluyoruz.
 * 308 kalıcı yönlendirme: Google da sıralamayı yeni adrese taşır.
 */
const eskiAdresiCoz = cache(async (slug: string) => {
  const kayit = await prisma.urunEskiSlug.findUnique({
    where: { slug },
    include: { urun: { select: { slug: true, yayinda: true } } },
  });

  if (!kayit || !kayit.urun.yayinda) return null;
  return kayit.urun.slug;
});

// Tarayıcı sekmesi, Google sonuçları ve WhatsApp önizlemesi için
export async function generateMetadata({
  params,
}: PageProps<"/urunler/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const urun = await urunGetir(slug);

  if (!urun) return { title: "Ürün bulunamadı" };

  const ozet = urun.aciklama.slice(0, 155);
  return {
    title: urun.ad,
    description: ozet,
    openGraph: {
      title: urun.ad,
      description: ozet,
      images: urun.gorseller[0] ? [urun.gorseller[0].url] : [],
    },
  };
}

export default async function UrunDetaySayfasi({
  params,
}: PageProps<"/urunler/[slug]">) {
  const { slug } = await params;
  const urun = await urunGetir(slug);

  if (!urun) {
    // Bu adres eskiden bir ürüne aitse yeni adresine yönlendir
    const yeniSlug = await eskiAdresiCoz(slug);
    if (yeniSlug) permanentRedirect(`/urunler/${yeniSlug}`);

    notFound(); // gerçekten yoksa 404
  }

  const [benzerler, ayar] = await Promise.all([
    prisma.urun.findMany({
      where: {
        yayinda: true,
        kategoriId: urun.kategoriId,
        id: { not: urun.id }, // kendisi hariç
      },
      include: { kategori: true, gorseller: { orderBy: { sira: "asc" }, take: 1 } },
      orderBy: { olusturma: "desc" },
      take: 3,
    }),
    prisma.siteAyar.findUnique({ where: { id: "tek" } }),
  ]);

  const waMetni = encodeURIComponent(
    `Merhaba, "${urun.ad}" ürünü hakkında bilgi almak istiyorum.`
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-murekkep-500">
        <Link href="/" className="transition hover:text-muhur-600">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <Link href="/urunler" className="transition hover:text-muhur-600">Ürünler</Link>
        <span className="mx-2">/</span>
        <Link
          href={`/urunler?kategori=${urun.kategori.slug}`}
          className="transition hover:text-muhur-600"
        >
          {urun.kategori.ad}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-murekkep-700">{urun.ad}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Sol: galeri */}
        <div>
          <UrunGaleri gorseller={urun.gorseller} urunAdi={urun.ad} />
        </div>

        {/* Sağ: bilgiler */}
        <div>
          <Link
            href={`/urunler?kategori=${urun.kategori.slug}`}
            className="text-xs uppercase tracking-widest text-altin-500 transition hover:text-muhur-600"
          >
            {urun.kategori.ad}
          </Link>

          <h1 className="mt-2 font-baslik text-4xl font-semibold">{urun.ad}</h1>

          {urun.oneCikan && (
            <span className="mt-3 inline-block rounded bg-altin-500 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-parsomen-50">
              Öne Çıkan
            </span>
          )}

          <p className="mt-6 whitespace-pre-line leading-relaxed text-murekkep-700">
            {urun.aciklama}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {ayar?.whatsapp && (
              <a
                href={`https://wa.me/${ayar.whatsapp}?text=${waMetni}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700"
              >
                WhatsApp'tan Sipariş Ver
              </a>
            )}
            <Link
              href="/iletisim"
              className="rounded-md border border-parsomen-400 px-6 py-3 text-sm font-medium text-murekkep-700 transition hover:border-murekkep-500 hover:bg-parsomen-50"
            >
              Bilgi Al
            </Link>
          </div>

          <p className="mt-6 text-xs text-murekkep-500">
            Eklenme:{" "}
            {new Intl.DateTimeFormat("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(urun.olusturma)}
          </p>
        </div>
      </div>

      {/* Benzer ürünler */}
      {benzerler.length > 0 && (
        <section className="mt-20">
          <h2 className="font-baslik text-3xl font-semibold">Benzer Ürünler</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benzerler.map((u) => (
              <UrunKart key={u.id} urun={u} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}