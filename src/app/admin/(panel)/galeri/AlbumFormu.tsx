"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import DosyaSecici from "@/components/DosyaSecici";
import { GALERI_TURLERI } from "@/lib/galeri";
import { girdiIcinTarih } from "@/lib/tarih";
import {
  albumKaydet,
  fotografAciklamaKaydet,
  fotografSil,
  fotografTasi,
  type AlbumDurumu,
} from "./actions";

type Foto = {
  id: string;
  url: string;
  aciklama: string | null;
};

type Album = {
  id: string;
  ad: string;
  slug: string;
  aciklama: string | null;
  tur: string;
  tarih: Date | null;
  yayinda: boolean;
  fotolar: Foto[];
};

const baslangic: AlbumDurumu = {};

const etiket =
  "block text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500";
const kutu =
  "mt-2 w-full appearance-none rounded-xl border border-parsomen-300 bg-parsomen-50 px-4 py-3 text-[15px] outline-none transition focus:border-muhur-600 focus:ring-4 focus:ring-muhur-600/10";

export default function AlbumFormu({ album }: { album?: Album }) {
  const [durum, formGonder, bekliyor] = useActionState(albumKaydet, baslangic);

  return (
    <div className="space-y-7">
      <form action={formGonder} className="space-y-7">
        {album && <input type="hidden" name="id" value={album.id} />}

        {/* ---------- Albüm bilgileri ---------- */}
        <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart sm:p-7">
          <div>
            <label htmlFor="ad" className={etiket}>
              Albüm adı
            </label>
            <input
              id="ad"
              name="ad"
              type="text"
              required
              defaultValue={album?.ad}
              placeholder="Örn: Bursa Kermesi 2026"
              className={kutu}
            />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="tur" className={etiket}>
                Tür
              </label>
              <select
                id="tur"
                name="tur"
                defaultValue={album?.tur ?? "ETKINLIK"}
                className={kutu}
              >
                {GALERI_TURLERI.map((t) => (
                  <option key={t.deger} value={t.deger}>
                    {t.ad}
                    {t.aciklama && ` — ${t.aciklama}`}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-murekkep-500">
                Ziyaretçiler galeriyi bu türlere göre filtreleyebilir.
              </p>
            </div>

            <div>
              <label htmlFor="tarih" className={etiket}>
                Tarih (isteğe bağlı)
              </label>
              <input
                id="tarih"
                name="tarih"
                type="datetime-local"
                defaultValue={girdiIcinTarih(album?.tarih ?? null)}
                className={kutu}
              />
              <p className="mt-2 text-xs text-murekkep-500">
                Albümler en yeniden eskiye sıralanır.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="aciklama" className={etiket}>
              Açıklama (isteğe bağlı)
            </label>
            <textarea
              id="aciklama"
              name="aciklama"
              rows={4}
              defaultValue={album?.aciklama ?? ""}
              placeholder="Bu etkinlikte neler oldu, nerede gerçekleşti..."
              className={`${kutu} resize-y leading-relaxed`}
            />
          </div>

          <div className="mt-6">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                name="yayinda"
                defaultChecked={album ? album.yayinda : true}
                className="h-4 w-4 accent-muhur-600"
              />
              <span className="text-sm text-murekkep-700">
                Yayında{" "}
                <span className="text-murekkep-500">
                  (kapalıysa sitede görünmez)
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* ---------- Fotoğraf ekleme ---------- */}
        <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart sm:p-7">
          <p className={etiket}>
            {album ? "Fotoğraf ekle" : "Fotoğraflar"}
          </p>

          <div className="mt-4">
            <DosyaSecici
              name="fotograflar"
              coklu
              etiket="Fotoğraf Seç"
              ipucu="Tek seferde en fazla 8-10 fotoğraf önerilir — kalanları kaydettikten sonra ekleyebilirsiniz."
            />
          </div>
        </div>

        {durum.hata && (
          <p
            role="alert"
            className="rounded-lg border border-muhur-600/30 bg-muhur-600/10 px-4 py-3 text-sm text-muhur-700"
          >
            {durum.hata}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={bekliyor}
            className="rounded-xl bg-muhur-600 px-7 py-3 text-sm font-medium text-parsomen-50 shadow-kart transition hover:bg-muhur-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bekliyor
              ? "Kaydediliyor..."
              : album
                ? "Değişiklikleri Kaydet"
                : "Albümü Oluştur"}
          </button>

          <Link
            href="/admin/galeri"
            className="rounded-xl border border-parsomen-400 px-6 py-3 text-sm text-murekkep-700 transition hover:bg-parsomen-200"
          >
            Vazgeç
          </Link>

        </div>
      </form>

      {/* ---------- Mevcut fotoğraflar (form dışında: iç içe form olmasın) ---------- */}
      {album && album.fotolar.length > 0 && (
        <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart sm:p-7">
          <p className={etiket}>Albümdeki fotoğraflar ({album.fotolar.length})</p>
          <p className="mt-2 text-xs text-murekkep-500">
            İlk fotoğraf albümün kapağı olur. Oklarla sırayı değiştirebilir,
            açıklama kutusuna yazıp fotoğrafa altyazı ekleyebilirsiniz.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {album.fotolar.map((f, i) => (
              <FotoKutusu
                key={f.id}
                foto={f}
                ilk={i === 0}
                son={i === album.fotolar.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FotoKutusu({
  foto,
  ilk,
  son,
}: {
  foto: Foto;
  ilk: boolean;
  son: boolean;
}) {
  const [aciklama, setAciklama] = useState(foto.aciklama ?? "");
  const [bekliyor, baslat] = useTransition();
  const [onayIstendi, setOnayIstendi] = useState(false);

  return (
    <div className="rounded-xl border border-parsomen-300 bg-parsomen-100 p-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-parsomen-200">
        <Image
          src={foto.url}
          alt={foto.aciklama ?? ""}
          fill
          sizes="240px"
          className="object-contain p-1"
        />
        {ilk && (
          <span className="absolute left-2 top-2 rounded bg-altin-500 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-parsomen-50">
            Kapak
          </span>
        )}
      </div>

      <input
        type="text"
        value={aciklama}
        onChange={(e) => setAciklama(e.target.value)}
        onBlur={() => {
          if ((foto.aciklama ?? "") !== aciklama) {
            baslat(() => fotografAciklamaKaydet(foto.id, aciklama));
          }
        }}
        placeholder="Açıklama (isteğe bağlı)"
        className="mt-3 w-full appearance-none rounded-lg border border-parsomen-300 bg-parsomen-50 px-3 py-2 text-xs outline-none transition focus:border-muhur-600"
      />

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          <button
            type="button"
            disabled={ilk || bekliyor}
            onClick={() => baslat(() => fotografTasi(foto.id, "sol"))}
            aria-label="Öne al"
            className="rounded p-1 text-murekkep-500 transition hover:bg-parsomen-200 hover:text-muhur-600 disabled:opacity-25"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            disabled={son || bekliyor}
            onClick={() => baslat(() => fotografTasi(foto.id, "sag"))}
            aria-label="Geri al"
            className="rounded p-1 text-murekkep-500 transition hover:bg-parsomen-200 hover:text-muhur-600 disabled:opacity-25"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {!onayIstendi ? (
          <button
            type="button"
            onClick={() => setOnayIstendi(true)}
            className="text-[11px] text-murekkep-500 underline-offset-4 transition hover:text-muhur-600 hover:underline"
          >
            Sil
          </button>
        ) : (
          <span className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={bekliyor}
              onClick={() => baslat(() => fotografSil(foto.id))}
              className="rounded bg-muhur-600 px-2 py-0.5 text-[10px] font-medium text-parsomen-50 transition hover:bg-muhur-700 disabled:opacity-60"
            >
              {bekliyor ? "..." : "Sil"}
            </button>
            <button
              type="button"
              onClick={() => setOnayIstendi(false)}
              className="text-[10px] text-murekkep-500 underline-offset-4 hover:underline"
            >
              Vazgeç
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
