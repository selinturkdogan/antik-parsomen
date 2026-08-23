"use client";

import { useActionState, useRef } from "react";
import { mesajGonder, type MesajDurumu } from "./actions";

const baslangic: MesajDurumu = {};

const etiket =
  "block text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500";
const kutu =
  "mt-2 w-full appearance-none rounded-xl border border-parsomen-300 bg-parsomen-50 px-4 py-3 text-[15px] outline-none transition focus:border-muhur-600 focus:ring-4 focus:ring-muhur-600/10";

export default function IletisimFormu() {
  const [durum, formGonder, bekliyor] = useActionState(mesajGonder, baslangic);

  // Formun ne zaman açıldığını tutuyoruz: botlar anında gönderir
  const acilis = useRef(Date.now());

  if (durum.basari) {
    return (
      <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-10 text-center shadow-kart">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muhur-600/10 text-muhur-600">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
        </div>
        <h3 className="mt-5 font-baslik text-2xl font-semibold">
          Mesajınız bize ulaştı
        </h3>
        <p className="mt-3 leading-relaxed text-murekkep-700">
          En kısa sürede size dönüş yapacağız. İlginiz için teşekkür ederiz.
        </p>
      </div>
    );
  }

  return (
    <form action={formGonder} className="space-y-5">
      {/* Bot tuzağı — ekran okuyucular da atlasın diye aria-hidden */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Bu alanı boş bırakın</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="acilis" value={acilis.current} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="adSoyad" className={etiket}>
            Ad Soyad
          </label>
          <input
            id="adSoyad"
            name="adSoyad"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            className={kutu}
          />
        </div>

        <div>
          <label htmlFor="email" className={etiket}>
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ornek@eposta.com"
            className={kutu}
          />
        </div>
      </div>

      <div>
        <label htmlFor="konu" className={etiket}>
          Konu
        </label>
        <input
          id="konu"
          name="konu"
          type="text"
          required
          maxLength={150}
          placeholder="Örn: Kişiye özel parşömen siparişi"
          className={kutu}
        />
      </div>

      <div>
        <label htmlFor="icerik" className={etiket}>
          Mesajınız
        </label>
        <textarea
          id="icerik"
          name="icerik"
          required
          rows={7}
          maxLength={5000}
          placeholder="Ne tür bir çalışma istediğinizi, ölçü ve tarih beklentinizi yazabilirsiniz..."
          className={`${kutu} resize-y leading-relaxed`}
        />
      </div>

      {durum.hata && (
        <p
          role="alert"
          className="rounded-lg border border-muhur-600/30 bg-muhur-600/10 px-4 py-3 text-sm text-muhur-700"
        >
          {durum.hata}
        </p>
      )}

      <button
        type="submit"
        disabled={bekliyor}
        className="w-full rounded-xl bg-muhur-600 px-7 py-3.5 text-sm font-medium text-parsomen-50 shadow-kart transition hover:bg-muhur-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {bekliyor ? "Gönderiliyor..." : "Mesajı Gönder"}
      </button>

      <p className="text-xs leading-relaxed text-murekkep-500">
        Bilgileriniz yalnızca size dönüş yapmak için kullanılır, üçüncü
        kişilerle paylaşılmaz.
      </p>
    </form>
  );
}
