"use client";

import Image from "next/image";
import { useEffect } from "react";

export type IsikKutusuFoto = {
  id: string;
  url: string;
  alt?: string | null;
  aciklama?: string | null;
};

/**
 * Tam ekran fotoğraf görüntüleyici.
 * Açık/kapalı durumunu ve hangi fotoğrafın gösterildiğini üst bileşen
 * yönetir; böylece hem ürün galerisi hem foto galeri aynı kutuyu kullanır.
 */
export default function IsikKutusu({
  fotograflar,
  aktif,
  setAktif,
  kapat,
  baslik,
}: {
  fotograflar: IsikKutusuFoto[];
  aktif: number;
  setAktif: (guncelle: (onceki: number) => number) => void;
  kapat: () => void;
  baslik: string;
}) {
  const adet = fotograflar.length;
  const sonraki = () => setAktif((i) => (i + 1) % adet);
  const onceki = () => setAktif((i) => (i - 1 + adet) % adet);

  useEffect(() => {
    function tusaBasildi(e: KeyboardEvent) {
      if (e.key === "Escape") kapat();
      if (e.key === "ArrowRight") sonraki();
      if (e.key === "ArrowLeft") onceki();
    }

    window.addEventListener("keydown", tusaBasildi);
    // Kutu açıkken arkadaki sayfa kaymasın
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", tusaBasildi);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adet]);

  const mevcut = fotograflar[aktif];
  if (!mevcut) return null;

  const yazi = mevcut.aciklama ?? mevcut.alt ?? "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-murekkep-900/92 p-4"
      onClick={kapat}
      role="dialog"
      aria-modal="true"
      aria-label={baslik}
    >
      <button
        type="button"
        onClick={kapat}
        className="absolute right-5 top-5 z-10 rounded-full bg-parsomen-50/10 p-2.5 text-parsomen-50 transition hover:bg-parsomen-50/25"
        aria-label="Kapat"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {adet > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onceki();
            }}
            className="absolute left-4 z-10 rounded-full bg-parsomen-50/10 p-3 text-parsomen-50 transition hover:bg-parsomen-50/25"
            aria-label="Önceki fotoğraf"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sonraki();
            }}
            className="absolute right-4 z-10 rounded-full bg-parsomen-50/10 p-3 text-parsomen-50 transition hover:bg-parsomen-50/25"
            aria-label="Sonraki fotoğraf"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Fotoğrafa tıklayınca kapanmasın, sadece dışına tıklayınca kapansın */}
      <div
        className="relative h-[82vh] w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={mevcut.url}
          alt={mevcut.alt ?? baslik}
          fill
          sizes="90vw"
          className="object-contain"
        />
      </div>

      <div className="absolute bottom-5 left-0 right-0 px-6 text-center">
        {yazi && (
          <p className="mx-auto max-w-2xl text-sm text-parsomen-50/90">{yazi}</p>
        )}
        {adet > 1 && (
          <p className="mt-1.5 text-xs text-parsomen-50/60">
            {aktif + 1} / {adet}
          </p>
        )}
      </div>
    </div>
  );
}
