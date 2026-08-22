"use client";

import { useState, useTransition } from "react";
import { albumSil, albumYayindaDegistir } from "./actions";

export function YayinAnahtari({ id, deger }: { id: string; deger: boolean }) {
  const [bekliyor, baslat] = useTransition();

  return (
    <button
      type="button"
      disabled={bekliyor}
      onClick={() => baslat(() => albumYayindaDegistir(id, !deger))}
      aria-pressed={deger}
      title={`${deger ? "Yayında" : "Gizli"} — değiştirmek için tıklayın`}
      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition disabled:opacity-50 ${
        deger
          ? "border-parsomen-400 bg-parsomen-200 text-murekkep-700"
          : "border-parsomen-300 bg-parsomen-50 text-murekkep-500"
      }`}
    >
      {deger ? "Yayında" : "Gizli"}
    </button>
  );
}

export function SilButonu({ id, ad, fotoSayisi }: { id: string; ad: string; fotoSayisi: number }) {
  const [onayIstendi, setOnayIstendi] = useState(false);
  const [bekliyor, baslat] = useTransition();

  if (!onayIstendi) {
    return (
      <button
        type="button"
        onClick={() => setOnayIstendi(true)}
        className="text-xs text-murekkep-500 underline-offset-4 transition hover:text-muhur-600 hover:underline"
      >
        Sil
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs text-murekkep-700">
        {fotoSayisi > 0
          ? `${fotoSayisi} fotoğrafla birlikte silinsin mi?`
          : `"${ad}" silinsin mi?`}
      </span>
      <button
        type="button"
        disabled={bekliyor}
        onClick={() => baslat(() => albumSil(id))}
        className="rounded-md bg-muhur-600 px-2.5 py-1 text-[11px] font-medium text-parsomen-50 transition hover:bg-muhur-700 disabled:opacity-60"
      >
        {bekliyor ? "Siliniyor..." : "Evet, sil"}
      </button>
      <button
        type="button"
        onClick={() => setOnayIstendi(false)}
        className="text-[11px] text-murekkep-500 underline-offset-4 hover:underline"
      >
        Vazgeç
      </button>
    </span>
  );
}
