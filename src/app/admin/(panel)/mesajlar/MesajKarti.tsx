"use client";

import { useState, useTransition } from "react";
import { mesajSil, okunduDegistir } from "./actions";

type Mesaj = {
  id: string;
  adSoyad: string;
  email: string;
  konu: string;
  icerik: string;
  okundu: boolean;
  tarihYazisi: string;
};

export default function MesajKarti({ mesaj }: { mesaj: Mesaj }) {
  const [acik, setAcik] = useState(!mesaj.okundu);
  const [bekliyor, baslat] = useTransition();
  const [onayIstendi, setOnayIstendi] = useState(false);

  const yanitBaglantisi = `mailto:${mesaj.email}?subject=${encodeURIComponent(
    `Re: ${mesaj.konu}`
  )}`;

  return (
    <li
      className={`rounded-2xl border shadow-kart transition ${
        mesaj.okundu
          ? "border-parsomen-300 bg-parsomen-50"
          : "border-muhur-600/25 bg-parsomen-50 ring-1 ring-muhur-600/10"
      }`}
    >
      {/* Başlık satırı — tıklayınca açılıp kapanır */}
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        className="flex w-full items-start gap-4 p-5 text-left"
        aria-expanded={acik}
      >
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            mesaj.okundu ? "bg-parsomen-400" : "bg-muhur-600"
          }`}
          aria-label={mesaj.okundu ? "Okundu" : "Okunmadı"}
        />

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className={`truncate ${
                mesaj.okundu
                  ? "text-murekkep-700"
                  : "font-semibold text-murekkep-900"
              }`}
            >
              {mesaj.adSoyad}
            </span>
            <span className="text-xs text-murekkep-500">
              {mesaj.tarihYazisi}
            </span>
          </span>

          <span className="mt-1 block truncate text-sm text-murekkep-900">
            {mesaj.konu}
          </span>

          {!acik && (
            <span className="mt-1 block truncate text-xs text-murekkep-500">
              {mesaj.icerik}
            </span>
          )}
        </span>

        <svg
          className={`mt-1 shrink-0 text-murekkep-500 transition-transform ${
            acik ? "rotate-180" : ""
          }`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {acik && (
        <div className="border-t border-parsomen-200 px-5 py-5">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-murekkep-700">
            {mesaj.icerik}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-parsomen-200 pt-4">
            <a
              href={yanitBaglantisi}
              className="rounded-lg bg-muhur-600 px-4 py-2 text-xs font-medium text-parsomen-50 transition hover:bg-muhur-700"
            >
              E-posta ile yanıtla
            </a>

            <span className="text-xs text-murekkep-500">{mesaj.email}</span>

            <button
              type="button"
              disabled={bekliyor}
              onClick={() =>
                baslat(() => okunduDegistir(mesaj.id, !mesaj.okundu))
              }
              className="text-xs text-murekkep-500 underline-offset-4 transition hover:text-muhur-600 hover:underline disabled:opacity-50"
            >
              {mesaj.okundu ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
            </button>

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
                  <span className="text-xs text-murekkep-700">Silinsin mi?</span>
                  <button
                    type="button"
                    disabled={bekliyor}
                    onClick={() => baslat(() => mesajSil(mesaj.id))}
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
        </div>
      )}
    </li>
  );
}
