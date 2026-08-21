"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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

  const sonraki = () => setAktif((i) => (i + 1) % gorseller.length);
  const onceki = () => setAktif((i) => (i - 1 + gorseller.length) % gorseller.length);

  useEffect(() => {
    if (!buyukAcik) return;

    function tusaBasildi(e: KeyboardEvent) {
      if (e.key === "Escape") setBuyukAcik(false);
      if (e.key === "ArrowRight") sonraki();
      if (e.key === "ArrowLeft") onceki();
    }

    window.addEventListener("keydown", tusaBasildi);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", tusaBasildi);
      document.body.style.overflow = "";
    };
  }, [buyukAcik, gorseller.length]);

  if (gorseller.length === 0) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2.5 rounded-2xl border border-parsomen-300 bg-parsomen-200 text-parsomen-400">
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
  // Aşırı uzun veya geniş fotoğraflar sayfayı bozmasın diye
  // oranı makul sınırlar içinde tutuyoruz.
  const oran =
    mevcut.genislik && mevcut.yukseklik
      ? Math.min(Math.max(mevcut.genislik / mevcut.yukseklik, 0.62), 1.6)
      : 1; // boyut bilinmiyorsa kare kutu

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

      {/* ---------- IŞIK KUTUSU ---------- */}
      {buyukAcik && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-murekkep-900/92 p-4"
          onClick={() => setBuyukAcik(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${urunAdi} fotoğrafı`}
        >
          <button
            type="button"
            onClick={() => setBuyukAcik(false)}
            className="absolute right-5 top-5 rounded-full bg-parsomen-50/10 p-2.5 text-parsomen-50 transition hover:bg-parsomen-50/25"
            aria-label="Kapat"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {gorseller.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onceki(); }}
                className="absolute left-4 z-10 rounded-full bg-parsomen-50/10 p-3 text-parsomen-50 transition hover:bg-parsomen-50/25"
                aria-label="Önceki fotoğraf"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); sonraki(); }}
                className="absolute right-4 z-10 rounded-full bg-parsomen-50/10 p-3 text-parsomen-50 transition hover:bg-parsomen-50/25"
                aria-label="Sonraki fotoğraf"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Görselin kendisine tıklayınca kapanmasın */}
          <div
            className="relative h-[85vh] w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={mevcut.url}
              alt={mevcut.alt ?? urunAdi}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          {gorseller.length > 1 && (
            <p className="absolute bottom-6 text-sm text-parsomen-50/80">
              {aktif + 1} / {gorseller.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}