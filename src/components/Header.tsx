"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Menü öğeleri — buraya ekleme yapınca hem masaüstü hem mobil menü güncellenir
const menu = [
  { ad: "Ana Sayfa", yol: "/" },
  { ad: "Hakkımızda", yol: "/hakkimizda" },
  { ad: "Ürünler", yol: "/urunler" },
  { ad: "Duyurular", yol: "/duyurular" },
  { ad: "Galeri", yol: "/galeri" },
  { ad: "S.S.S.", yol: "/sss" },
  { ad: "İletişim", yol: "/iletisim" },
];

export default function Header() {
  const pathname = usePathname(); // kullanıcının bulunduğu adres
  const [mobilAcik, setMobilAcik] = useState(false); // mobil menü açık mı?

  // Hangi menü öğesi vurgulanacak?
  const aktifMi = (yol: string) =>
    yol === "/" ? pathname === "/" : pathname.startsWith(yol);

  return (
    <header className="sticky top-0 z-50 border-b border-parsomen-300 bg-parsomen-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        {/* Logo + site adı */}
        <Link
          href="/"
          onClick={() => setMobilAcik(false)}
          className="flex items-center gap-3.5"
        >
          {/* Logo dosyası kumaşa basılı logonun fotoğrafı: arka planı
              şeffaf değil ve kremden turuncuya kayıyor. Kare olarak
              koyduğumuzda üst şeritte lekeli bir kutu gibi duruyordu.
              Amblem zaten yuvarlak olduğu için daire olarak kırpıyoruz —
              köşelerdeki arka plan tamamen kesiliyor, mühür rozeti gibi
              duruyor. mix-blend-multiply kalan kenar payını krem zemine
              karıştırıyor. */}
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-parsomen-300 sm:h-14 sm:w-14">
            <Image
              src="/logo.png"
              alt="Antik Parşömen logosu"
              fill
              sizes="56px"
              priority
              className="scale-[1.06] object-cover mix-blend-multiply"
            />
          </span>

          <span className="min-w-0">
            <span className="block font-baslik text-2xl font-semibold leading-none tracking-wide">
              Antik Parşömen
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.25em] text-altin-500">
              El Yapımı Parşömen Sanatı
            </span>
          </span>
        </Link>

        {/* Masaüstü menü — küçük ekranda gizli (hidden lg:flex) */}
        <nav className="hidden items-center gap-1 lg:flex">
          {menu.map((m) => (
            <Link
              key={m.yol}
              href={m.yol}
              className={`rounded-md px-3 py-2 text-sm transition ${
                aktifMi(m.yol)
                  ? "bg-parsomen-200 font-medium text-murekkep-900"
                  : "text-murekkep-700 hover:bg-parsomen-100 hover:text-murekkep-900"
              }`}
            >
              {m.ad}
            </Link>
          ))}
        </nav>

        {/* Mobil menü butonu — sadece küçük ekranda görünür (lg:hidden) */}
        <button
          type="button"
          onClick={() => setMobilAcik(!mobilAcik)}
          aria-expanded={mobilAcik}
          aria-label="Menüyü aç veya kapat"
          className="rounded-md border border-parsomen-300 p-2 text-murekkep-700 transition hover:bg-parsomen-100 lg:hidden"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {mobilAcik ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobil menü listesi — sadece buton tıklanınca görünür */}
      {mobilAcik && (
        <nav className="border-t border-parsomen-300 bg-parsomen-50 lg:hidden">
          <div className="mx-auto max-w-6xl px-4 py-2">
            {menu.map((m) => (
              <Link
                key={m.yol}
                href={m.yol}
                onClick={() => setMobilAcik(false)}
                className={`block rounded-md px-3 py-3 text-sm transition ${
                  aktifMi(m.yol)
                    ? "bg-parsomen-200 font-medium text-murekkep-900"
                    : "text-murekkep-700 hover:bg-parsomen-100"
                }`}
              >
                {m.ad}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
