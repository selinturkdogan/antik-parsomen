"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
  kategoriAdiDegistir,
  kategoriEkle,
  kategoriSil,
  kategoriTasi,
  type KategoriDurumu,
} from "./actions";

type Kategori = {
  id: string;
  ad: string;
  slug: string;
  urunSayisi: number;
};

const baslangic: KategoriDurumu = {};

export default function KategoriListesi({
  kategoriler,
}: {
  kategoriler: Kategori[];
}) {
  const [durum, ekleGonder, ekleniyor] = useActionState(
    kategoriEkle,
    baslangic
  );
  const [silmeHatasi, setSilmeHatasi] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* ---------- Yeni kategori ---------- */}
      <form
        action={ekleGonder}
        className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart"
      >
        <label
          htmlFor="ad"
          className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500"
        >
          Yeni kategori
        </label>

        <div className="mt-3 flex flex-wrap gap-3">
          <input
            id="ad"
            name="ad"
            type="text"
            required
            placeholder="Örn: Takı, Kitap Ayraçları..."
            className="h-12 min-w-0 flex-1 appearance-none rounded-xl border border-parsomen-300 bg-parsomen-100 px-4 text-[15px] outline-none transition focus:border-muhur-600 focus:ring-4 focus:ring-muhur-600/10"
          />
          <button
            type="submit"
            disabled={ekleniyor}
            className="h-12 rounded-xl bg-muhur-600 px-6 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700 disabled:opacity-60"
          >
            {ekleniyor ? "Ekleniyor..." : "Ekle"}
          </button>
        </div>

        {durum.hata && (
          <p role="alert" className="mt-3 text-sm text-muhur-700">
            {durum.hata}
          </p>
        )}
        {durum.basari && (
          <p className="mt-3 text-sm text-murekkep-700">{durum.basari}</p>
        )}
      </form>

      {/* ---------- Liste ---------- */}
      {silmeHatasi && (
        <p
          role="alert"
          className="rounded-lg border border-muhur-600/30 bg-muhur-600/10 px-4 py-3 text-sm text-muhur-700"
        >
          {silmeHatasi}
        </p>
      )}

      {kategoriler.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-14 text-center text-murekkep-500">
          Henüz kategori yok.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {kategoriler.map((k, i) => (
            <KategoriSatiri
              key={k.id}
              kategori={k}
              ilk={i === 0}
              son={i === kategoriler.length - 1}
              onSilmeHatasi={setSilmeHatasi}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function KategoriSatiri({
  kategori,
  ilk,
  son,
  onSilmeHatasi,
}: {
  kategori: Kategori;
  ilk: boolean;
  son: boolean;
  onSilmeHatasi: (m: string | null) => void;
}) {
  const [duzenleniyor, setDuzenleniyor] = useState(false);
  const [ad, setAd] = useState(kategori.ad);
  const [onayIstendi, setOnayIstendi] = useState(false);
  const [bekliyor, baslat] = useTransition();

  function kaydet() {
    const yeni = ad.trim();
    setDuzenleniyor(false);
    if (!yeni || yeni === kategori.ad) {
      setAd(kategori.ad);
      return;
    }
    baslat(() => kategoriAdiDegistir(kategori.id, yeni));
  }

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl border border-parsomen-300 bg-parsomen-50 p-4 shadow-kart">
      {/* Sıralama okları */}
      <div className="flex flex-col">
        <button
          type="button"
          disabled={ilk || bekliyor}
          onClick={() => baslat(() => kategoriTasi(kategori.id, "yukari"))}
          aria-label="Yukarı taşı"
          className="text-murekkep-500 transition hover:text-muhur-600 disabled:opacity-25"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 15l6-6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          disabled={son || bekliyor}
          onClick={() => baslat(() => kategoriTasi(kategori.id, "asagi"))}
          aria-label="Aşağı taşı"
          className="text-murekkep-500 transition hover:text-muhur-600 disabled:opacity-25"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Ad */}
      <div className="min-w-0 flex-1">
        {duzenleniyor ? (
          <input
            autoFocus
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            onBlur={kaydet}
            onKeyDown={(e) => {
              if (e.key === "Enter") kaydet();
              if (e.key === "Escape") {
                setAd(kategori.ad);
                setDuzenleniyor(false);
              }
            }}
            className="w-full appearance-none rounded-lg border border-muhur-600 bg-parsomen-100 px-3 py-1.5 text-[15px] outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setDuzenleniyor(true)}
            className="block truncate text-left font-medium text-murekkep-900 transition hover:text-muhur-600"
            title="Adını değiştirmek için tıklayın"
          >
            {kategori.ad}
          </button>
        )}
        <p className="mt-0.5 truncate text-xs text-murekkep-500">
          /urunler?kategori={kategori.slug}
        </p>
      </div>

      {/* Ürün sayısı */}
      <Link
        href={`/admin/urunler`}
        className="shrink-0 rounded-full bg-parsomen-200 px-3 py-1 text-[11px] text-murekkep-700"
      >
        {kategori.urunSayisi} ürün
      </Link>

      {/* Sil */}
      <div className="shrink-0">
        {!onayIstendi ? (
          <button
            type="button"
            onClick={() => {
              onSilmeHatasi(null);
              setOnayIstendi(true);
            }}
            className="text-xs text-murekkep-500 underline-offset-4 transition hover:text-muhur-600 hover:underline"
          >
            Sil
          </button>
        ) : (
          <span className="inline-flex items-center gap-2">
            <button
              type="button"
              disabled={bekliyor}
              onClick={() =>
                baslat(async () => {
                  const sonuc = await kategoriSil(kategori.id);
                  if (sonuc?.hata) onSilmeHatasi(sonuc.hata);
                  setOnayIstendi(false);
                })
              }
              className="rounded-md bg-muhur-600 px-2.5 py-1 text-[11px] font-medium text-parsomen-50 transition hover:bg-muhur-700 disabled:opacity-60"
            >
              {bekliyor ? "..." : "Evet, sil"}
            </button>
            <button
              type="button"
              onClick={() => setOnayIstendi(false)}
              className="text-[11px] text-murekkep-500 underline-offset-4 hover:underline"
            >
              Vazgeç
            </button>
          </span>
        )}
      </div>
    </li>
  );
}
