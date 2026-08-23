"use client";

import { useActionState, useState, useTransition } from "react";
import {
  soruEkle,
  soruGuncelle,
  soruSil,
  soruTasi,
  soruYayindaDegistir,
  type SoruDurumu,
} from "./actions";

type Soru = {
  id: string;
  soru: string;
  cevap: string;
  yayinda: boolean;
};

const baslangic: SoruDurumu = {};

const etiket =
  "block text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500";
const kutu =
  "mt-2 w-full appearance-none rounded-xl border border-parsomen-300 bg-parsomen-100 px-4 py-3 text-[15px] outline-none transition focus:border-muhur-600 focus:ring-4 focus:ring-muhur-600/10";

export default function SoruListesi({ sorular }: { sorular: Soru[] }) {
  const [durum, ekleGonder, ekleniyor] = useActionState(soruEkle, baslangic);
  const [formAcik, setFormAcik] = useState(false);

  return (
    <div className="space-y-8">
      {/* ---------- Yeni soru ---------- */}
      {!formAcik ? (
        <button
          type="button"
          onClick={() => setFormAcik(true)}
          className="w-full rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-6 text-sm font-medium text-muhur-600 transition hover:border-muhur-600 hover:bg-parsomen-100"
        >
          + Yeni soru ekle
        </button>
      ) : (
        <form
          action={ekleGonder}
          className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart"
        >
          <div>
            <label htmlFor="soru" className={etiket}>
              Soru
            </label>
            <input
              id="soru"
              name="soru"
              type="text"
              required
              placeholder="Örn: Kargo ücreti ne kadar?"
              className={kutu}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="cevap" className={etiket}>
              Cevap
            </label>
            <textarea
              id="cevap"
              name="cevap"
              rows={4}
              required
              placeholder="Ziyaretçinin merak ettiğini net biçimde yanıtlayın..."
              className={`${kutu} resize-y leading-relaxed`}
            />
          </div>

          {durum.hata && (
            <p role="alert" className="mt-4 text-sm text-muhur-700">
              {durum.hata}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={ekleniyor}
              className="rounded-xl bg-muhur-600 px-6 py-2.5 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700 disabled:opacity-60"
            >
              {ekleniyor ? "Ekleniyor..." : "Ekle"}
            </button>
            <button
              type="button"
              onClick={() => setFormAcik(false)}
              className="rounded-xl border border-parsomen-400 px-5 py-2.5 text-sm text-murekkep-700 transition hover:bg-parsomen-200"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      {/* ---------- Liste ---------- */}
      {sorular.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-16 text-center text-murekkep-500">
          Henüz soru eklenmemiş.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorular.map((s, i) => (
            <SoruKarti
              key={s.id}
              soru={s}
              ilk={i === 0}
              son={i === sorular.length - 1}
              sira={i + 1}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SoruKarti({
  soru,
  ilk,
  son,
  sira,
}: {
  soru: Soru;
  ilk: boolean;
  son: boolean;
  sira: number;
}) {
  const [duzenleniyor, setDuzenleniyor] = useState(false);
  const [soruMetni, setSoruMetni] = useState(soru.soru);
  const [cevapMetni, setCevapMetni] = useState(soru.cevap);
  const [hata, setHata] = useState<string | null>(null);
  const [onayIstendi, setOnayIstendi] = useState(false);
  const [bekliyor, baslat] = useTransition();

  function kaydet() {
    setHata(null);
    baslat(async () => {
      const sonuc = await soruGuncelle(soru.id, soruMetni, cevapMetni);
      if (sonuc?.hata) setHata(sonuc.hata);
      else setDuzenleniyor(false);
    });
  }

  function vazgec() {
    setSoruMetni(soru.soru);
    setCevapMetni(soru.cevap);
    setHata(null);
    setDuzenleniyor(false);
  }

  return (
    <li
      className={`rounded-2xl border border-parsomen-300 bg-parsomen-50 p-5 shadow-kart ${
        soru.yayinda ? "" : "opacity-70"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Sıralama */}
        <div className="flex flex-col pt-0.5">
          <button
            type="button"
            disabled={ilk || bekliyor}
            onClick={() => baslat(() => soruTasi(soru.id, "yukari"))}
            aria-label="Yukarı taşı"
            className="text-murekkep-500 transition hover:text-muhur-600 disabled:opacity-25"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 15l6-6 6 6" />
            </svg>
          </button>
          <span className="my-0.5 text-center text-[10px] text-murekkep-500">
            {sira}
          </span>
          <button
            type="button"
            disabled={son || bekliyor}
            onClick={() => baslat(() => soruTasi(soru.id, "asagi"))}
            aria-label="Aşağı taşı"
            className="text-murekkep-500 transition hover:text-muhur-600 disabled:opacity-25"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {duzenleniyor ? (
            <>
              <input
                value={soruMetni}
                onChange={(e) => setSoruMetni(e.target.value)}
                className="w-full appearance-none rounded-lg border border-muhur-600 bg-parsomen-100 px-3 py-2 font-medium outline-none"
              />
              <textarea
                value={cevapMetni}
                onChange={(e) => setCevapMetni(e.target.value)}
                rows={4}
                className="mt-3 w-full resize-y appearance-none rounded-lg border border-parsomen-300 bg-parsomen-100 px-3 py-2 text-sm leading-relaxed outline-none focus:border-muhur-600"
              />

              {hata && (
                <p role="alert" className="mt-2 text-xs text-muhur-700">
                  {hata}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={bekliyor}
                  onClick={kaydet}
                  className="rounded-lg bg-muhur-600 px-4 py-2 text-xs font-medium text-parsomen-50 transition hover:bg-muhur-700 disabled:opacity-60"
                >
                  {bekliyor ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={vazgec}
                  className="text-xs text-murekkep-500 underline-offset-4 hover:underline"
                >
                  Vazgeç
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-medium text-murekkep-900">{soru.soru}</p>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-murekkep-700">
                {soru.cevap}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-parsomen-200 pt-3.5">
                <button
                  type="button"
                  onClick={() => setDuzenleniyor(true)}
                  className="text-xs text-muhur-600 underline-offset-4 transition hover:underline"
                >
                  Düzenle
                </button>

                <button
                  type="button"
                  disabled={bekliyor}
                  onClick={() =>
                    baslat(() => soruYayindaDegistir(soru.id, !soru.yayinda))
                  }
                  className="text-xs text-murekkep-500 underline-offset-4 transition hover:text-muhur-600 hover:underline disabled:opacity-50"
                >
                  {soru.yayinda ? "Gizle" : "Yayına al"}
                </button>

                {!soru.yayinda && (
                  <span className="rounded-full bg-parsomen-200 px-2.5 py-0.5 text-[10px] font-medium text-murekkep-500">
                    Gizli
                  </span>
                )}

                <span className="ml-auto">
                  {!onayIstendi ? (
                    <button
                      type="button"
                      onClick={() => setOnayIstendi(true)}
                      className="text-xs text-murekkep-500 underline-offset-4 transition hover:text-muhur-600 hover:underline"
                    >
                      Sil
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-xs text-murekkep-700">
                        Silinsin mi?
                      </span>
                      <button
                        type="button"
                        disabled={bekliyor}
                        onClick={() => baslat(() => soruSil(soru.id))}
                        className="rounded-md bg-muhur-600 px-2.5 py-1 text-[11px] font-medium text-parsomen-50 transition hover:bg-muhur-700 disabled:opacity-60"
                      >
                        {bekliyor ? "..." : "Evet"}
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
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
