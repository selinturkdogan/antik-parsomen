"use client";

import Image from "next/image";
import Link from "next/link";
import DosyaSecici from "@/components/DosyaSecici";
import { useActionState, useState, useTransition } from "react";
import { girdiIcinTarih } from "@/lib/tarih";
import { duyuruKapakSil, duyuruKaydet, type DuyuruDurumu } from "./actions";

type Duyuru = {
  id: string;
  tur: "DUYURU" | "ETKINLIK";
  baslik: string;
  slug: string;
  aciklama: string;
  kapakUrl: string | null;
  tarih: Date | null;
  yer: string | null;
  yayinda: boolean;
};

const baslangic: DuyuruDurumu = {};

const etiket =
  "block text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500";
const kutu =
  "mt-2 w-full appearance-none rounded-xl border border-parsomen-300 bg-parsomen-50 px-4 py-3 text-[15px] outline-none transition focus:border-muhur-600 focus:ring-4 focus:ring-muhur-600/10";

export default function DuyuruFormu({ duyuru }: { duyuru?: Duyuru }) {
  const [durum, formGonder, bekliyor] = useActionState(duyuruKaydet, baslangic);
  const [tur, setTur] = useState<"DUYURU" | "ETKINLIK">(
    duyuru?.tur ?? "DUYURU"
  );
  const [kapakVar, setKapakVar] = useState(Boolean(duyuru?.kapakUrl));
  const [silmeIslemi, silmeyiBaslat] = useTransition();

  return (
    <form action={formGonder} className="space-y-7">
      {duyuru && <input type="hidden" name="id" value={duyuru.id} />}

      {/* ---------- Tür ---------- */}
      <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart sm:p-7">
        <p className={etiket}>Tür</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {(
            [
              ["DUYURU", "Duyuru", "Yeni ürün, kampanya, genel haber"],
              ["ETKINLIK", "Etkinlik", "Atölye, sergi, kermes, festival"],
            ] as const
          ).map(([deger, ad, aciklama]) => (
            <label
              key={deger}
              className={`flex-1 cursor-pointer rounded-xl border p-4 transition ${
                tur === deger
                  ? "border-muhur-600 bg-muhur-600/5"
                  : "border-parsomen-300 hover:border-murekkep-500"
              }`}
            >
              <input
                type="radio"
                name="tur"
                value={deger}
                checked={tur === deger}
                onChange={() => setTur(deger)}
                className="sr-only"
              />
              <span className="block font-medium text-murekkep-900">{ad}</span>
              <span className="mt-0.5 block text-xs text-murekkep-500">
                {aciklama}
              </span>
            </label>
          ))}
        </div>

        {/* ---------- Başlık ---------- */}
        <div className="mt-6">
          <label htmlFor="baslik" className={etiket}>
            Başlık
          </label>
          <input
            id="baslik"
            name="baslik"
            type="text"
            required
            defaultValue={duyuru?.baslik}
            placeholder={
              tur === "ETKINLIK"
                ? "Örn: Hat Sanatı Atölye Çalışması"
                : "Örn: Yeni Ürünlerimiz Yayında"
            }
            className={kutu}
          />
          {duyuru && (
            <p className="mt-2 text-xs text-murekkep-500">
              Adres:{" "}
              <code className="text-murekkep-700">
                /duyurular/{duyuru.slug}
              </code>{" "}
              — başlığı değiştirirseniz adres de güncellenir, eski adres yeni
              adrese yönlendirilir.
            </p>
          )}
        </div>

        {/* ---------- Tarih ve yer ---------- */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tarih" className={etiket}>
              {tur === "ETKINLIK" ? "Etkinlik tarihi" : "Tarih (isteğe bağlı)"}
            </label>
            <input
              id="tarih"
              name="tarih"
              type="datetime-local"
              required={tur === "ETKINLIK"}
              defaultValue={girdiIcinTarih(duyuru?.tarih ?? null)}
              className={kutu}
            />
            <p className="mt-2 text-xs text-murekkep-500">
              {tur === "ETKINLIK"
                ? "Sitede yaklaşan/geçmiş ayrımı bu tarihe göre yapılır."
                : "Boş bırakabilirsiniz."}
            </p>
          </div>

          <div>
            <label htmlFor="yer" className={etiket}>
              Yer {tur === "DUYURU" && "(isteğe bağlı)"}
            </label>
            <input
              id="yer"
              name="yer"
              type="text"
              defaultValue={duyuru?.yer ?? ""}
              placeholder="Örn: Atölyemiz / Kültür Merkezi"
              className={kutu}
            />
          </div>
        </div>

        {/* ---------- Açıklama ---------- */}
        <div className="mt-6">
          <label htmlFor="aciklama" className={etiket}>
            Açıklama
          </label>
          <textarea
            id="aciklama"
            name="aciklama"
            required
            rows={7}
            defaultValue={duyuru?.aciklama}
            placeholder="Neler olacak, kimler katılabilir, nasıl kayıt olunur..."
            className={`${kutu} resize-y leading-relaxed`}
          />
        </div>

        <div className="mt-6">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              name="yayinda"
              defaultChecked={duyuru ? duyuru.yayinda : true}
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

      {/* ---------- Kapak fotoğrafı ---------- */}
      <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart sm:p-7">
        <p className={etiket}>Kapak fotoğrafı</p>

        {duyuru?.kapakUrl && kapakVar && (
          <div className="group relative mt-4 w-fit">
            <div className="relative h-40 w-64 overflow-hidden rounded-xl border border-parsomen-300 bg-parsomen-200">
              <Image
                src={duyuru.kapakUrl}
                alt=""
                fill
                sizes="256px"
                className="object-contain p-1"
              />
            </div>
            <button
              type="button"
              disabled={silmeIslemi}
              onClick={() =>
                silmeyiBaslat(async () => {
                  await duyuruKapakSil(duyuru.id);
                  setKapakVar(false);
                })
              }
              className="absolute right-2 top-2 rounded-full bg-murekkep-900/75 p-1.5 text-parsomen-50 opacity-0 transition group-hover:opacity-100 hover:bg-muhur-600 disabled:opacity-50"
              aria-label="Kapağı kaldır"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )}

        <div className="mt-4">
          <DosyaSecici
            name="kapak"
            etiket="Kapak Fotoğrafı Seç"
            ipucu="Tek fotoğraf. Yenisini yüklerseniz eskisi otomatik silinir."
          />
        </div>
      </div>

      {/* ---------- Hata ve butonlar ---------- */}
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
            : duyuru
              ? "Değişiklikleri Kaydet"
              : tur === "ETKINLIK"
                ? "Etkinliği Ekle"
                : "Duyuruyu Ekle"}
        </button>

        <Link
          href="/admin/duyurular"
          className="rounded-xl border border-parsomen-400 px-6 py-3 text-sm text-murekkep-700 transition hover:bg-parsomen-200"
        >
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
