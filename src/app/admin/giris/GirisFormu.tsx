"use client";

import { useActionState } from "react";
import { girisYap, type GirisDurumu } from "./actions";

const baslangic: GirisDurumu = {};

const kutuSinifi =
  "mt-2 h-13 w-full appearance-none rounded-xl border border-parsomen-300 bg-parsomen-50 px-4 text-[15px] outline-none transition focus:border-muhur-600 focus:ring-4 focus:ring-muhur-600/10";

const etiketSinifi =
  "block text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500";

export default function GirisFormu() {
  const [durum, formGonder, bekliyor] = useActionState(girisYap, baslangic);

  return (
    <form action={formGonder} className="space-y-5">
      <div>
        <label htmlFor="email" className={etiketSinifi}>
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={kutuSinifi}
        />
      </div>

      <div>
        <label htmlFor="sifre" className={etiketSinifi}>
          Şifre
        </label>
        <input
          id="sifre"
          name="sifre"
          type="password"
          autoComplete="current-password"
          required
          className={kutuSinifi}
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
        className="h-13 w-full rounded-xl bg-muhur-600 text-sm font-medium text-parsomen-50 shadow-kart transition hover:bg-muhur-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
