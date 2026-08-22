import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";

export const dynamic = "force-dynamic";

const tarihBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function KontrolPaneli() {
  const oturum = await adminGerekli();

  // Bütün sayımları aynı anda çalıştırıyoruz — sırayla beklemek yerine
  const [
    urunSayisi,
    duyuruSayisi,
    etkinlikSayisi,
    galeriSayisi,
    mesajSayisi,
    okunmamisSayisi,
    sonUrunler,
    sonDuyurular,
  ] = await Promise.all([
    prisma.urun.count(),
    prisma.duyuru.count({ where: { tur: "DUYURU" } }),
    prisma.duyuru.count({ where: { tur: "ETKINLIK" } }),
    prisma.galeriFoto.count(),
    prisma.mesaj.count(),
    prisma.mesaj.count({ where: { okundu: false } }),
    prisma.urun.findMany({
      orderBy: { olusturma: "desc" },
      take: 5,
      include: { kategori: true },
    }),
    prisma.duyuru.findMany({ orderBy: { olusturma: "desc" }, take: 5 }),
  ]);

  const kartlar = [
    { ad: "Ürün", sayi: urunSayisi, yol: "/admin/urunler" },
    { ad: "Duyuru", sayi: duyuruSayisi, yol: "/admin/duyurular" },
    { ad: "Etkinlik", sayi: etkinlikSayisi, yol: "/admin/duyurular" },
    { ad: "Galeri fotoğrafı", sayi: galeriSayisi, yol: "/admin/galeri" },
    {
      ad: "Mesaj",
      sayi: mesajSayisi,
      yol: "/admin/mesajlar",
      rozet: okunmamisSayisi > 0 ? `${okunmamisSayisi} okunmamış` : null,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muhur-600">
        Kontrol Paneli
      </p>
      <h1 className="mt-3 font-baslik text-4xl font-semibold">
        Hoş geldiniz, {oturum.ad}
      </h1>
      <p className="mt-3 text-murekkep-700">
        Sitenizin güncel durumu aşağıda. Soldaki menüden içerikleri
        yönetebilirsiniz.
      </p>

      {/* ---------- Sayım kartları ---------- */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kartlar.map((k) => (
          <Link
            key={k.ad}
            href={k.yol}
            className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart transition hover:-translate-y-1 hover:shadow-kart-havada"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500">
              {k.ad}
            </p>
            <p className="mt-2 font-baslik text-4xl font-semibold">{k.sayi}</p>
            {k.rozet && (
              <p className="mt-2 inline-block rounded-full bg-muhur-600/10 px-2.5 py-1 text-[11px] font-medium text-muhur-700">
                {k.rozet}
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* ---------- Son eklenenler ---------- */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart">
          <div className="flex items-baseline justify-between">
            <h2 className="font-baslik text-xl font-semibold">
              Son Eklenen Ürünler
            </h2>
            <Link
              href="/admin/urunler"
              className="text-xs text-muhur-600 underline-offset-4 hover:underline"
            >
              Tümü
            </Link>
          </div>

          {sonUrunler.length === 0 ? (
            <p className="mt-5 text-sm text-murekkep-500">
              Henüz ürün eklenmemiş.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-parsomen-200">
              {sonUrunler.map((u) => (
                <li key={u.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-murekkep-900">
                    {u.ad}
                  </p>
                  <p className="mt-0.5 text-xs text-murekkep-500">
                    {u.kategori.ad} · {tarihBicimi.format(u.olusturma)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart">
          <div className="flex items-baseline justify-between">
            <h2 className="font-baslik text-xl font-semibold">
              Son Duyuru ve Etkinlikler
            </h2>
            <Link
              href="/admin/duyurular"
              className="text-xs text-muhur-600 underline-offset-4 hover:underline"
            >
              Tümü
            </Link>
          </div>

          {sonDuyurular.length === 0 ? (
            <p className="mt-5 text-sm text-murekkep-500">
              Henüz duyuru eklenmemiş.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-parsomen-200">
              {sonDuyurular.map((d) => (
                <li key={d.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-murekkep-900">
                    {d.baslik}
                  </p>
                  <p className="mt-0.5 text-xs text-murekkep-500">
                    {d.tur === "ETKINLIK" ? "Etkinlik" : "Duyuru"} ·{" "}
                    {tarihBicimi.format(d.olusturma)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
