import Link from "next/link";
import { prisma } from "@/lib/prisma";

const menu = [
  { ad: "Ana Sayfa", yol: "/" },
  { ad: "Hakkımızda", yol: "/hakkimizda" },
  { ad: "Ürünler", yol: "/urunler" },
  { ad: "Duyurular", yol: "/duyurular" },
  { ad: "Galeri", yol: "/galeri" },
  { ad: "S.S.S.", yol: "/sss" },
  { ad: "İletişim", yol: "/iletisim" },
];

export default async function Footer() {
  const yil = new Date().getFullYear();
  const ayar = await prisma.siteAyar.findUnique({ where: { id: "tek" } });

  const sosyal = [
    { ad: "Instagram", url: ayar?.instagram },
    { ad: "Facebook", url: ayar?.facebook },
    { ad: "YouTube", url: ayar?.youtube },
  ].filter((s) => s.url && s.url.trim());

  return (
    <footer className="mt-20 border-t border-parsomen-300 bg-parsomen-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. sütun — logo ve açıklama */}
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-baslik text-2xl font-semibold">Antik Parşömen</p>
          <p className="mt-3 text-sm leading-relaxed text-murekkep-700">
            El yapımı parşömen sanatı, hat ve kaligrafi ile hazırlanan kişiye
            özel tasarımlar.
          </p>

          {sosyal.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {sosyal.map((s) => (
                <a
                  key={s.ad}
                  href={s.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-parsomen-400 px-3.5 py-1.5 text-xs text-murekkep-700 transition hover:border-muhur-600 hover:text-muhur-600"
                >
                  {s.ad}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* 2. sütun — hızlı menü */}
        <div>
          <h3 className="font-baslik text-lg font-semibold">Hızlı Menü</h3>
          <ul className="mt-4 space-y-2">
            {menu.map((m) => (
              <li key={m.yol}>
                <Link
                  href={m.yol}
                  className="text-sm text-murekkep-700 transition hover:text-muhur-600"
                >
                  {m.ad}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. sütun — iletişim */}
        <div>
          <h3 className="font-baslik text-lg font-semibold">İletişim</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-murekkep-700">
            {ayar?.telefon?.trim() && (
              <li>
                <a
                  href={`tel:+9${ayar.telefon.replace(/\D/g, "")}`}
                  className="transition hover:text-muhur-600"
                >
                  {ayar.telefon}
                </a>
              </li>
            )}
            {ayar?.email?.trim() && (
              <li className="break-all">{ayar.email}</li>
            )}
            {ayar?.adres?.trim() && (
              <li className="whitespace-pre-line leading-relaxed">
                {ayar.adres}
              </li>
            )}
            <li className="pt-1">
              <Link
                href="/iletisim"
                className="text-muhur-600 underline-offset-4 transition hover:underline"
              >
                Bize yazın →
              </Link>
            </li>
          </ul>
        </div>

        {/* 4. sütun — çalışma saatleri */}
        {ayar?.calismaSaatleri?.trim() && (
          <div>
            <h3 className="font-baslik text-lg font-semibold">
              Çalışma Saatleri
            </h3>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-murekkep-700">
              {ayar.calismaSaatleri}
            </p>
          </div>
        )}
      </div>

      {/* Alt şerit — telif hakkı */}
      <div className="border-t border-parsomen-300">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <p className="text-xs text-murekkep-500">
            © {yil} Antik Parşömen. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
