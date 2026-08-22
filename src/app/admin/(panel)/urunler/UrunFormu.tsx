"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { urunGorselSil, urunKaydet, type UrunDurumu } from "./actions";

type Kategori = { id: string; ad: string };

type Gorsel = {
  id: string;
  url: string;
  alt: string | null;
};

type Urun = {
  id: string;
  ad: string;
  slug: string;
  aciklama: string;
  kategoriId: string;
  oneCikan: boolean;
  yayinda: boolean;
  gorseller: Gorsel[];
};

const baslangic: UrunDurumu = {};

const etiket =
  "block text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500";
const kutu =
  "mt-2 w-full appearance-none rounded-xl border border-parsomen-300 bg-parsomen-50 px-4 py-3 text-[15px] outline-none transition focus:border-muhur-600 focus:ring-4 focus:ring-muhur-600/10";

export default function UrunFormu({
  kategoriler,
  urun,
}: {
  kategoriler: Kategori[];
  urun?: Urun;
}) {
  const [durum, formGonder, bekliyor] = useActionState(urunKaydet, baslangic);
  const [secilenler, setSecilenler] = useState<string[]>([]);
  const [silmeIslemi, silmeyiBaslat] = useTransition();

  // Kategori listeden mi seçilecek, yoksa yenisi mi yazılacak?
  // Hiç kategori yoksa doğrudan "yeni" moduna açılsın.
  const [yeniKategoriMi, setYeniKategoriMi] = useState(kategoriler.length === 0);

  return (
    <form action={formGonder} className="space-y-7">
      {urun && <input type="hidden" name="id" value={urun.id} />}

      {/* ---------- Temel bilgiler ---------- */}
      <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart sm:p-7">
        <div>
          <label htmlFor="ad" className={etiket}>
            Ürün adı
          </label>
          <input
            id="ad"
            name="ad"
            type="text"
            required
            defaultValue={urun?.ad}
            placeholder="Örn: İsme Özel Parşömen"
            className={kutu}
          />
          {urun && (
            <p className="mt-2 text-xs text-murekkep-500">
              Adres: <code className="text-murekkep-700">/urunler/{urun.slug}</code>{" "}
              — ürün adını değiştirirseniz adres de güncellenir. Eski adres
              kaydedilir ve yeni adrese yönlendirilir, böylece daha önce
              paylaştığınız bağlantılar çalışmaya devam eder.
            </p>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={yeniKategoriMi ? "yeniKategori" : "kategoriId"} className={etiket}>
              Kategori
            </label>
            <button
              type="button"
              onClick={() => setYeniKategoriMi((v) => !v)}
              className="text-xs text-muhur-600 underline-offset-4 transition hover:underline"
            >
              {yeniKategoriMi ? "Listeden seç" : "+ Yeni kategori oluştur"}
            </button>
          </div>

          {yeniKategoriMi ? (
            <>
              <input
                id="yeniKategori"
                name="yeniKategori"
                type="text"
                required
                placeholder="Örn: Takı, Kitap Ayraçları..."
                className={kutu}
              />
              <p className="mt-2 text-xs text-murekkep-500">
                Bu kategori kaydedince oluşturulur ve sitedeki filtreye eklenir.
                Aynı adda bir kategori zaten varsa yenisi açılmaz, mevcut olan
                kullanılır.
              </p>
            </>
          ) : (
            <select
              id="kategoriId"
              name="kategoriId"
              required
              defaultValue={urun?.kategoriId ?? ""}
              className={kutu}
            >
              <option value="" disabled>
                Kategori seçin...
              </option>
              {kategoriler.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-6">
          <label htmlFor="aciklama" className={etiket}>
            Açıklama
          </label>
          <textarea
            id="aciklama"
            name="aciklama"
            required
            rows={6}
            defaultValue={urun?.aciklama}
            placeholder="Ürünün nasıl hazırlandığı, ölçüleri, kullanılan malzemeler..."
            className={`${kutu} resize-y leading-relaxed`}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              name="oneCikan"
              defaultChecked={urun?.oneCikan}
              className="h-4 w-4 accent-muhur-600"
            />
            <span className="text-sm text-murekkep-700">
              Öne çıkan <span className="text-murekkep-500">(ana sayfada gösterilir)</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              name="yayinda"
              defaultChecked={urun ? urun.yayinda : true}
              className="h-4 w-4 accent-muhur-600"
            />
            <span className="text-sm text-murekkep-700">
              Yayında <span className="text-murekkep-500">(kapalıysa sitede görünmez)</span>
            </span>
          </label>
        </div>
      </div>

      {/* ---------- Fotoğraflar ---------- */}
      <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart sm:p-7">
        <p className={etiket}>Fotoğraflar</p>

        {urun && urun.gorseller.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {urun.gorseller.map((g, i) => (
              <div key={g.id} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-parsomen-300 bg-parsomen-200">
                  <Image
                    src={g.url}
                    alt={g.alt ?? ""}
                    fill
                    sizes="120px"
                    className="object-contain p-1"
                  />
                </div>

                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-altin-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-parsomen-50">
                    Kapak
                  </span>
                )}

                <button
                  type="button"
                  disabled={silmeIslemi}
                  onClick={() => silmeyiBaslat(() => urunGorselSil(g.id))}
                  className="absolute right-1.5 top-1.5 rounded-full bg-murekkep-900/75 p-1 text-parsomen-50 opacity-0 transition group-hover:opacity-100 hover:bg-muhur-600 disabled:opacity-50"
                  aria-label="Fotoğrafı sil"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <input
            type="file"
            name="gorseller"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) =>
              setSecilenler(Array.from(e.target.files ?? []).map((f) => f.name))
            }
            className="block w-full cursor-pointer rounded-xl border border-dashed border-parsomen-400 bg-parsomen-100 px-4 py-4 text-sm text-murekkep-700 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-muhur-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-parsomen-50 hover:file:bg-muhur-700"
          />

          {secilenler.length > 0 && (
            <ul className="mt-3 space-y-1">
              {secilenler.map((ad) => (
                <li key={ad} className="text-xs text-murekkep-500">
                  · {ad}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-xs text-murekkep-500">
            Birden fazla seçebilirsiniz. İlk fotoğraf kapak olur. JPEG, PNG, WebP
            veya AVIF — dosya başına en fazla 10 MB.
          </p>
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
            : urun
              ? "Değişiklikleri Kaydet"
              : "Ürünü Ekle"}
        </button>

        <Link
          href="/admin/urunler"
          className="rounded-xl border border-parsomen-400 px-6 py-3 text-sm text-murekkep-700 transition hover:bg-parsomen-200"
        >
          Vazgeç
        </Link>

        {bekliyor && secilenler.length > 0 && (
          <span className="text-xs text-murekkep-500">
            Fotoğraflar yükleniyor, sayfayı kapatmayın...
          </span>
        )}
      </div>
    </form>
  );
}
