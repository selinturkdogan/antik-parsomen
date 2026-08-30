import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UrunKart from "@/components/UrunKart";
import DuyuruKart from "@/components/DuyuruKart";
import { turAdi } from "@/lib/galeri";

export const dynamic = "force-dynamic";

const VARSAYILAN_SLOGAN =
  "El Yapımı Parşömen Sanatı ve Kişiye Özel Tasarımlar";

const VARSAYILAN_ACIKLAMA =
  "Her parçası elde hazırlanan parşömenler, hat ve kaligrafi çalışmaları, size özel tasarımlar.";

export default async function AnaSayfa() {
  const simdi = new Date();

  const [ayar, oneCikanlar, yeniler, duyurular, albumler] = await Promise.all([
    prisma.siteAyar.findUnique({ where: { id: "tek" } }),

    // Öne çıkan ürünler
    prisma.urun.findMany({
      where: { yayinda: true, oneCikan: true },
      include: {
        kategori: true,
        gorseller: { orderBy: { sira: "asc" }, take: 1 },
      },
      orderBy: { olusturma: "desc" },
      take: 6,
    }),

    // Öne çıkan yoksa en yeniler gösterilecek
    prisma.urun.findMany({
      where: { yayinda: true },
      include: {
        kategori: true,
        gorseller: { orderBy: { sira: "asc" }, take: 1 },
      },
      orderBy: { olusturma: "desc" },
      take: 6,
    }),

    // Yaklaşan etkinlik varsa o, yoksa en son duyuru
    prisma.duyuru.findMany({
      where: { yayinda: true },
      orderBy: [{ tarih: "desc" }, { olusturma: "desc" }],
      take: 6,
    }),

    // Ana sayfada küçük bir galeri şeridi
    prisma.galeriAlbum.findMany({
      where: { yayinda: true, fotolar: { some: {} } },
      include: { fotolar: { orderBy: { sira: "asc" }, take: 1 } },
      orderBy: [{ tarih: "desc" }, { olusturma: "desc" }],
      take: 4,
    }),
  ]);

  const urunler = oneCikanlar.length > 0 ? oneCikanlar : yeniler;
  const urunBaslik =
    oneCikanlar.length > 0 ? "Öne Çıkan Ürünler" : "Yeni Eklenenler";

  // Yaklaşan etkinlikleri öne al, sonra duyuruları
  const yaklasan = duyurular.filter(
    (d) => d.tur === "ETKINLIK" && d.tarih && d.tarih >= simdi
  );
  const gosterilecekDuyurular = (
    yaklasan.length > 0 ? yaklasan : duyurular
  ).slice(0, 3);

  const slogan = ayar?.slogan?.trim() || VARSAYILAN_SLOGAN;
  const kapakAciklama = ayar?.kapakAciklama?.trim() || VARSAYILAN_ACIKLAMA;
  const kapak = ayar?.kapakUrl;

  return (
    <main>
      {/* ================= KAPAK ================= */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden border-b border-parsomen-300 sm:min-h-[88vh]">
        {kapak ? (
          <>
            <Image
              src={kapak}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />

            {/* Fotoğraf detaylıysa tek renk perde yazıyı okutmuyor.
                İki katman kullanıyoruz: geneli hafifçe koyultan bir kat,
                üstüne yazının bulunduğu alta doğru koyulaşan bir geçiş.
                Böylece fotoğraf görünür kalıyor, yazı her zaman okunuyor. */}
            <div className="absolute inset-0 bg-murekkep-900/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-murekkep-900 via-murekkep-900/70 to-murekkep-900/10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-parsomen-100" />
        )}

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-36 sm:pb-24 sm:pt-48">
          <div
            className={`h-px w-16 ${kapak ? "bg-altin-500" : "bg-altin-500/60"}`}
          />

          <p
            className={`mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] ${
              kapak ? "text-altin-500" : "text-muhur-600"
            }`}
          >
            Antik Parşömen
          </p>

          <h1
            className={`mt-5 max-w-3xl font-baslik text-5xl font-semibold leading-[1.08] sm:text-6xl lg:text-7xl ${
              kapak
                ? "text-parsomen-50 [text-shadow:0_2px_28px_rgb(42_33_24_/_0.65)]"
                : "text-murekkep-900"
            }`}
          >
            {slogan}
          </h1>

          <p
            className={`mt-7 max-w-xl text-lg leading-relaxed ${
              kapak ? "text-parsomen-50/90" : "text-murekkep-700"
            }`}
          >
            {kapakAciklama}
          </p>

          <div className="mt-11 flex flex-wrap gap-4">
            <Link
              href="/urunler"
              className="group inline-flex items-center gap-2.5 rounded-full bg-muhur-600 px-8 py-4 text-sm font-medium text-parsomen-50 shadow-kart-havada transition duration-300 hover:-translate-y-0.5 hover:bg-muhur-700"
            >
              Ürünleri İncele
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>

            <Link
              href="/iletisim"
              className={`inline-flex items-center rounded-full px-8 py-4 text-sm font-medium transition duration-300 hover:-translate-y-0.5 ${
                kapak
                  ? "border border-parsomen-50/35 bg-parsomen-50/10 text-parsomen-50 backdrop-blur-sm hover:border-parsomen-50/60 hover:bg-parsomen-50/20"
                  : "border border-parsomen-400 bg-parsomen-50 text-murekkep-700 shadow-kart hover:border-muhur-600 hover:text-muhur-600"
              }`}
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </section>

      {/* ================= ÜRÜNLER ================= */}
      {urunler.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <BolumBasligi
            etiket="Koleksiyon"
            baslik={urunBaslik}
            baglanti="/urunler"
            baglantiYazisi="Tümünü gör"
          />

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9">
            {urunler.map((u) => (
              <UrunKart key={u.id} urun={u} />
            ))}
          </div>
        </section>
      )}

      {/* ================= HAKKIMIZDA ================= */}
      {(ayar?.hikaye?.trim() || ayar?.sahipAdi?.trim()) && (
        <section className="border-y border-parsomen-300 bg-parsomen-200/50">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muhur-600">
                  Hakkımızda
                </p>
                <h2 className="mt-4 font-baslik text-4xl font-semibold leading-tight">
                  Kağıdın ve yazının hikâyesi
                </h2>
                <div className="mt-6 h-px w-20 bg-altin-500/50" />
              </div>

              <div>
                {ayar?.hikaye?.trim() && (
                  <p className="line-clamp-6 whitespace-pre-line text-lg leading-relaxed text-murekkep-700">
                    {ayar.hikaye}
                  </p>
                )}

                {ayar?.sahipAdi?.trim() && (
                  <p className="mt-5 text-sm text-murekkep-500">
                    — {ayar.sahipAdi}
                  </p>
                )}

                <Link
                  href="/hakkimizda"
                  className="mt-7 inline-block rounded-xl border border-parsomen-400 bg-parsomen-50 px-6 py-3 text-sm font-medium text-murekkep-700 transition hover:border-muhur-600 hover:text-muhur-600"
                >
                  Hikâyemizi okuyun
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= DUYURULAR ================= */}
      {gosterilecekDuyurular.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <BolumBasligi
            etiket="Neler Oluyor"
            baslik={
              yaklasan.length > 0
                ? "Yaklaşan Etkinlikler"
                : "Duyurular ve Etkinlikler"
            }
            baglanti="/duyurular"
            baglantiYazisi="Tümünü gör"
          />

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9">
            {gosterilecekDuyurular.map((d) => (
              <DuyuruKart key={d.id} duyuru={d} />
            ))}
          </div>
        </section>
      )}

      {/* ================= GALERİ ŞERİDİ ================= */}
      {albumler.length > 0 && (
        <section className="border-t border-parsomen-300 bg-parsomen-200/50">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <BolumBasligi
              etiket="Kareler"
              baslik="Atölyeden ve Etkinliklerden"
              baglanti="/galeri"
              baglantiYazisi="Galeriye git"
            />

            <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {albumler.map((a) => (
                <Link
                  key={a.id}
                  href={`/galeri/${a.slug}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-parsomen-300 bg-parsomen-200 shadow-kart transition hover:-translate-y-1 hover:shadow-kart-havada"
                >
                  {a.fotolar[0] && (
                    <Image
                      src={a.fotolar[0].url}
                      alt={a.ad}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}

                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-murekkep-900/85 to-transparent p-4">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-altin-500">
                      {turAdi(a.tur)}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-medium text-parsomen-50">
                      {a.ad}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= KAPANIŞ ================= */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 px-8 py-14 text-center shadow-kart sm:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muhur-600">
            Kişiye Özel
          </p>
          <h2 className="mt-4 font-baslik text-4xl font-semibold leading-tight">
            Aklınızdaki tasarımı birlikte hazırlayalım
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-murekkep-700">
            İsim, ayet, şiir veya kendi yazdığınız bir metin — hepsini el
            yapımı parşömen üzerine hazırlıyoruz.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/iletisim"
              className="rounded-xl bg-muhur-600 px-7 py-3.5 text-sm font-medium text-parsomen-50 shadow-kart transition hover:bg-muhur-700"
            >
              Bize Yazın
            </Link>
            <Link
              href="/sss"
              className="rounded-xl border border-parsomen-400 px-7 py-3.5 text-sm font-medium text-murekkep-700 transition hover:border-muhur-600 hover:text-muhur-600"
            >
              Sıkça Sorulan Sorular
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function BolumBasligi({
  etiket,
  baslik,
  baglanti,
  baglantiYazisi,
}: {
  etiket: string;
  baslik: string;
  baglanti: string;
  baglantiYazisi: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-parsomen-300 pb-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muhur-600">
          {etiket}
        </p>
        <h2 className="mt-3 font-baslik text-4xl font-semibold leading-tight">
          {baslik}
        </h2>
      </div>

      <Link
        href={baglanti}
        className="text-sm text-muhur-600 underline-offset-4 transition hover:underline"
      >
        {baglantiYazisi} →
      </Link>
    </div>
  );
}
