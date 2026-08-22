"use client";

import Image from "next/image";
import { useState } from "react";
import IsikKutusu from "./IsikKutusu";

type Gorsel = {
  id: string;
  url: string;
  alt: string | null;
  genislik: number | null;
  yukseklik: number | null;
};

export default function UrunGaleri({
  gorseller,
  urunAdi,
}: {
  gorseller: Gorsel[];
  urunAdi: string;
}) {
  const [aktif, setAktif] = useState(0);
  const [buyukAcik, setBuyukAcik] = useState(false);

  if (gorseller.length === 0) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2.5 rounded-2xl border border-parsomen-300 bg-parsomen-200 text-parsomen-400">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="M21 16l-5-5-4 4-2-2-7 7" />
        </svg>
        <span className="text-sm text-murekkep-500">Fotoğraf eklenmemiş</span>
      </div>
    );
  }

  const mevcut = gorseller[aktif];

  // Fotoğrafı kendi oranında göster — hiçbir şey kırpılmasın.
  // Aşırı uzun/geniş fotoğraflar sayfayı bozmasın diye sınırlıyoruz.
  const oran =
    mevcut.genislik && mevcut.yukseklik
      ? Math.min(Math.max(mevcut.genislik / mevcut.yukseklik, 0.62), 1.6)
      : 1;

  return (
    <>
      {/* Büyük görsel — fotoğrafın kendi oranında */}
      <button
        type="button"
        onClick={() => setBuyukAcik(true)}
        style={{ aspectRatio: String(oran) }}
        className="relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-parsomen-300 bg-parsomen-200 p-5 shadow-kart"
        aria-label="Fotoğrafı büyüt"
      >
        <Image
          src={mevcut.url}
          alt={mevcut.alt ?? urunAdi}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
          priority
        />
      </button>

      {/* Küçük görseller */}
      {gorseller.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {gorseller.map((g, i) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setAktif(i)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                i === aktif
                  ? "border-muhur-600"
                  : "border-parsomen-300 opacity-65 hover:opacity-100"
              }`}
              aria-label={`${i + 1}. fotoğraf`}
            >
              <Image
                src={g.url}
                alt=""
                fill
                sizes="120px"
                className="bg-parsomen-200 object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {buyukAcik && (
        <IsikKutusu
          fotograflar={gorseller}
          aktif={aktif}
          setAktif={setAktif}
          kapat={() => setBuyukAcik(false)}
          baslik={urunAdi}
        />
      )}
    </>
  );
}
